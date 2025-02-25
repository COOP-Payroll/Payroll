const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
// projectEmployeeHistory.js

const ProjectPositionHistory = sequelize.define("ProjectPositionHistory", {
  ProjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  PositionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  noOfEmployees: {
    type: DataTypes.INTEGER,
  },
  noOfAssignedEmployees: {
    //assigned employee
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  maximumPercentAllocation: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Additional timestamp field
  startingFrom: {
    type: DataTypes.DATE,
    defaultValue: new Date(),
  },
});

//  ProjectPositionHistory.sync({ force: true }).then(() => console.log('Projects model is ready'));
module.exports = ProjectPositionHistory;
Company.hasMany(ProjectPositionHistory);
ProjectPositionHistory.belongsTo(Company);
