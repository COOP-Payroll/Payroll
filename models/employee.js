const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("../models/company.js");
const bcrypt = require("bcrypt");

const Employee = sequelize.define("Employee", {
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
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
    defaultValue: "employee",
  },
  nationality: {
    type: DataTypes.STRING,
    defaultValue: "Ethiopia",
  },
  marriageStatus: {
    type: DataTypes.ENUM("Single", "Married", "Divorced"),
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
  password: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  rejectionCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  acceptanceCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
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

Company.hasMany(Employee);
Employee.belongsTo(Company);

// Department.hasMany(Employee);
// Employee.belongsTo(Department);

// EmployeeInfo.hasOne(Employee);
// Employee.belongsTo(EmployeeInfo);

// Address.hasOne(Employee);
// Employee.belongsTo(Address);

module.exports = Employee;
