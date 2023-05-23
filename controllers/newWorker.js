const { parentPort, workerData } = require("worker_threads");
const Pension = require("../models/pension");
const Taxslab = require("../models/taxslab");
const Employee = require("../models/employee");
const Loan = require("../models/loan");
const Allowance = require("../models/allowance");
const Deduction = require("../models/deduction");
const AllowanceDefinition = require("../models/allowanceDefinition");
const Payroll = require("../models/Payroll.js");
const EmployeeInfo = require("../models/employeInfo");

const newWorker = async () => {
  try {
    const { user, employeeId, payrollDefinitionId } = workerData;

    const pension = await Pension.findOne({
      where: {
        companyId: user,
        isActive: true,
      },
    });

    const employee_pension = pension?.employeeContribution ?? 1;
    const employer_pension = pension?.employerContribution ?? 1;
    // console.log("first", employee_pension);
    // console.log("first", employer_pension);

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
    // console.log("total taxable", totalTaxable);
    // Calculate total deductions
    deductions.forEach((deduction) => {
      totalDeduction += Number(deduction.amount);
    });

    totalTaxable += Number(employee.EmployeeInfo.basicSalary);

    // for (const taxslabs of taxslab) {
    //   if (
    //     totalTaxable > taxslabs.from_Salary &&
    //     totalTaxable < taxslabs.to_Salary
    //   ) {
    //     console.log("totalTaxableIncome", "totalTaxableIncome");
    //     deductible_Fee = taxslabs.deductible_Fee;
    //     income_tax_payable = taxslabs.income_tax_payable;
    // totalTaxableIncome =
    //   totalTaxable *
    //     (income_tax_payable == 0 ? 1 : income_tax_payable / 100) -
    //   deductible_Fee;
    //   } else {
    //     console.log("totalTaxableIncome");
    //     deductible_Fee = 0;
    //     income_tax_payable = 0;
    //     totalTaxableIncome = 0;
    //   }
    // }
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

    // console.log("first", taxslabs);
    // console.log("totalTaxableIncome", totalTaxableIncome);

    loans.forEach((loan) => (totalLoan += loan.amount));
    overallTotalDeduction =
      totalLoan +
      totalTaxableIncome +
      totalDeduction +
      employee.EmployeeInfo.basicSalary * ((employee_pension * 1) / 100);

    const payrollData = {
      PayrollDefinitionId: payrollDefinitionId,
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
      status: "ordered",
      EmployeeId: employeeId,
    };

    const payroll = await Payroll.create(payrollData);
    parentPort.postMessage({ employeeId, payroll });
  } catch (error) {
    console.error("Error occurred:", error);
    const { employeeId, payrollDefinitionId } = workerData;
    const errorPayrollData = {
      PayrollDefinitionId: payrollDefinitionId,
      grossSalary: 0,
      taxableIncome: 0,
      incomeTax: 0,
      totalDeduction: 0,
      totalAllowance: 0,
      employee_pension_amount: 0,
      employer_pension_amount: 0,
      NetSalary: 0,
      status: "failed",
      EmployeeId: employeeId,
    };
    const errorPayroll = await Payroll.create(errorPayrollData);
    parentPort.postMessage({ employeeId, payroll: errorPayroll });
  }
};

if (workerData) newWorker();
