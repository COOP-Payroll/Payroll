const PayrollDefinition = require("../models/payrollDefinition");
const { Worker, workerData } = require("worker_threads");
const runPayroll = require("./runPayroll");

exports.createPayroll = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { payrollDefinitionId, employeeIds } = req.body;
    const payroll = await PayrollDefinition.findByPk(payrollDefinitionId);
    if (!payroll) return res.status(404).json({ error: "Payroll not found" });
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    let completed = false;

    const workerThreads = employeeIds?.map((employeeId) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker("./controllers/runPayroll.js", {
          workerData: { employeeId, companyId },
        });
        worker.on("message", (message) => {
          res.write(
            `data: ${JSON.stringify({
              type: "progress",
              value: message.payroll,
            })}\n\n`
          );
        });

        worker.on("error", (error) => {
          console.log("what is the error", error);
          reject(new Error("An error occurred while calculating payroll"));
        });

        // Listen for the worker thread to exit
        // worker.on("exit", (code) => {
        //   if (code !== 0) {
        //     console.error(`Worker stopped with exit code ${code}`);
        //     reject(new Error("An error occurred while calculating payroll"));
        //   }
        //   resolve();
        // });
      });
    });

    Promise.all(workerThreads)
      .then(() => {
        completed = true;
        // console.log("hey");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send({ error: err.message });
      });

    // Check if all workers have completed every 100ms
    const interval = setInterval(() => {
      if (completed) {
        res.write(
          `data: ${JSON.stringify({
            type: "completed",
          })}\n\n`
        );
        res.end();
        clearInterval(interval);
      }
    }, 100);
  } catch (error) {}
};

exports.getAllPayrollByCompanyId = async (req, res) => {
  return res.json("Not Implemented!");
};
