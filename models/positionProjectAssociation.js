const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');
const Company= require("../models/company.js")
const PositionProjectAssociation = sequelize.define('PositionProjectAssociation', {
  noOfEmployees:{
  type:DataTypes.STRING,
  
 }
});
PositionProjectAssociation.belongsTo(Company);
Company.hasMany(PositionProjectAssociation);

// PositionProjectAssociation.sync({ force: true }).then(() => console.log('Projects model is ready'));
module.exports = PositionProjectAssociation;
