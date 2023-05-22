const Payroll = require("../models/Payroll");
const { Worker, workerData } = require("worker_threads");
const PayrollDefinition = require("../models/payrollDefinition");

exports.createPayroll = async (req, res) => {
  const { payrollDefinitionId, employeeIds } = req.body;

  const payrolldef = await PayrollDefinition.findByPk(payrollDefinitionId);

  if (!payrollDefinitionId)
    return res.status(404).json({ error: "payroll is not defined" });

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const workerThreads = employeeIds?.map((employeeId) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker("./controllers/newWorker.js", {
        workerData: { employeeId, user: req.user.id },
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
        console.error(error);
        reject(new Error("An error occurred while calculating payroll"));
      });

      // Listen for the worker thread to exit
      worker.on("exit", (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
          reject(new Error("An error occurred while calculating payroll"));
        }
        resolve();
      });
    });
  });

  // return res.json("Not Implemented!");
};

exports.getAllPayrollByCompanyId = async (req, res) => {
  return res.json("Not Implemented!");
};
