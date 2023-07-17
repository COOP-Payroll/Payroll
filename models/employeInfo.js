const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Employee = require("./employee.js");

const EmployeeInfo = sequelize.define("EmployeeInfo", {
  employeeTIN: {
    type: DataTypes.STRING,
  },
  hireDate: {
    type: DataTypes.STRING,
 
  },
  basicSalary: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employement_Type: {
    type: DataTypes.ENUM("permanent", "contract", "hourly"),
    allowNull: false,
    defaultValue: "permanent",
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  //TERMINATION INFORMATION

  terminationDate: {
    type: DataTypes.STRING,
  },
  terminationReason: {
    type: DataTypes.STRING,
  },
  terminationNotes: {
    type: DataTypes.STRING,
  
  },
});


Employee.hasMany(EmployeeInfo);
EmployeeInfo.belongsTo(Employee);

module.exports = EmployeeInfo;
