const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Company = require("./company.js");
const Payroll = require("./Payroll.js");

const PayrollDefinition = sequelize.define("PayrollDefinition", {
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
  status: {
    type: DataTypes.STRING,
    enum: ["created", "ordered", "pending", "approved", "active", "paid"],
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
});

PayrollDefinition.belongsTo(Company);
Company.hasMany(PayrollDefinition);

PayrollDefinition.hasOne(Payroll);
Payroll.belongsTo(PayrollDefinition);

module.exports = PayrollDefinition;
