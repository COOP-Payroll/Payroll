const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("../models/company.js");
const bcrypt = require("bcryptjs");
const Employee=require("../models/employee.js")
const EmployeeHistory = sequelize.define("EmployeeHistory", {
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
    type: DataTypes.ENUM("kebele", "passport", "driving_License"),
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
  changeTimestamp: {
    type: DataTypes.DATE,
    defaultValue: new Date(),
  },
  EmployeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  CompanyId:{
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

// EmployeeHistory.beforeCreate((employeeHistory, options) => {
//   // Additional logic to set history-specific fields if needed
// });

// EmployeeHistory.sync({force:true})


module.exports = EmployeeHistory;
Company.hasMany(EmployeeHistory);
EmployeeHistory.belongsTo(Company);
