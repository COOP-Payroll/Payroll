

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
// projectEmployeeHistory.js

const ProjectEmployeeHistory = sequelize.define("ProjectEmployeeHistory", {
    ProjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    EmployeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    percent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gross: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Additional timestamp field
    startingFrom: {
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
  });

  Company.hasMany(ProjectEmployeeHistory);
  ProjectEmployeeHistory.belongsTo(Company);



  // ProjectEmployeeHistory.sync({ force: true }).then(() => console.log('Projects model is ready'));
  module.exports = ProjectEmployeeHistory;