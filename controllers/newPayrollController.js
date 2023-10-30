const PayrollDefinition = require("../models/payrollDefinition");
const Payroll = require("../models/Payroll");
const Employee = require("../models/employee");
const Grade = require("../models/grade.js");
const Allowance = require("../models/allowance.js");
const AllowanceDefinition = require("../models/allowanceDefinition.js");
const Deduction = require("../models/deduction.js");
const DeductionDefinition = require("../models/deductionDefinition.js");

exports.createPayroll = async (req, res) => {
  try {
    const { payrollDefinitionId, employeeIds } = req.body;
    const payrolldef = await PayrollDefinition.findByPk(payrollDefinitionId);
    if (!payrolldef) {
      return res.status(404).json({ message: "payroll is not defined" });
    }

    const employees = await Employee.findAll({
      where: {
        id: employeeIds,
      },
    });

    const existingEmployeeIds = employees.map((employee) => employee.id);
    const nonExistingEmployeeIds = employeeIds.filter(
      (id) => !existingEmployeeIds.includes(id)
    );

    if (nonExistingEmployeeIds.length > 0) {
      return res.status(404).json({
        error: "employee not found",
        employees: nonExistingEmployeeIds,
      });
    }

    const errors = [];
    let payrollCount = 0;

    await payrolldef.update({ status: "ordered" });
    for (const employeeId of employeeIds) {
      try {
        const payroll = await Payroll.findOne({
          where: {
            EmployeeId: employeeId,
            PayrollDefinitionId: payrollDefinitionId,
          },
        });

        if (payroll) {
          await payroll.destroy();
          payrolldef.totalNoOfEmployee =
            Number(payrolldef.totalNoOfEmployee) - 1;
          payrolldef.totalNoOfprocessedEmployee =
            Number(payrolldef.totalNoOfprocessedEmployee) - 1;
          await payrolldef.save();
        }

        const payrollData = {
          PayrollDefinitionId: payrollDefinitionId,
          EmployeeId: employeeId,
        };

    const data=    await Payroll.create(payrollData);
        payrollCount++;
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      return res
        .status(500)
        .json({ msg: "There is a problem creating payroll", errors });
    }

    // Update total payroll count in the database
    payrolldef.totalNoOfEmployee =
      Number(payrolldef.totalNoOfEmployee) + Number(payrollCount);
   await payrolldef.save();

    return res.status(201).json({ msg: "Payroll created successfully!",data });
  } catch (error) {
    console.log("err", error);
    return res
      .status(500)
      .json({ msg: "Error occurred while creating payroll:", error });
  }
};

exports.getPayrollByPayrollDefId = async (req, res) => {
  try {
    const { id } = req.params;
    const payrollDef = await PayrollDefinition.findByPk(id);
    if (!payrollDef)
      return res.status(404).json({ message: "Payroll not found" });
    const payrolls = await Payroll.findAll({
      where: { PayrollDefinitionId: id },
      include: [Employee, PayrollDefinition],
    });
    return res.json({ count: payrolls.length, payrolls });
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.getNonPayrollEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const payrollDef = await PayrollDefinition.findByPk(id);
    if (!payrollDef)
      return res.status(404).json({ message: "payroll not found" });
    const employees = await Employee.findAll({
      where: {
        PayrollDefinitionId: id, // Filter for payroll records of the specific month
      },
      include: [
        {
          model: Payroll,
          required: false,
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
    return res.status(200).json({
      count: employees.length,
      employees,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
//update payroll data

exports.updatePayrollData = async (req, res, next) => {
  try {
    const payrollId = req.params.payrollId;
    const employeeData = req.body;
    const payroll = await Payroll.findByPk(Number(payrollId));
    if (!payroll) {
      return res.status(404).json({ message: "payroll does not exist" });
    } else {
      await payroll.update(employeeData);

      // Return the updated company object
      return res.json(payroll);
    }
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

///
// Assuming the payroll data is stored in a variable called "payrollData"

// Get the current date
// const currentDate = new Date();

// // Filter the payroll array to include only the current month's payroll
// const currentMonthPayroll = payrollData.payroll.filter((payroll) => {
//   const startDate = new Date(payroll.startDate);
//   const endDate = new Date(payroll.endDate);

//   return startDate <= currentDate && endDate >= currentDate;
// });

// // Print the current month's payroll
// console.log(currentMonthPayroll);

exports.getAll = async (req, res) => {
  try {
  } catch (error) {
    console.log("error", error);
  }
};
