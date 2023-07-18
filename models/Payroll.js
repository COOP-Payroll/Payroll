const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Employee = require("./employee.js");

const Payroll = sequelize.define("Payroll", {
  grossSalary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  basicSalary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  taxableIncome: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  incomeTax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  totalDeduction: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  totalAllowance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  NetSalary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  employee_pension_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  employer_pension_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM,
    values: ["ordered", "processed", "pending","failed", "approved","rejected"],
    defaultValue: "ordered",
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Payroll.belongsTo(Employee);
Employee.hasOne(Payroll);

module.exports = Payroll;
