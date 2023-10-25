const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const AdditionalpayDefinition = require("./additionalPayDefinition.js");
const Grade = require("./grade.js");
const Employee = require("./employee.js");
const Company = require("./company.js");
const AdditionalPay = sequelize.define("AdditionalPay", {
  amount: {
    type: DataTypes.NUMBER,
    allowNull: false,
  },
  //grade id
  //AdditionalAllowance id
});
AdditionalPay.belongsTo(AdditionalpayDefinition);
AdditionalpayDefinition.hasMany(AdditionalPay);

AdditionalPay.belongsTo(Employee);
Employee.hasMany(AdditionalPay);

AdditionalPay.belongsTo(Company);
Company.hasMany(AdditionalPay);

module.exports = AdditionalPay;