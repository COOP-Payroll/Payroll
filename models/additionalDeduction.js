const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Employee = require("./employee.js");
const Company = require("../models/company.js");
const AdditionalDeductionDefinition=require("./additionlDeductionDefinition.js");
const AdditionalDeduction = sequelize.define("AdditionalDeduction", {
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  //employee id
  //allowance id
});
AdditionalDeduction.belongsTo(AdditionalDeductionDefinition);
AdditionalDeductionDefinition.hasMany(AdditionalDeduction);

AdditionalDeduction.belongsTo(Employee);
Employee.hasMany(AdditionalDeduction);

AdditionalDeduction.belongsTo(Company);
Company.hasMany(AdditionalDeduction);

module.exports = AdditionalDeduction;
