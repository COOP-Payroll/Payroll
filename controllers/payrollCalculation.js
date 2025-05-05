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
const OTPayment = require("../models/otPayModel.js");

exports.createPayroll1 = async (req, res, next) => {
  try {
    // return res.json("dfankfnjasndjf");
    const isProjectBased = req.user.isProjectBased;
    const { payrollDefinitionId, employeeIds } = req.body;
    // return res.json("dfankfnjasndjf");
    const employeeID = employeeIds.map((id) => parseInt(id));
    const payrolldef = await PayrollDefinition.findByPk(payrollDefinitionId);
    const company =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    if (!payrolldef) {
      return res.status(404).json({ message: "payroll is not defined" });
    }

    const employees = await Employee.findAll({
      where: {
        id: employeeID,
        CompanyId: CompanyId,
      },
    });
    // return res.json(employees);
    const existingEmployeeIds = employees.map((employee) => employee.id);

    const nonExistingEmployeeIds = employeeID.filter(
      (id) => !existingEmployeeIds.includes(id)
    );
    if (nonExistingEmployeeIds?.length > 0) {
      return res.status(404).json({
        message: "Some Employee not found",
        employees: nonExistingEmployeeIds,
      });
    }

    const existingPayrolls = await Payroll.findAll({
      where: {
        EmployeeId: {
          [Op.in]: employeeIds,
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

    const errors = [];

    if (!isProjectBased) {
      let payrollCount = 0;
      await payrolldef.update({ status: "ordered" });
      for (const employeeId of employeeID) {
        try {
          const resp = await runPayroll(req, res, next, {
            employeeId,
            CompanyId,
            payrollDefinitionId,
          });
        } catch (error) {
          errors.push(error);
        }
      }

      if (errors.length > 0) {
        return next(createError(503, "There is a problem creating payroll "));
      }
    }

    return res.status(201).json({ message: "Payroll created successfully!  " });
  } catch (error) {
    console.log(error);

    return next(
      createError.createError(503, "Error occurred while creating payroll ")
    );
  }
};

async function runPayroll(
  req,
  res,
  next,
  { employeeId, CompanyId, payrollDefinitionId }
) {
  try {
    const employeeGrade = await EmployeeGrade.findOne({
      where: { EmployeeId: employeeId, active: true },
    });

    const pension = await Pension.findOne({
      where: {
        UserId: { [Op.ne]: null }, // UserId must NOT be null
        CompanyId: { [Op.is]: null }, // CompanyId must be null
        isActive: true, // Active status condition
      },
    });

    if (!pension) {
      return res.json({ message: "Please define Pension first" });
    }

    const taxslabs = await Taxslab.findAll({
      where: {
        UserId: { [Op.ne]: null }, // UserId must NOT be null
        CompanyId: { [Op.is]: null }, // CompanyId must be null
        isActive: true, // Active status condition
      },
    });

    if (!taxslabs) {
      return res.json({ message: "Please define Tax Rule first " });
    }
    // // const employeeGrade = EmployeeGrade.findAll({
    // //   // where: { EmployeeId: employeeId, isActive: true },
    // // });

    // return res.json(employeeGrade);
    // Fetch all required data in parallel
    const [
      providentFund,
      payrollDefinition,
      employee,
      loans,
      allowances,
      deductions,
      additionalDeductions,
      additionalPay,
      otpayment,
    ] = await Promise.all([
      ProvidentFund.findOne({
        where: {
          // CompanyId: CompanyId,
          isActive: true,
          UserId: { [Op.ne]: null }, // UserId must NOT be null
          CompanyId: { [Op.is]: null },
        },
      }),
      PayrollDefinition.findByPk(Number(payrollDefinitionId)),
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
      AdditionalDeduction.findAll({
        where: { CompanyId: CompanyId, EmployeeId: employeeId, isActive: true },
        include: [
          { model: AdditionalDeductionDefinition, where: { isActive: true } },
        ],
      }),
      AdditionalPay.findAll({
        where: { CompanyId: CompanyId, EmployeeId: employeeId, isActive: true },
        include: [
          { model: AdditionalPayDefinition, where: { isActive: true } },
        ],
      }),
      OTPayment.findAll({
        where: { CompanyId: CompanyId, EmployeeId: employeeId },
      }),
    ]);

    if (!pension) {
      throw new Error("Please define Pension first");
    }

    if (!taxslabs?.length) {
      throw new Error("Please define Tax Rule first");
    }

    const basicSalary = employee.EmployeeInfos[0]?.basicSalary || 0;
    const employee_pension = pension?.employeeContribution ?? 0;
    const employer_pension = pension?.employerContribution ?? 0;
    const employee_providentFund = providentFund?.employeeContribution ?? 0;
    const employer_providentFund = providentFund?.employerContribution ?? 0;

    // Calculate additional deductions (handling percentages)
    let totalDeduction = 0;
    additionalDeductions.forEach((deduction) => {
      if (deduction.AdditionalDeductionDefinition.isPercent) {
        totalDeduction += (basicSalary * Number(deduction.amount)) / 100;
      } else {
        totalDeduction += Number(deduction.amount);
      }
    });

    // Calculate additional pay (handling hourly and amount types)
    let totalAdditionalPay = 0;
    additionalPay.forEach((pay) => {
      if (pay.AdditionalPayDefinition.type === "hourly") {
        // Assuming the amount in this case represents hours
        totalAdditionalPay += (basicSalary / 192) * Number(pay.amount); // 192 = 24 days * 8 hours
      } else {
        totalAdditionalPay += Number(pay.amount);
      }
    });

    // Calculate overtime
    let totalOTPayment = 0;
    otpayment.forEach((otpay) => {
      totalOTPayment += (basicSalary / 192) * otpay?.hour;
    });

    // Calculate allowances and taxable income
    let totalAllowance = 0;
    let totalTaxable = 0;
    let totalExempted = 0;

    allowances?.forEach((allowance) => {
      const amount = Number(allowance.amount);
      totalAllowance += amount;

      if (allowance?.AllowanceDefinition?.isExempted) {
        const exemptedAmount = Number(
          allowance.AllowanceDefinition.exemptedAmount
        );
        totalExempted += exemptedAmount;

        if (amount > Number(allowance?.AllowanceDefinition?.startingAmount)) {
          totalTaxable += amount - exemptedAmount;
        } else {
          totalTaxable += amount;
        }
      } else {
        totalTaxable += amount;
      }
    });

    // Add basic salary to taxable income
    totalTaxable += basicSalary;

    // Calculate tax
    const taxslab = taxslabs.find(
      (tax) => totalTaxable > tax?.from_Salary && totalTaxable < tax?.to_Salary
    );

    let deductible_Fee = 0;
    let income_tax_payable = 0;
    let totalTaxableIncome = 0;

    if (taxslab) {
      deductible_Fee = taxslab?.deductible_Fee;
      income_tax_payable = taxslab?.income_tax_payable;
      totalTaxableIncome =
        totalTaxable *
          (income_tax_payable === 0 ? 1 : income_tax_payable / 100) -
        deductible_Fee;
    }

    // Calculate loans
    let totalLoan = 0;
    loans.forEach((loan) => (totalLoan += loan?.amount));

    // Calculate final deductions
    const overallTotalDeduction =
      totalLoan +
      totalTaxableIncome +
      totalDeduction +
      basicSalary * (employee_pension / 100) +
      basicSalary * (employee_providentFund / 100);

    // Prepare payroll data
    const payrollData = {
      grossSalary: (
        totalAllowance +
        basicSalary +
        basicSalary * (employer_pension / 100) +
        basicSalary * (employer_providentFund / 100)
      ).toFixed(2),
      basicSalary: basicSalary,
      taxableIncome: totalTaxable.toFixed(2),
      incomeTax: totalTaxableIncome.toFixed(2),
      totalDeduction: overallTotalDeduction.toFixed(2),
      totalAllowance: totalAllowance + totalOTPayment,
      employee_pension_amount: (basicSalary * (employee_pension / 100)).toFixed(
        2
      ),
      employer_pension_amount: (basicSalary * (employer_pension / 100)).toFixed(
        2
      ),
      employee_providentFund: (
        basicSalary *
        (employee_providentFund / 100)
      ).toFixed(2),
      employer_providentFund: (
        basicSalary *
        (employer_providentFund / 100)
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

    // Create payroll record
    await Payroll.create({
      ...payrollData,
      PayrollDefinitionId: payrollDefinitionId,
      EmployeeId: employeeId,
      CompanyId: CompanyId,
    });

    return true;
  } catch (error) {
    console.error("Payroll calculation error:", error);
    throw error;
  }
}
