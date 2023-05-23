const { parentPort, workerData } = require("worker_threads");
const Pension = require("../models/pension");
const Taxslab = require("../models/taxslab");
const Employee = require("../models/employee");
const Grade = require("../models/grade");
const Loan = require("../models/loan");
const EmployeeInfo = require("../models/employeInfo");
const Allowance = require("../models/allowance");

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
    });
    // const deductions = await Ded
    console.log("first", allowances);
  } catch (error) {
    console.log("error", error);
  }
};

if (workerData) newWorker();
