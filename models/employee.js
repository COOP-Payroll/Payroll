const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Package = require("../models/package.js");
const Company = require("../models/company.js");
const bcrypt = require("bcrypt");
const Address = require("./address.js");
const EmployeeInfo = require("./employeInfo.js");
const Department = require("./department.js");

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
  id_number: {
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
    allowNull: false,
  },

  password: {
    type: DataTypes.STRING,
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

Company.hasMany(Employee);
Employee.belongsTo(Company);

EmployeeInfo.hasOne(Employee);
Employee.belongsTo(EmployeeInfo);

Address.hasOne(Employee);
Employee.belongsTo(Address);

module.exports = Employee;
