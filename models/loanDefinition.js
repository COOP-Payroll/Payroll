const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Employee = require("./employee.js");

const LoanDefinition = sequelize.define("LoanDefinition", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },



//   isPercent: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//   },
//   startingAmount: {
//     type: DataTypes.FLOAT,
//     defaultValue: 0,
//   },



});

LoanDefinition.belongsTo(Company);
Company.hasMany(LoanDefinition);

LoanDefinition.belongsTo(Company);
Company.hasMany(LoanDefinition);

module.exports = LoanDefinition;
