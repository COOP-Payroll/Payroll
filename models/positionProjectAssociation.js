const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');
const Company= require("../models/company.js")
const PositionProjectAssociation = sequelize.define('PositionProjectAssociation', {
  noOfEmployees:{
  type:DataTypes.INTEGER,
  
 },
 noOfAssignedEmployees: {//assigned employee
  type: DataTypes.INTEGER,
  defaultValue:0
},
maximumPercentAllocation:{
  type: DataTypes.INTEGER,
  defaultValue:0
},
isActive: {
  type: DataTypes.BOOLEAN,
  defaultValue: true
}
});
PositionProjectAssociation.belongsTo(Company);
Company.hasMany(PositionProjectAssociation);

// PositionProjectAssociation.sync({ force: true }).then(() => console.log('Projects model is ready'));
module.exports = PositionProjectAssociation;
