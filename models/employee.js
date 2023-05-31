const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Package = require("../models/package.js");
const Company = require("../models/company.js");
const bcrypt = require("bcrypt");
const Address = require("./address.js");
const EmployeeInfo = require("./employeInfo.js");
const Department = require("./department");

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
    defaultValue: "employee",
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  marriageStatus: {
    type: DataTypes.ENUM("Single", "Married", "Divorced"),
    defaultValue: true,
    defaultValue: "Single",
  },
  employee_id_number: {
    type: DataTypes.STRING,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  optionalNumber: {
    type: DataTypes.STRING,
  },

  id_image: {
    type: DataTypes.STRING,
  },
  id_type: {
    type: DataTypes.ENUM("kebele", "passport", "driving _License"),
    allowNull: false,
    defaultValue: "kebele",
  },
  id_Number: {
    type: DataTypes.STRING,
    allowNull: false,
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
  // accountNumber: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },

  password: {
    type: DataTypes.STRING,
  },

  arrears: {
    type: DataTypes.NUMBER,
    defaultValue: 0,
  },
  dayDeductions: {
    type: DataTypes.NUMBER,
    defaultValue: 0,
  },
  // dayDeductions: {
  //   type: DataTypes.NUMBER,
  //   defaultValue: 0,
  // },
  lateSittingOverTime: {
    type: DataTypes.NUMBER,
    defaultValue: 0,
  },
  acting: {
    type: DataTypes.NUMBER,
    defaultValue: 0,
  },
  // passwordChangedAt: Date,
  // passwordResetToken: String,
  // passwordResetExpires: Date,
});

Employee.beforeCreate((employee, options) => {
  const saltRounds = 10;
  return bcrypt
    .hash(employee.password, saltRounds)
    .then((hash) => {
      employee.password = hash;
    })
    .catch((err) => {
      throw new Error(err);
    });
});

Employee.beforeUpdate((employee, options) => {
  if (employee.changed("password")) {
    const saltRounds = 10;
    return bcrypt
      .hash(employee.password, saltRounds)
      .then((hash) => {
        employee.password = hash;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }
});

// Subscription.belongsTo(Package);
// Package.hasOne(Subscription);

// Company.hasMany(Employee);
// Employee.belongsTo(Company);
Company.hasMany(Employee);
<<<<<<< HEAD
Employee.belongsTo(Company)
=======
Employee.belongsTo(Company);
>>>>>>> a4d081f819f514c9a9230842e91494a824f149e8

EmployeeInfo.hasOne(Employee);
Employee.belongsTo(EmployeeInfo);

Address.hasOne(Employee);
Employee.belongsTo(Address);

// Set up the one-to-one relationship
Department.hasOne(Employee); // A department has one employee
Employee.belongsTo(Department); // An employee belongs to a department

// Department.hasOne(Employee); // User has one Profile
// Employee.belongsTo(Department);

// Department.hasMany(Employee);
// Employee.belongsTo(Department);

module.exports = Employee;
