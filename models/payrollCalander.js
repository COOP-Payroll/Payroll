const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Company = require("./company.js");
const Payroll = require("./Payroll.js");

const PayrollCalander = sequelize.define("PayrollCalander", {
  payrollName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  payDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  payPeriod: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    enum: [
      "created",
      "ordered",
      "pending",
      "approved",
      "active",
      "paid",
      "rejected",
      "reject",
    ],
    default: "created",
  },
  isRollBacked: {
    type: DataTypes.BOOLEAN,
    default: false,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    default: false,
  },
  totalNoOfEmployee: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalNoOfprocessedEmployee: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  processedInPercent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
});

PayrollCalander.belongsTo(Company);
Company.hasMany(PayrollCalander);

PayrollDefinition.hasOne(Payroll);
Payroll.belongsTo(PayrollCalander);

module.exports = PayrollCalander;
