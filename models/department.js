const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Employee=require('./employee.js')

const Department = sequelize.define("Department", {
  deptName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  shorthandRepresentation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Company.hasMany(Department);
Department.belongsTo(Company);


Employee.hasOne(Department);
Department.belongsTo(Employee);

module.exports = Department;
