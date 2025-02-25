const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Employee = require("./employee.js");
const Grade = require("./grade.js");

const EmployeePromotion = sequelize.define("EmployeePromotion", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  position:{
    type:DataTypes.STRING,
    allowNull: false
  },
  salary:{
    type:DataTypes.FLOAT,
    allowNull: false
  },
  grade:{
    type:DataTypes.INTEGER,
    allowNull: false
  },
  letter:{
    type:DataTypes.STRING,
    allowNull: false
  }
});

//POSITION
//GRADE
//BASICSALARY
//LETTER




  
module.exports = EmployeePromotion;
Employee.belongsToMany( Grade,{
  through: EmployeePromotion,
  unique: false, // Allow duplicate associations
});
Grade.belongsToMany(Employee,{
  through: EmployeePromotion,
  unique: false, // Allow duplicate associations
});
