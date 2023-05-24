const { Worker } = require("worker_threads");
const PayrollDefinition = require("../models/payrollDefinition");
const Payroll = require("../models/Payroll");
const Employee = require("../models/employee");

let totalWorkers = 0;
let completedWorkers = 0;

const runWorker = (employeeId, req, payrollDefinitionId, res) => {
  const worker = new Worker("./controllers/newWorker.js", {
    workerData: { employeeId, user: req.user.id, payrollDefinitionId },
  });

  const handleProgress = (message) => {
    completedWorkers++;
    const progress = ((completedWorkers / totalWorkers) * 100).toFixed(2);
    const data = JSON.stringify({
      progress: progress,
      type: "progress",
      value: message.payroll,
    });

    res.write(`data: ${data}\n\n`);

    if (completedWorkers === totalWorkers) {
      res.write(`data: ${JSON.stringify({ type: "completed" })}\n\n`);
      res.end();
    }
  };

  const handleError = (error) => {
    completedWorkers++;
    let status = 500;
    let errorMessage = `An error occurred while calculating payroll for ${employeeId}`;

    if (error.name === "SequelizeForeignKeyConstraintError") {
      status = 404;
      errorMessage = `${employeeId} employee does not exist!`;
    }
    const progress = ((completedWorkers / totalWorkers) * 100).toFixed(2);
    const data = JSON.stringify({
      progress: progress,
      type: "failed",
      error: errorMessage,
      value: error.payroll,
    });

    res.status(status).write(`data: ${data}\n\n`);

    if (completedWorkers === totalWorkers) {
      res.write(`data: ${JSON.stringify({ type: "completed" })}\n\n`);
      res.end();
    }
  };

  worker.on("message", handleProgress);
  worker.on("error", handleError);
};

exports.createPayroll = async (req, res) => {
  const { payrollDefinitionId, employeeIds } = req.body;
  const payrolldef = await PayrollDefinition.findByPk(payrollDefinitionId);
  totalWorkers = employeeIds.length;
  if (!payrolldef) {
    return res.status(404).json({ error: "payroll is not defined" });
  }

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const workerThreads = employeeIds?.map((employeeId) =>
    runWorker(employeeId, req, payrollDefinitionId, res)
  );

  if (completedWorkers === totalWorkers) {
    if (completedWorkers === totalWorkers) {
      res.write(`data: ${JSON.stringify({ type: "completed" })}\n\n`);
      res.end();
    }
  }
};

exports.getAllPayrollByCompanyId = async (req, res) => {
  const { id } = req.params;
  const payrollDef = await PayrollDefinition.findByPk(id);
  if (!payrollDef) return res.status(404).json({ error: "payroll not found" });
  const payrolls = await Payroll.findAll({
    where: { PayrollDefinitionId: Number(id) },
  });
  return res.status(200).json(payrolls);
};

exports.getNonPayrollEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const payrollDef = await PayrollDefinition.findByPk(id);
    if (!payrollDef)
      return res.status(404).json({ error: "payroll not found" });
    const employees = await Employee.findAll({
      include: [
        {
          model: Payroll,
          required: false,
          where: {
            PayrollDefinitionId: id, // Filter for payroll records of the specific month
          },
        },
      ],
      where: {
        "$Payroll.id$": null, // Filter for records where the payroll ID is null
      },
    });
    return res.status(200).json(employees);
  } catch (error) {
    res.json(error);
  }
};
