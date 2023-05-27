const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Employee = require("../models/employee.js");
const Company = require("../models/company.js");

const Approver = sequelize.define("Approver", {
  level: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  isMaster: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

Approver.belongsTo(Company,{ as: 'Company', foreignKey: 'CompanyId' });
Company.hasMany(Approver);

Approver.belongsTo(Employee,{ as: 'Employee', foreignKey: 'EmployeeId' });
Employee.hasOne(Approver);

module.exports = Approver;
