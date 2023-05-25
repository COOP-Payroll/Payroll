const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const AdditionalAllowanceDefinition = require("./additionalAllowanceDefinition.js");
const Grade = require("./grade.js");
const Employee = require("./employee.js");
const Company = require("./company.js");
const AdditionalAllowance = sequelize.define("AdditionalAllowance", {
  amount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  //grade id
  //AdditionalAllowance id
});
AdditionalAllowance.belongsTo(AdditionalAllowanceDefinition);
AdditionalAllowanceDefinition.hasMany(AdditionalAllowance);

AdditionalAllowance.belongsTo(Employee);
Employee.hasMany(AdditionalAllowance);

AdditionalAllowance.belongsTo(Company);
Company.hasMany(AdditionalAllowance);

module.exports = AdditionalAllowance;
