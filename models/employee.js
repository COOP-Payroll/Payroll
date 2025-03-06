const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("../models/company.js");
const bcrypt = require("bcryptjs");

const EmployeeHistory = require("./employeeHistory.js");
const { closeSync } = require("fs");

const Employee = sequelize.define("Employee", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true, // Ensure auto-increment
    primaryKey: true, // Explicitly set primary key
  },
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
    type: DataTypes.ENUM(
      "kebele",
      "passport",
      "driving _License",
      "nationalID"
    ),
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
    defaultValue: true,
  },
  rejectionCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  acceptanceCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  totalPercent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isLoanEnabled: {
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

Employee.beforeUpdate(async (employee, options) => {
  console.log("Gemechu Bulti");
  const existingEmployee = await Employee.findByPk(employee.id);
  console.log(existingEmployee.phoneNumber);
  await EmployeeHistory.create({
    fullname: existingEmployee.fullname,
    image: existingEmployee.image,
    sex: existingEmployee.sex,
    date_of_birth: existingEmployee.date_of_birth,
    role: existingEmployee.role,
    nationality: existingEmployee.nationality,
    marriageStatus: existingEmployee.marriageStatus,
    employee_id_number: existingEmployee.employee_id_number,
    email: existingEmployee.email,
    phoneNumber: existingEmployee.phoneNumber,
    optionalNumber: existingEmployee.optionalNumber,
    id_image: existingEmployee.id_image,
    id_type: existingEmployee.id_type,
    id_Number: existingEmployee.id_Number,
    isDeactivated: existingEmployee.isDeactivated,
    hireDate: existingEmployee.hireDate,
    joiningDate: existingEmployee.joiningDate,
    password: existingEmployee.password,
    isActive: false,
    originalEmployeeId: existingEmployee.id,
    EmployeeId: employee.id,
    CompanyId: employee.CompanyId,
    changeTimestamp: new Date(),
  });
  // }
});

module.exports = Employee;
Company.hasMany(Employee);
Employee.belongsTo(Company);
