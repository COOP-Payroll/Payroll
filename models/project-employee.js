// projectEmployee.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company=require("../models/company.js")
const PositionProjectAssociation=require("../models/positionProjectAssociation.js")
const ProjectEmployee = sequelize.define("ProjectEmployee", {
  percent: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalPercent:{
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  gross: {
    type: DataTypes.STRING,
    allowNull: false,

  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});
ProjectEmployee.belongsTo(Company);
Company.hasMany(ProjectEmployee);

// PositionProjectAssociation.hasMany(ProjectEmployee);
// ProjectEmployee.belongsTo(PositionProjectAssociation);


// ProjectEmployee.sync({ force: true }).then(() => console.log('positon model is ready'));
module.exports = ProjectEmployee;
