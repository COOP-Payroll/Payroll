const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const AllowanceDefinition = require("./allowanceDefinition");
const Grade = require("./grade.js");
// const Employee=require('./employee.js');
const Company = require("./company.js");
const Allowance = sequelize.define("Allowance", {
  amount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  //grade id
  //allowance id
});
Allowance.belongsTo(AllowanceDefinition);
AllowanceDefinition.hasMany(Allowance);

Allowance.belongsTo(Grade);
Grade.hasMany(Allowance);

Allowance.belongsTo(Company);
Company.hasMany(Allowance);

module.exports = Allowance;
