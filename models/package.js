const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
// const ServiceModel=require("../models/services.js")
const Package = sequelize.define("Package", {
  
  packageName: {
    type: DataTypes.ENUM("Custom", "Gold", "Platinium","Trial"),
    allowNull: false,
    validate: {
      isIn: [['Custom', 'Gold','Platinium','Trial']],
    },
  },
  packageType:{
    type: DataTypes.ENUM("Yearly", "Monthly","Trial"),
    allowNull: false,
    validate: {
      isIn: [['Yearly', 'Monthly','Trial']],
    },
  },
  ///
  price: {
    type: DataTypes.DOUBLE,
  },
  min_employee: {
    type: DataTypes.INTEGER,
  },
  max_employee: {
    type: DataTypes.INTEGER,
  },
  service: {
    type: DataTypes.JSON, // Use JSON type for storing JSON data
    defaultValue: [], // Default value as an empty array
  },
  discount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isTrial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Define a one-to-many association between PackageModel and ServiceModel
// Package.hasMany(ServiceModel, { as: 'services' });


module.exports = Package;