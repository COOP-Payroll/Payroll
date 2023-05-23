const { Worker, workerData } = require("worker_threads");
const PayrollDefinition = require("../models/payrollDefinition");

const runWorker = (employeeId, req, payrollDefinitionId, res) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./controllers/newWorker.js", {
      workerData: { employeeId, user: req.user.id, payrollDefinitionId },
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
      res.write(
        `data: ${JSON.stringify({
          type: "progress",
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
  return res.json("Not Implemented!");
};
