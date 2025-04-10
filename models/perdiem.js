const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Employee = require("./employee.js");
const PerDiemRate = require("./dailyperdiemrate.js");
const PayrollDefinition = require("./payrollDefinition.js");

const PerDiem = sequelize.define("PerDiem", {
  numberofDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Per diem amount based on gr",
  },
  status: {
    type: DataTypes.ENUM,
    values: [
      "pending", // Request is awaiting action
      "approved", // Request has been approved
      "rejected", // Request has been rejected
      "processed", // Request has been processed
    ],
    defaultValue: "processed", // Default status is "processed"
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: "Mark active/inactive rates",
  },
});
PerDiemRate.belongsTo(PerDiem);
PerDiem.hasMany(PerDiemRate);

PerDiem.belongsTo(Employee);
Employee.hasMany(PerDiem);

Company.hasMany(PerDiem);
PerDiem.belongsTo(Company);

PerDiem.belongsTo(PayrollDefinition);
PayrollDefinition.hasMany(PerDiem);

module.exports = PerDiem;
