// employeePosition.js
const { DataTypes } = require('sequelize')
const sequelize = require('../database/db')
const Company = require('./company.js')
const Employee=require("../models/employee.js");
const Position=require("../models/position.js");

const EmployeePosition = sequelize.define('EmployeePosition', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  letter:{
    type: DataTypes.STRING

  }
})
// EmployeePosition.sync({ force: true }).then(() => console.log('positon model is ready'));
Employee.belongsToMany(Position, {
  through: EmployeePosition,
});
Position.belongsToMany(Employee, {
  through: EmployeePosition,
});
Company.hasMany(EmployeePosition)
EmployeePosition.belongsTo(Company)

module.exports = EmployeePosition
