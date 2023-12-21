const Grade = require("../models/grade.js");

// const AllowanceDefinition = require("../models/allowanceDefinition.js");

const DeductionDefinition = require("../models/deductionDefinition.js");

const Pension = require("../models/pension");
const Taxslab = require("../models/taxslab");
const Employee = require("../models/employee");
const Loan = require("../models/loan");
const Allowance = require("../models/allowance");
const Deduction = require("../models/deduction");
const AllowanceDefinition = require("../models/allowanceDefinition");
const AdditionalAllowances = require("../models/additionalAllowance");
const Payroll = require("../models/Payroll");
const EmployeeInfo = require("../models/employeInfo");
const AdditionalAllowanceDefinition = require("../models/additionalAllowanceDefinition");
const AdditionalDeduction = require("../models/additionalDeduction");
const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition");
const AdditionalPayDefinition = require("../models/additionalPayDefinition.js");
const AdditionalPay = require("../models/additionalPay.js");
const PayrollDefinition = require("../models/payrollDefinition");
const EmployeeGrade = require("../models/EmployeeGrade");
const { run } = require("../utils/checkSubscriptionPlan.js");
const { child } = require("winston");
const { error } = require("shelljs");

exports.createPayroll1 = async (req, res, next) => {
  try {
    const { payrollDefinitionId, employeeIds } = req.body;
    const payrolldef = await PayrollDefinition.findByPk(payrollDefinitionId);
    const company = req.user.id;
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
          return res
            .status(200)
            .json({ message: "payroll run for employee " + employeeId });
        }
        const resp = await runPayroll(req, res, {
          employeeId,
          company,
          payrollDefinitionId,
        });
        // console.log("response", resp);
        // if (payroll) {
        //   await payroll.destroy();
        //   payrolldef.totalNoOfEmployee =
        //     Number(payrolldef.totalNoOfEmployee) - 1;
        //   payrolldef.totalNoOfprocessedEmployee =
        //     Number(payrolldef.totalNoOfprocessedEmployee) - 1;
        //   await payrolldef.save();
        // }

        // const payrollData = {
        //   PayrollDefinitionId: payrollDefinitionId,
        //   EmployeeId: employeeId,
        // };
        // console.log("payroll Data", payrollData);
        // await Payroll.create(payrollData);
        // payrollCount++;
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      console.log("error", errors);
      return res
        .status(500)
        .json({ msg: "There is a problem creating payroll", errors });
    }
    ///
    // // Update total payroll count in the database
    // payrolldef.totalNoOfEmployee =
    //   Number(payrolldef.totalNoOfEmployee) + Number(payrollCount);
    // await payrolldef.save();

    return res.status(201).json({ msg: "Payroll created successfully!  " });
  } catch (error) {
    console.log("err", error);
    return res
      .status(500)
      .json({ msg: "Error occurred while creating payroll:", error });
  }
};
async function runPayroll(
  req,
  res,
  { employeeId, company, payrollDefinitionId }
) {
  console.log("company", company);
  try {
    const Employees = await Employee.findOne({
      where: { id: employeeId, companyId: req.user.id },
      include: [
        {
          model: EmployeeInfo,
          required: false,
        },

        {
          model: Loan,
          required: false,
        },
        {
          model: Grade,

          through: {
            model: EmployeeGrade,
            where: {
              active: true,
            },
          },

          include: [
            {
              model: Allowance, // Use the correct alias defined in the association
              include: [AllowanceDefinition],
            },
            {
              model: Deduction, // Use the correct alias defined in the association
            //   include: [DeductionDefinition],
            },
            // { model: EmployeeGrade, where: { active: true } },
          ],
        },

        {
          model: AdditionalAllowances,
          include: [AdditionalAllowanceDefinition],
        },
        {
          model: AdditionalDeduction,
        //   include: [AdditionalDeductionDefinition],
        },
        {
          model: AdditionalPay,
        //   include: [AdditionalPayDefinition],
        },
      ],
    });
    console.log("employee", Employees);

    // return res.json(Employees);
  } catch (error) {
    console.log("from runpayroll ", error);
    return res.status(404).json({
      message: `error occur on empliyee with ID= ${employeeId}`,
    });
  }
}
