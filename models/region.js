const { DataTypes } = require("sequelize");

const sequelize = require("../database/db.js");

const Region = sequelize.define("Region", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
    // unique: true,
  },
});

module.exports = Region;
