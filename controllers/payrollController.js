const { Worker, workerData } = require("worker_threads");
const PayrollDefinition = require("../models/payrollDefinition");
const Payroll = require("../models/Payroll");

const runWorker = (employeeId, req, payrollDefinitionId, res) => {

  let user=req.user.id;
    console.log("Employee Id", user);
  return new Promise((resolve, reject) => {
    const worker = new Worker("./controllers/newWorker.js", {
      workerData: { employeeId, user, payrollDefinitionId },
    });

    worker.on("message", (message) => {
      resolve(message);
    });

    worker.on("error", (error) => {
      console.log("first", error);
      reject(new Error("An error occurred while calculating payroll"));
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error("An error occurred while calculating payroll"));
      }
    });
  });
};

exports.createPayroll = async (req, res) => {
    
      let progress = 0;
  const { payrollDefinitionId, employeeIds } = req.body;
  const payrolldef = await PayrollDefinition.findByPk(payrollDefinitionId);

  if (!payrolldef) {
    return res.status(404).json({ error: "payroll is not defined" });
  }

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    const workerThreads = employeeIds?.map((employeeId) =>
      runWorker(employeeId, req, payrollDefinitionId, res)
    );

    const payrolls = await Promise.all(workerThreads);

    payrolls.forEach((payroll) => {
       progress++;
      res.write(
        `data: ${JSON.stringify({
          type: "progress",
          percentage: (progress / employeeIds.length) * 100,
          value: payroll.payroll,
        })}\n\n`
      );
    });

    res.write(`data: ${JSON.stringify({ type: "completed" })}\n\n`);
    res.end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "An error occurred while calculating payroll" });
  }

  // const workerThreads = employeeIds?.map((employeeId) => {
  //   return new Promise((resolve, reject) => {
  //     const worker = new Worker("./controllers/newWorker.js", {
  //       workerData: { employeeId, user: req.user.id, payrollDefinitionId },
  //     });
  //     worker.on("message", (message) => {
  //       res.write(
  //         `data: ${JSON.stringify({
  //           type: "progress",
  //           value: message.payroll,
  //         })}\n\n`
  //       );
  //     });

  //     worker.on("error", (error) => {
  //       console.error(error);
  //       reject(new Error("An error occurred while calculating payroll"));
  //     });

  //     // Listen for the worker thread to exit
  //     worker.on("exit", (code) => {
  //       if (code !== 0) {
  //         console.error(`Worker stopped with exit code ${code}`);
  //         reject(new Error("An error occurred while calculating payroll"));
  //       }
  //       resolve();
  //     });
  //   });
  // });

  // Promise.all(workerThreads)
  //   .then(() => {
  //     completed = true;
  //     // console.log("hey");
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //     res.status(500).send({ error: err.message });
  //   });

  // // Check if all workers have completed every 100ms
  // const interval = setInterval(() => {
  //   if (completed) {
  //     res.write(
  //       `data: ${JSON.stringify({
  //         type: "completed",
  //       })}\n\n`
  //     );
  //     res.end();
  //     clearInterval(interval);
  //   }
  // }, 100);
};

exports.getAllPayrollByCompanyId = async (req, res) => {
  // return res.json("Not Implemented!");
 try {

  const {payrollId, employeeIds} =req.body;

    const payroll = await Payroll.findByPk(payrollId);
    if (!payroll) {
      throw new Error("Payroll not found");
    }
    const selectedEmployees = await Employee.findAll({
      where: {
        id: employeeIds,
      },
    });
    for (const employee of selectedEmployees) {
      try {
        // Perform payroll calculations and processing for each selected employee
        // Assume the payroll processing failed for this employee
        employee.payrollStatus = "failed";
        // Save the changes to the employee
        await employee.save();
      } catch (error) {
        console.log(
          `Error processing payroll for employee ${employee.id}: ${error.message}`
        );
      }
    }
    payroll.status = "completed"; // Update overall payroll status
    await payroll.save();
    // Retrieve employees not selected for payroll
    const otherEmployees = await Employee.findAll({
      where: {
        id: { [Sequelize.Op.notIn]: employeeIds },
      },
    });
    // Retrieve employees with failed payroll
    const employeesWithFailedPayroll = selectedEmployees.filter(
      (employee) => employee.payrollStatus === "failed"
    );
    // Perform additional actions if needed, such as generating reports or notifications
    return { payroll, employeesWithFailedPayroll, otherEmployees };
  } catch (error) {
    throw new Error("Failed to run payroll");
  }
};

exports.getAllPayroll= async(req,res,next)=>{
  try {

const {payrollDefinitionId}=req.body;

const getAllPayroll=await Payroll.findAll();

res.status(200).json({
  count:getAllPayroll.length,
  getAllPayroll});

  } catch (error) {
    console.error("Error creating company account info:", error);

    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = error.errors.reduce((acc, err) => {
        acc[err.path] = [`${err.path} is required`];
        return acc;
      }, {});
      return res.status(400).json(errors);
    } else {
      // Handle other errors
      res.status(500).json({ error: "Failed to create account info" });
    }
  }
}




