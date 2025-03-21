const { DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Region = require("./region");

const Zone = sequelize.define("Zone", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Zone;
Region.hasMany(Zone);
Zone.belongsTo(Region);
