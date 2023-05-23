const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const LoanDefinition = require("./loanDefinition.js");
const Employee = require("./employee.js");
const Company = require("../models/company.js");
const Loan = sequelize.define("Loan", {
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  //employee id
  //allowance id
});
Loan.belongsTo(LoanDefinition);
LoanDefinition.hasMany(Loan);

Loan.belongsTo(Employee);
Employee.hasMany(Loan);

Loan.belongsTo(Company);
Company.hasMany(Loan);

module.exports = Loan;
