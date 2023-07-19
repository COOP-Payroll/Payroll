const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Approver = require("./approver.js");
const PayrollDefinition = require("./payrollDefinition");
const Company = require("./company.js");

const PayrollApprovement = sequelize.define("PayrollApprovement", {
  status: {
    type: DataTypes.STRING,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  ///
  // no_approver: {
  //   type: DataTypes.NUMBER,
  //   defaultValue: 0,
  // },
  // approver_list: {
  //   type: [],
  // },
  remark: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rejectedBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  approvedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

PayrollApprovement.belongsTo(PayrollDefinition);
PayrollDefinition.hasMany(PayrollApprovement);

PayrollApprovement.belongsTo(Approver);
Approver.hasOne(PayrollApprovement);

PayrollApprovement.belongsTo(Company);
Company.hasMany(PayrollApprovement);

module.exports = PayrollApprovement;
