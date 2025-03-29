const Grade = require("../models/grade.js");
const DeductionDefinition = require("../models/deductionDefinition.js");
const { Op } = require("sequelize");
const sequelize = require("../database/db");
const { Sequelize } = require("sequelize");
const Pension = require("../models/pension");
const ProvidentFund = require("../models/providentFund.js");
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
const createError = require("../utils/error");

exports.createPayroll1 = async (req, res, next) => {
  try {
    // return res.json("ddkddjd");
    const isProjectBased = req.user.isProjectBased;
    const { payrollDefinitionId, employeeIds } = req.body;

    const employeeID = employeeIds.map((id) => parseInt(id));
    const payrolldef = await PayrollDefinition.findByPk(payrollDefinitionId);
    const company =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    // return res.json(req.user.isProjectBased)
    if (!payrolldef) {
      return res.status(404).json({ message: "payroll is not defined" });
    }

    const employees = await Employee.findAll({
      where: {
        id: employeeID,
        CompanyId: CompanyId,
      },
    });
    const existingEmployeeIds = employees.map((employee) => employee.id);

    const nonExistingEmployeeIds = employeeID.filter(
      (id) => !existingEmployeeIds.includes(id)
    );

    if (nonExistingEmployeeIds.length > 0) {
      return res.status(404).json({
        message: "Some Employee not found",
        employees: nonExistingEmployeeIds,
      });
    }

    const existingPayrolls = await Payroll.findAll({
      where: {
        EmployeeId: {
          [Op.in]: employeeIds, // Use Op.in to match any employee in the employeeIds array
        },
        PayrollDefinitionId: payrollDefinitionId,
      },
    });

    if (existingPayrolls.length > 0) {
      return next(
        createError.createError(
          400,
          "Payroll has already been run for one or more employees."
        )
      );
    }

    // return res.json("Gemechu")
    const errors = [];
    if (isProjectBased) {
      return res.json("Project based");
      const isTotalPercentEqual100 = employees.every(
        (employee) => employee?.totalPercent === 100
      );
      if (!isTotalPercentEqual100) {
        return next(
          createError.createError(
            400,
            "Some employees have not been fully assigned projects. Please ensure all employees are assigned projects totaling 100%."
          )
        );
      }

      const payroll = await Payroll.findOne({
        where: {
          EmployeeId: employeeID,
          PayrollDefinitionId: payrollDefinitionId,
        },
      });

      if (payroll != null) {
        // return res.json("data")
        return next(
          createError.createError(
            400,
            "Payroll has already been run for one or more employees1."
          )
        );
      }
      for (const employeeId of employeeID) {
        try {
          const resp = await runForProjectBasedPayroll(req, res, {
            employeeId,
            company,
            payrollDefinitionId,
          });
        } catch (error) {
          errors.push(error);
        }
      }
    }
    if (!isProjectBased) {
      let payrollCount = 0;
      await payrolldef.update({ status: "ordered" });
      for (const employeeId of employeeID) {
        try {
          // const payroll = await Payroll.findOne({
          //   where: {
          //     EmployeeId: employeeID,
          //     PayrollDefinitionId: payrollDefinitionId,
          //   },
          // });

          // if (payroll != null) {
          //   // return res.json("data")
          //   return next(
          //     createError.createError(
          //       400,
          //       "Payroll has already been run for one or more employees."
          //     )
          //   );
          // }

          const resp = await runPayroll(req, res, next, {
            employeeId,
            company,
            payrollDefinitionId,
          });
        } catch (error) {
          errors.push(error);
        }
      }

      if (errors.length > 0) {
        return next(createError(503, "There is a problem creating payroll "));
      }
      ///
      // // Update total payroll count in the database
      // payrolldef.totalNoOfEmployee =
      //   Number(payrolldef.totalNoOfEmployee) + Number(payrollCount);
      // await payrolldef.save();
    }

    return res.status(201).json({ message: "Payroll created successfully!  " });
  } catch (error) {
    console.log(error);

    return next(
      createError.createError(503, "Error occurred while creating payroll ")
    );
    // return res
    //   .status(503)
    //   .json({ message: "Error occurred while creating payroll:" });
  }
};

