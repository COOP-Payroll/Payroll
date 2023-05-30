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

const newWorker = async () => {
  try {
    const { user, employeeId, payrollDefinitionId } = workerData;
    const pension = await Pension.findOne({
      where: {
        companyId: user,
        isActive: true,
      },
    });

    const oldPayroll = await Payroll.findOne({
      where: {
        PayrollDefinitionId: payrollDefinitionId,
        EmployeeId: employeeId,
      },
    });

    const employee_pension = pension?.employeeContribution ?? 1;
    const employer_pension = pension?.employerContribution ?? 1;

    const taxslab = await Taxslab.findAll({
      where: { companyId: user, isActive: true },
    });

    const employee = await Employee.findByPk(Number(employeeId), {
      include: [Loan, EmployeeInfo],
    });

    const loans = await Loan.findAll({ where: { EmployeeId: employee.id } });

    const allowances = await Allowance.findAll({
      where: { CompanyId: user, GradeId: employee.GradeId },
      include: [AllowanceDefinition],
    });

    const deductions = await Deduction.findAll({
      where: { CompanyId: user, GradeId: employee.GradeId },
    });

    const additionalAllowances = await AdditionalAllowances.findAll({
      where: { CompanyId: user, EmployeeId: employee.id },
      include: [AdditionalAllowanceDefinition],
    });

    const additionalDeduction = await AdditionalDeduction.findAll({
      where: { CompanyId: user, EmployeeId: employee.id },
      include: [AdditionalDeductionDefinition],
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

      if (allowance.AllowanceDefinition.isExempted) {
        totalExempted += Number(allowance.AllowanceDefinition.exemptedAmount);

        if (
          Number(allowance.amount) >
          Number(allowance.AllowanceDefinition.startingAmount)
        ) {
          totalTaxable +=
            Number(allowance.amount) -
            Number(allowance.AllowanceDefinition.exemptedAmount);
        } else {
          totalTaxable += Number(allowance.amount);
        }
      } else {
        totalTaxable += Number(allowance.amount);
      }
    });

    // Calculate total additional allowances
    if (additionalAllowances.length > 0) {
      additionalAllowances.forEach((allowance) => {
        totalAllowance += Number(allowance.amount);

        if (allowance.AllowanceDefinition.isExempted) {
          totalExempted += Number(allowance.AllowanceDefinition.exemptedAmount);

          if (
            Number(allowance.amount) >
            Number(allowance.AllowanceDefinition.startingAmount)
          ) {
            totalTaxable +=
              Number(allowance.amount) -
              Number(allowance.AllowanceDefinition.exemptedAmount);
          } else {
            totalTaxable += Number(allowance.amount);
          }
        } else {
          totalTaxable += Number(allowance.amount);
        }
      });
    }

    deductions.forEach((deduction) => {
      totalDeduction += Number(deduction.amount);
    });

    if (additionalDeduction.length > 0) {
      additionalDeduction.forEach((deduction) => {
        totalDeduction += Number(deduction.amount);
      });
    }

    totalTaxable += Number(employee.EmployeeInfo.basicSalary);

    const taxslabs = taxslab.find(
      (tax) => totalTaxable > tax.from_Salary && totalTaxable < tax.to_Salary
    );

    if (taxslabs) {
      deductible_Fee = taxslabs.deductible_Fee;
      income_tax_payable = taxslabs.income_tax_payable;
      totalTaxableIncome =
        totalTaxable *
          (income_tax_payable == 0 ? 1 : income_tax_payable / 100) -
        deductible_Fee;
    }

    loans.forEach((loan) => (totalLoan += loan.amount));
    overallTotalDeduction =
      totalLoan +
      totalTaxableIncome +
      totalDeduction +
      employee.EmployeeInfo.basicSalary * ((employee_pension * 1) / 100);

    const payrollData = {
      grossSalary: (
        totalAllowance +
        employee.EmployeeInfo.basicSalary +
        employee.EmployeeInfo.basicSalary * ((employer_pension * 1) / 100)
      ).toFixed(2),
      taxableIncome: totalTaxable.toFixed(2),
      incomeTax: totalTaxableIncome.toFixed(2),
      totalDeduction: overallTotalDeduction.toFixed(2),
      totalAllowance,
      employee_pension_amount: Number(
        employee.EmployeeInfo.basicSalary * ((employee_pension * 1) / 100)
      ).toFixed(2),

      employer_pension_amount: (
        employee.EmployeeInfo.basicSalary *
        ((employer_pension * 1) / 100)
      ).toFixed(2),
      NetSalary: (totalTaxable - overallTotalDeduction + totalExempted).toFixed(
        2
      ),
      status: "processed",
    };

    const payroll = await oldPayroll.update(payrollData);
    // parentPort.postMessage({ employeeId, payroll });
  } catch (error) {
    const { employeeId, payrollDefinitionId } = workerData;
    const oldPayroll = await Payroll.findOne({
      where: {
        PayrollDefinitionId: payrollDefinitionId,
        EmployeeId: employeeId,
      },
    });
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
    // parentPort.postMessage({ employeeId, errorPayroll });
  }
};

if (workerData) newWorker();
