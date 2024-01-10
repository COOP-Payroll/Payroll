// employeePosition.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');
const Company = require('./company.js');

const EmployeePosition = sequelize.define('EmployeePosition', {});
// EmployeePosition.sync({ force: true }).then(() => console.log('positon model is ready'));

Company.hasMany(EmployeePosition);
EmployeePosition.belongsTo(Company);

module.exports = EmployeePosition;
