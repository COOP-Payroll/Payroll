const { Worker } = require("worker_threads");
const PayrollDefinition = require("../models/payrollDefinition");
const Payroll = require("../models/Payroll");
const Employee = require("../models/employee");
const WebSocket = require("ws");
const moment = require("moment");
const Grade = require("../models/grade.js");
const Allowance = require("../models/allowance.js");
const AllowanceDefinition = require("../models/allowanceDefinition");
const Deduction = require("../models/deduction");
const DeductionDefinition = require("../models/deductionDefinition.js");
let totalWorkers = 0;
let completedWorkers = 0;
let clients = [];

const runWorker = (employeeId, req, payrollDefinitionId) => {

  const worker = new Worker("./controllers/newWorker.js", {
    workerData: { user: req.user.id, employeeId, payrollDefinitionId },
  });

  const handleProgress = (message) => {
    console.log("first message", message);
    completedWorkers++;
    const progress = ((completedWorkers / totalWorkers) * 100).toFixed(2);
    const data = JSON.stringify({
      progress: progress,
      type: "progress",
      value: message.payroll,
    });

    clients.forEach((client) => {
      client.send(data);
    });

    if (completedWorkers === totalWorkers) {
      const completedMessage = JSON.stringify({ type: "completed" });
      clients.forEach((client) => {
        client.send(completedMessage);
      });
      completedWorkers = 0;
    }
  };

  const handleError = (error) => {
    completedWorkers++;
    let errorMessage = `An error occurred while calculating payroll for ${employeeId}`;

    if (error.name === "SequelizeForeignKeyConstraintError") {
      errorMessage = `${employeeId} employee does not exist!`;
    }
    const progress = ((completedWorkers / totalWorkers) * 100).toFixed(2);
    const data = JSON.stringify({
      progress: progress,
      type: "failed",
      error: errorMessage,
      value: error.payroll,
    });

    clients.forEach((client) => {
      client.send(data);
    });

    if (completedWorkers === totalWorkers) {
      const completedMessage = JSON.stringify({ type: "completed" });
      clients.forEach((client) => {
        client.send(completedMessage);
      });
      completedWorkers = 0;
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

  res.writeHead(200, {
    "Content-Type": "text/plain",
  });

  const ws = new WebSocket.Server({ port: 8080 });


 
// console.log("websocket",ws);
  ws.on("connection", (client) => {
    console.log("hey");
    clients.push(client);
    client.on("close", () => {
      clients = clients.filter((c) => c !== client);
    });
  });

  res.on("close", () => {
    ws.close();
  });
  // employeeIds.forEach((employeeId) => console.log("employeeId", employeeId));

  employeeIds.forEach((employeeId) =>
    runWorker(employeeId, req, payrollDefinitionId)
  );

  if (completedWorkers === totalWorkers) {
    const completedMessage = JSON.stringify({ type: "completed" });
    clients.forEach((client) => {
      client.send(completedMessage);
    });
    completedWorkers = 0;
  }
};

exports.getAllPayrollByCompanyId = async (req, res) => {
  const { id } = req.params;
  const payrollDef = await PayrollDefinition.findByPk(id);
  if (!payrollDef) return res.status(404).json({ error: "payroll not found" });
  const payrolls = await Payroll.findAll({
    where: { PayrollDefinitionId: Number(id) },
    include: [Employee, PayrollDefinition],
  });
  return res.status(200).json({
    count: payrolls.length,
    payrolls,
  });
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
        {
          model: Grade,
          include: [
            {
              model: Allowance, // Use the correct alias defined in the association
              include: [AllowanceDefinition],
            },
            {
              model: Deduction, // Use the correct alias defined in the association
              include: [DeductionDefinition],
            },
          ],
        },
      ],
      where: {
        "$Payroll.id$": null, // Filter for records where the payroll ID is null
      },
    });
    return res.status(200).json({ count: employees.length, employees });
  } catch (error) {
    res.json(error);
  }
};

exports.getAllPayroll = async (req, res, next) => {
  try {
    const { payrollDefinitionId } = req.body;

    const getAllPayroll = await Payroll.findAll();

    res.status(200).json({
      count: getAllPayroll.length,
      getAllPayroll,
    });
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
      return res.status(404).json({ message: errors });
    } else {
      // Handle other errors
      res.status(500).json({ error: "Failed to create account info" });
    }
  }
};

exports.getAllEmployeePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const payrollDef = await PayrollDefinition.findByPk(id);
    if (!payrollDef)
      return res.status(404).json({ error: "Payroll is not found" });
    // Fetch employees with and without payroll information for the specific month
    const employees = await Employee.findAll({
      include: [
        {
          model: Payroll,
          required: false,
          where: {
            PayrollDefinitionId: Number(id), // Filter for payroll records of the specific month
          },
        },
      ],
    });
    return res.json({
      count: employees.length,
      employees,
    });
  } catch (error) {
    res.json(error);
  }
};

exports.employeePaySlip = async (req, res, next) => {
  try {
    const id = req.params.id;
    const payrolls = await Payroll.findAll({
      where: { EmployeeId: id },
      //  include: [Employee, PayrollDefinition],
    });
    if (payrolls.length === 0) {
      return res.status(404).json("there is no payroll ");
    } else {
         res.status(200).json({
        count: payrolls.length,
        payrolls,
        createdDate: moment(payrolls[0].createdAt).format("YYYY-MM-DD"),
      });
    }
  } catch (error) {
    next(error);
  }
};
