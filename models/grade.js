const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Employee=require('./employee.js')

const Grade = sequelize.define("Grade", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  minSalary: {
    type: DataTypes.FLOAT,
    defaultValue: false,
  },
  maxSalary: {
    type: DataTypes.FLOAT,
    defaultValue: false,
  },
});
Grade.belongsTo(Company);
Company.hasMany(Grade);

Grade.belongsTo(Employee);
Employee.hasOne(Grade);

module.exports = Grade;
