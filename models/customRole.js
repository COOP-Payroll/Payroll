const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Employee = require("./employee.js");

const CustomRole = sequelize.define("CustomRole", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Employee.hasOne(CustomRole);
CustomRole.belongsTo(Employee);

Company.hasMany(CustomRole);
CustomRole.belongsTo(Company);

module.exports = CustomRole;
