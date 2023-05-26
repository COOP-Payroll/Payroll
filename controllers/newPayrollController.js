const PayrollDefinition = require("../models/payrollDefinition");
const Payroll = require("../models/Payroll");
const Employee = require("../models/employee");

exports.createPayroll = async (req, res) => {
  try {
    const { payrollDefinitionId, employeeIds } = req.body;
    const payrolldef = await PayrollDefinition.findByPk(payrollDefinitionId);
    if (!payrolldef) {
      return res.status(404).json({ error: "payroll is not defined" });
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
        }

        const payrollData = {
          PayrollDefinitionId: payrollDefinitionId,
          EmployeeId: employeeId,
        };

        await Payroll.create(payrollData);
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      return res
        .status(500)
        .json({ msg: "There is a problem creating payroll", errors });
    }

    return res.status(201).json({ msg: "Payroll created successfully!" });
  } catch (error) {
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
      return res.status(404).json({ error: "Payroll not found" });
    const payrolls = await Payroll.findAll({
      where: { PayrollDefinitionId: id },
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
