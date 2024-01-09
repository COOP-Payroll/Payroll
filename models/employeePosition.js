// employeePosition.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const EmployeePosition = sequelize.define('EmployeePosition', {});
// EmployeePosition.sync({ force: true }).then(() => console.log('positon model is ready'));
module.exports = EmployeePosition;
