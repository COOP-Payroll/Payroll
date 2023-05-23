const { parentPort, workerData } = require("worker_threads");
const Pension = require("../models/pension");
const Taxslab = require("../models/taxslab");
const Employee = require("../models/employee");
const Grade = require("../models/grade");
const Loan = require("../models/loan");
const EmployeeInfo = require("../models/employeInfo");
const Allowance = require("../models/allowance");
const Deduction = require("../models/deduction");
const AllowanceDefinition = require("../models/allowanceDefinition");

const newWorker = async () => {
  try {
    let employer_pension = 0;
    let employee_pension = 0;
    const pension = await Pension.findOne({
      where: {
        companyId: workerData.user,
        isActive: true,
      },
    });
    employee_pension = pension?.employeeContribution ?? 1;
    employer_pension = pension?.employerContribution ?? 1;

    // const taxslab = await .find({ companyId: message.user });
    const taxslab = await Taxslab.findAll({
      where: { companyId: workerData.user, isActive: true },
    });

    const employee = await Employee.findByPk(Number(workerData.employeeId), {
      include: [Loan, EmployeeInfo, Loan],
    });

    const loans = await Loan.findAll({ where: { EmployeeId: employee.id } });
    // const benefit = await Grade.findOne({where: {CompanyId: workerData.user, }})
    // console.log("first", employee);
    const allowances = await Allowance.findAll({
      where: { CompanyId: workerData.user, GradeId: employee.GradeId },
      include: [AllowanceDefinition],
    });
    const deductions = await Deduction.findAll({
      where: { CompanyId: workerData.user, GradeId: employee.GradeId },
    });

    // console.log("allowances", JSON.stringify(allowances, null, 3));

    let totalDeduction = 0;
    // let totalAllowance= 0;
    let totalAllowance = 0;
    let totalTaxable = 0;
    let income_tax_payable = 0;
    let deductible_Fee = 0;
    let totalExempted = 0;
    let totalTaxableIncome = 0;
    let overallTotalDeduction = 0;
    let totalLoan = 0;

    //TOTAL ALLOWANCES
    allowances.forEach((allowance) => {
      totalAllowance += Number(allowance.amount);
      //console.log(allowance.is_Exempted)
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

    //TOTAL DEDUCTION
    deductions.forEach((deduction) => {
      totalDeduction += Number(deduction.amount);
    });

    totalTaxable += Number(employee.EmployeeInfo.basicSalary);
    // console.log("taxslab", taxslab);
    for (const taxslabs of taxslab) {
      // console.log(taxslabs)
      //  console.log(taxslabs.deductible_Fee)

      if (
        totalTaxable > taxslabs.from_Salary &&
        totalTaxable < taxslabs.to_Salary
      ) {
        // console.log( "true")
        deductible_Fee = taxslabs.deductible_Fee;
        income_tax_payable = taxslabs.income_tax_payable;
        totalTaxableIncome =
          totalTaxable *
            (income_tax_payable == 0 ? 1 : income_tax_payable / 100) -
          deductible_Fee;
        //  console.log(tax)
      } else {
        deductible_Fee = 0;
        income_tax_payable = 0;
        totalTaxableIncome = 0;
      }
    }

    loans.forEach((loan) => (totalLoan += loan.amount));
    overallTotalDeduction =
      totalLoan +
      totalTaxableIncome +
      totalDeduction +
      employee.EmployeeInfo.basicSalary * ((employee_pension * 1) / 100);

    const payrollData = {
      // payrollName: moment().format("MMMM") + " Payroll",
      // month: moment().format("MMMM"),
      // year: moment().format("YYYY"),
      PayrollDefinitionId: workerData.payrollDefinitionId,
      // grossSalary: (
      //   employee.Acting +
      //   employee.overtimeEarning +
      //   totalAllowance +
      //   Number(employee.basicSalary) +
      //   employee.basicSalary * ((employer_pension * 1) / 100)
      // ).toFixed(2),
      grossSalary: (
        totalAllowance +
        employee.EmployeeInfo.basicSalary +
        employee.EmployeeInfo.basicSalary * ((employer_pension * 1) / 100)
      ).toFixed(2),
      taxableIncome: totalTaxable.toFixed(2),
      incomeTax: totalTaxableIncome.toFixed(2),
      totalDeduction: overallTotalDeduction.toFixed(2),
      totalAllowance,
      employee_pension_amount: (
        employee.basicSalary *
        ((employee_pension * 1) / 100)
      ).toFixed(2),
      employer_pension_amount: (
        employee.EmployeeInfo.basicSalary *
        ((employer_pension * 1) / 100)
      ).toFixed(2),
      NetSalary: (totalTaxable - overallTotalDeduction + totalExempted).toFixed(
        2
      ),
    };

    console.log("payroll", payrollData);
  } catch (error) {
    console.log("error", error);
  }
};

if (workerData) newWorker();
