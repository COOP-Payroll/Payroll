const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Approver = require("./approver.js");
const Payroll = require("./Payroll.js");
const Company = require("./company.js");
const Employee = require('./employee.js')

const EmployeePayrollApprovement = sequelize.define(
    "EmployeePayrollApprovement",
    {
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
        validate: {
          isIn: [["pending", "approved", "rejected"]],
        },
      },
      remark: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rejectedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      approvedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
  );

EmployeePayrollApprovement.belongsTo(Payroll);
Payroll.hasMany(EmployeePayrollApprovement);

EmployeePayrollApprovement.belongsTo(Approver);
Approver.hasOne(EmployeePayrollApprovement);

EmployeePayrollApprovement.belongsTo(Company);
Company.hasMany(EmployeePayrollApprovement);

EmployeePayrollApprovement.belongsTo(Employee);
Employee.hasMany(EmployeePayrollApprovement);

module.exports = EmployeePayrollApprovement;


