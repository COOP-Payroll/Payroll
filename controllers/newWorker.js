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
      include: [Loan, EmployeeInfo],
    });
    // const benefit = await Grade.findOne({where: {CompanyId: workerData.user, }})
    // console.log("first", employee);
    const allowances = await Allowance.findAll({
      where: { CompanyId: workerData.user, GradeId: employee.GradeId },
      include: [AllowanceDefinition],
    });
    const deductions = await Deduction.findAll({
      where: { CompanyId: workerData.user, GradeId: employee.GradeId },
    });

    console.log("allowances", allowances);

    let totalDeduction = 0;
    // let totalAllowance= 0;
    let totalAllowance = 0;
    let totalTaxable = 0;
    let income_tax_payable = 0;
    let deductible_Fee = 0;
    let totalExempted = 0;
    let totalTaxableIncome = 0;
    let overallTotalDeduction = 0;

    //TOTAL ALLOWANCES
    allowances.forEach((allowance) => {
      totalAllowance += allowance.amount;
      //console.log(allowance.is_Exempted)
      if (allowance.is_Exempted) {
        totalExempted += allowance.exempted_on_Allowance_amount;
        if (allowance.amount > allowance.starting_from) {
          totalTaxable +=
            allowance.amount - allowance.exempted_on_Allowance_amount;
        } else {
          totalTaxable += allowance.amount;
        }
      } else {
        totalTaxable += allowance.amount;
      }
    });
    console.log("total", totalAllowance);
  } catch (error) {
    console.log("error", error);
  }
};

if (workerData) newWorker();
