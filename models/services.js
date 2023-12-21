// models/ServiceModel.js

const { DataTypes } = require('sequelize');
const sequelize = require("../database/db.js");// Import your Sequelize instance

const ServiceModel = sequelize.define('ServiceModel', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
 
});

// Package.hasMany(ServiceModel);
// ServiceModel.belongsTo(Package);

module.exports = ServiceModel;





// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../database/db.js");
// const Company = require("./company.js");
// const Package = require("./package.js");

// const Service = sequelize.define("Service", {
//   serviceName: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });

// Package.hasMany(Service);
// Service.belongsTo(Package);

// module.exports = Service;


