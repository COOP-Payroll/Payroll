// const sequelize = require("../database/db");
// const Employee = require("../models/employee");
const { parentPort, workerData } = require("worker_threads");
const Pension = require("../models/pension");

const runPayroll = async () => {
  const { companyId, employeeId } = workerData;
  try {
    let employer_pension = 0;
    let employee_pension = 0;
    const pension = await Pension.findOne({
      where: { companyId, isActive: true },
    });
    console.log("pension", pension);
  } catch (error) {
    console.log("err", error);
  }
};

if (workerData) runPayroll();
