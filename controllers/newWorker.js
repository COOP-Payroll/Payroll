const { parentPort, workerData } = require("worker_threads");
const Pension = require("../models/pension");
const Taxslab = require("../models/taxslab");
const Employee = require("../models/employee");
const Grade = require("../models/grade");
const Loan = require("../models/loan");

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
      include: [Loan],
    });

    console.log("first", employee);
  } catch (error) {
    console.log("error", error);
  }
};

if (workerData) newWorker();
