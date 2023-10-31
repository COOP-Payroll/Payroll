const { parentPort, workerData } = require("worker_threads");
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
const PayrollDefinition = require("../models/payrollDefinition");
const EmployeeGrade = require("../models/EmployeeGrade");

const newWorker = async () => {
  try {

    const { employeeId, user, payrollDefinitionId } = workerData;

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
    ] = await Promise.all([
      Pension.findOne({
        where: {
          companyId: user,
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
        where: { CompanyId: user, EmployeeId: employeeId },
        include: [AdditionalAllowanceDefinition],
      }),
      AdditionalDeduction.findAll({
        where: { CompanyId: user, EmployeeId: employeeId },
        include: [AdditionalDeductionDefinition],
      }),
    ]);

    const employee_pension = pension?.employeeContribution ?? 0;
    const employer_pension = pension?.employerContribution ?? 0;

    const taxslabs = await Taxslab.findAll({
      where: { companyId: user, isActive: true },
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

    // Calculate total allowances
    allowances.forEach((allowance) => {
      totalAllowance += Number(allowance.amount);
      console.log(
        "exemted amount: ",
        allowance?.AllowanceDefinition.isExempted
      );
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

    deductions.forEach((deduction) => {
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
      totalTaxableIncome = totalTaxable;
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
      totalAllowance,
      employee_pension_amount: Number(
        employee.EmployeeInfos[0]?.basicSalary * ((employee_pension * 1) / 100)
      ).toFixed(2),
      employer_pension_amount: (
        employee.EmployeeInfos[0]?.basicSalary *
        ((employer_pension * 1) / 100)
      ).toFixed(2),
      NetSalary: (totalTaxable - overallTotalDeduction + totalExempted).toFixed(
        2
      ),
      status: "processed",
    };
    // console.log("payroll data",payrollData)
    const payroll = await oldPayroll.update(payrollData);

    await payrollDefinition.increment("totalNoOfprocessedEmployee");

    if (payrollDefinition.totalNoOfEmployee !== 0) {
      const percent =
        (Number(payrollDefinition.totalNoOfprocessedEmployee) /
          Number(payrollDefinition.totalNoOfEmployee)) *
        100;
      await payrollDefinition.update({ processedInPercent: percent });
    }
  } catch (error) {
    const { employeeId, payrollDefinitionId } = workerData;
    const oldPayroll = await Payroll.findOne({
      where: {
        PayrollDefinitionId: payrollDefinitionId,
        EmployeeId: employeeId,
      },
    });

    const payrollDefinition = await PayrollDefinition.findByPk(
      Number(payrollDefinitionId)
    );

    const errorPayrollData = {
      grossSalary: 0,
      taxableIncome: 0,
      incomeTax: 0,
      totalDeduction: 0,
      totalAllowance: 0,
      employee_pension_amount: 0,
      employer_pension_amount: 0,
      NetSalary: 0,
      status: "failed",
    };

    const errorPayroll = await oldPayroll.update(errorPayrollData);
    if (payrollDefinition.totalNoOfEmployee !== 0) {
      const percent =
        (payrollDefinition.totalNoOfprocessedEmployee /
          payrollDefinition.totalNoOfEmployee) *
        100;
      await payrollDefinition.update({ processedInPercent: percent });
    }
  }
};

if (workerData) newWorker();
