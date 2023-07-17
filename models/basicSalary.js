const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Package = require("./package.js");
const Employee = require("./employee.js");

const BasicSalary = sequelize.define("BasicSalary", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Employee.hasMany(BasicSalary);
BasicSalary.belongsTo(Employee);

module.exports = BasicSalary;
