const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Employee = require("./employee.js");
const Department = require("./department.js");
const CustomRole = require("./customRole.js");

const EmployeeCustomRole = sequelize.define("EmployeeCustomRole", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Employee.belongsToMany(CustomRole, {
  through: EmployeeCustomRole,
});
CustomRole.belongsToMany(Employee, {
  through: EmployeeCustomRole,
});

module.exports = EmployeeCustomRole;