async function runPayroll(
  req,
  res,
  next,
  { employeeId, company, payrollDefinitionId }
) {
  try {
    const employeeGrade = await EmployeeGrade.findOne({
      where: { EmployeeId: employeeId, active: true },
    });
    // const allowances1=
    const [
      pension,
      payrollDefinition,
      oldPayroll,
      employee,
      loans,
      allowances,
      deductions,
      additionalAllowances,
      additionalDeductions,

      // additionalPayDefinition,
      additionalPay,
      otpayment,
    ] = await Promise.all([
      Pension.findOne({
        where: {
          CompanyId: company,
          isActive: true,
        },
      }),
      PayrollDefinition.findByPk(Number(payrollDefinitionId)),
      Payroll.findOne({
        where: {
          PayrollDefinitionId: payrollDefinitionId,
          EmployeeId: employeeId,
        },
      }),
      Employee.findByPk(Number(employeeId), {
        include: [
          { model: Loan },
          { model: EmployeeInfo, where: { isActive: true } },
        ],
      }),
      Loan.findAll({ where: { EmployeeId: employeeId } }),
      Allowance.findAll({
        where: { GradeId: employeeGrade?.GradeId },
        include: [AllowanceDefinition],
      }),

      Deduction.findAll({ where: { GradeId: employeeGrade?.GradeId } }),
      AdditionalAllowances.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
        include: [AdditionalAllowanceDefinition],
      }),
      AdditionalDeduction.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
        include: [AdditionalDeductionDefinition],
      }),
      AdditionalPay.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
      }),
      OTPayment.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
      }),
    ]);

    const employee_pension = pension?.employeeContribution ?? 0;
    const employer_pension = pension?.employerContribution ?? 0;

    const taxslabs = await Taxslab.findAll({
      where: { CompanyId: company, isActive: true },
    });
    let totalDeduction = 0;
    let totalAllowance = 0;
    let totalTaxable = 0;
    let income_tax_payable = 0;
    let deductible_Fee = 0;
    let totalExempted = 0;
    let totalTaxableIncome = 0;
    let overallTotalDeduction = 0;
    let totalLoan = 0;
    let totalAdditionalPay = 0;
    let totalOTPayment = 0;
    // Calculate total allowances
    allowances?.forEach((allowance) => {
      totalAllowance += Number(allowance.amount);

      if (allowance?.AllowanceDefinition?.isExempted) {
        totalExempted += Number(allowance.AllowanceDefinition.exemptedAmount);
        if (
          Number(allowance?.amount) >
          Number(allowance?.AllowanceDefinition?.startingAmount)
        ) {
          totalTaxable +=
            Number(allowance?.amount) -
            Number(allowance?.AllowanceDefinition?.exemptedAmount);
        } else {
          totalTaxable += Number(allowance.amount);
        }
      } else {
        totalTaxable += Number(allowance?.amount);
      }
    });
    additionalPay.forEach((additionalPay) => {
      totalAdditionalPay += Number(additionalPay?.amount);
    });
    otpayment.forEach((otpay) => {
      totalOTPayment +=
        (employee.EmployeeInfos[0]?.basicSalary / 192) * otpay?.hour;
    });
    // Calculate total additional allowances
    additionalAllowances.forEach((allowance) => {
      totalAllowance += Number(allowance?.amount);
      if (allowance?.AllowanceDefinition?.isExempted) {
        totalExempted += Number(allowance?.AllowanceDefinition?.exemptedAmount);
        if (
          Number(allowance?.amount) >
          Number(allowance?.AllowanceDefinition?.startingAmount)
        ) {
          totalTaxable +=
            Number(allowance?.amount) -
            Number(allowance?.AllowanceDefinition?.exemptedAmount);
        } else {
          totalTaxable += Number(allowance?.amount);
        }
      } else {
        totalTaxable += Number(allowance?.amount);
      }
    });
    deductions?.forEach((deduction) => {
      totalDeduction += Number(deduction?.amount);
    });
    additionalDeductions.forEach((deduction) => {
      totalDeduction += Number(deduction?.amount);
    });
    totalTaxable += Number(employee?.EmployeeInfos[0]?.basicSalary);
    const taxslab = taxslabs.find(
      (tax) => totalTaxable > tax?.from_Salary && totalTaxable < tax?.to_Salary
    );
    if (taxslab) {
      deductible_Fee = taxslab?.deductible_Fee;
      income_tax_payable = taxslab?.income_tax_payable;
      totalTaxableIncome =
        totalTaxable *
          (income_tax_payable === 0 ? 1 : income_tax_payable / 100) -
        deductible_Fee;
    } else {
      totalTaxableIncome = 0;
    }

    loans.forEach((loan) => (totalLoan += loan?.amount));
    overallTotalDeduction =
      totalLoan +
      totalTaxableIncome +
      totalDeduction +
      employee.EmployeeInfos[0]?.basicSalary * ((employee_pension * 1) / 100);
    const payrollData = {
      grossSalary: (
        totalAllowance +
        employee.EmployeeInfos[0]?.basicSalary +
        employee.EmployeeInfos[0]?.basicSalary * ((employer_pension * 1) / 100)
      ).toFixed(2),

      basicSalary: employee.EmployeeInfos[0]?.basicSalary,
      taxableIncome: totalTaxable.toFixed(2),
      incomeTax: totalTaxableIncome.toFixed(2),
      totalDeduction: overallTotalDeduction.toFixed(2),
      totalAllowance: totalAllowance + totalOTPayment,
      employee_pension_amount: Number(
        employee.EmployeeInfos[0]?.basicSalary * ((employee_pension * 1) / 100)
      ).toFixed(2),
      employer_pension_amount: (
        employee.EmployeeInfos[0]?.basicSalary *
        ((employer_pension * 1) / 100)
      ).toFixed(2),
      NetSalary: (
        totalTaxable -
        overallTotalDeduction +
        totalExempted +
        totalAdditionalPay +
        totalOTPayment
      ).toFixed(2),

      status: "processed",
      overtime: totalOTPayment,
    };

    // return res.json(payrollData)
    const data = await Payroll.create({
      ...payrollData,
      PayrollDefinitionId: payrollDefinitionId,
      EmployeeId: employeeId,
      CompanyId: company,
    });

    return 1;
  } catch (error) {
    console.log(error);

    return next(
      createError.createError(503, "Error occur on Some employee please check ")
    );
    // return res.status(404).json({
    //   message: `Error occur on Some employee please check `,
    // });
  }
}
