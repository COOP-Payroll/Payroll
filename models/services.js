const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Package = require("./package.js");

const Service = sequelize.define("Service", {

  serviceName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  

});

Package.hasMany(Service);
Service.belongsTo(Package);

module.exports = Service;
