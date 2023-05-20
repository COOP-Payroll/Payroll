const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Employee = require("./employee.js");

const EmployeeInfo = sequelize.define("EmployeeInfo", {
  employeeTIN: {
    type: DataTypes.STRING,
  },
  hireDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  employee_Code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  basicSalary: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  //Grade ID
  //CUSTOM ROLE
  //DEPARTMENT ID
  // houseNumber: {
  //     type: DataTypes.STRING,
  //     allowNull: false,
  // },
});

//Company.hasMany(Department);
// Department.belongsTo(Company);

module.exports = EmployeeInfo;
