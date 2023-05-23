const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Employee = require("./employee.js");

const Payroll = sequelize.define("Payroll", {
  grossSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  taxableIncome: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  incomeTax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  totalDeduction: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  totalAllowance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  NetSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  employee_pension_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  employer_pension_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM,
    values: ["ordered", "failed"],
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
