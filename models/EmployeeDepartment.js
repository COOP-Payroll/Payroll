const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Employee = require("./employee.js");
const Department = require("./department.js");

const EmployeeDepartment = sequelize.define("EmployeeDepartment", {
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

Employee.belongsToMany(Department, {
  through: EmployeeDepartment,
});
Department.belongsToMany(Employee, {
  through: EmployeeDepartment,
});

module.exports = EmployeeDepartment;
