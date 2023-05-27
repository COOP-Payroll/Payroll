const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Company = require("./company.js");

const ApprovalMethod = sequelize.define("ApprovalMethod", {
  minimumApprover: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  approvalLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  approvalMethod: {
    type: DataTypes.STRING,
    enum: ["hierarchy", "horizontal"],
    allowNull: false,
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    default: false,
  },
  lastUpdated: {
    type: DataTypes.DATE,
    default: Date.now(),
    // allowNull:false
  },
  isThereMasterApprover: {
    type: DataTypes.BOOLEAN,
    default: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    default: true,
    allowNull:false
  },
});

ApprovalMethod.belongsTo(Company);
Company.hasOne(ApprovalMethod);

module.exports = ApprovalMethod;
