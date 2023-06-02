const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Modules = sequelize.define("Modules", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
 

});

module.exports = Modules;
