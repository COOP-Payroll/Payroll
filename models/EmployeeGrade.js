const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Employee = require("./employee.js");
const Grade = require("./grade.js");

const EmployeeGrade = sequelize.define("EmployeeGrade", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  letter:{
    type: DataTypes.STRING

  }
});



module.exports = EmployeeGrade;
Employee.belongsToMany(Grade, {
  through: EmployeeGrade,
});
Grade.belongsToMany(Employee, {
  through: EmployeeGrade,
});