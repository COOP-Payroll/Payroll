const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Package = require("../models/package.js");
const Company = require("../models/company.js");

const Employee = sequelize.define("Employee", {
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  images: {
    type: DataTypes.STRING,
  },
  sex: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("employee", "approver"),
    allowNull: false,
    defaultValue:"employee"
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  marriageStatus: {
    type: DataTypes.ENUM("Single", "Married", "Divorced"),
    defaultValue: true,
    defaultValue:"Single"
  },
  id_number: {
    type: DataTypes.STRING,
    
  },
  employeeTIN: {
    type: DataTypes.STRING,
   
  },
  email: {
    type: DataTypes.STRING,
    allowNull:false
  },
  phoneNumber: {
    type: DataTypes.STRING,
  allowNull:false
  },
  optionalNumber: {
    type: DataTypes.STRING,
    allowNull:false
  },
  isDeactivated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hireDate: {
    type: DataTypes.DATE,

  },
  joiningDate: {
    type: DataTypes.DATE,
    
  },
  employeeCode: {
    type: DataTypes.STRING,
    
  },

  accountNumber: {
    type: DataTypes.STRING,
    allowNull:false
  },
  password: {
    type: DataTypes.STRING,
     },
});

// Subscription.belongsTo(Package);
// Package.hasOne(Subscription);

// Subscription.belongsTo(Company);
// Company.hasOne(Subscription);

module.exports = Employee;
