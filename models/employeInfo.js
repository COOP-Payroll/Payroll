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
  // position: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
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
    type: DataTypes.DATE,
    defaultValue: new Date(),
  },
  terminationReason: {
    type: DataTypes.STRING,
  },
  terminationNotes: {
    type: DataTypes.STRING,  
  },
  siteLocation:{
    type: DataTypes.STRING,   
  }
});


Employee.hasMany(EmployeeInfo);
EmployeeInfo.belongsTo(Employee);
// EmployeeInfo.sync({ force: true }).then(() => console.log('positon model is ready'));
module.exports = EmployeeInfo;
