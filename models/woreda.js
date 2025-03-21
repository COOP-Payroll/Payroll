const { DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Zone = require("./zone");

const Woreda = sequelize.define("Woreda", {
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

module.exports = Woreda;
Zone.hasMany(Woreda);
Woreda.belongsTo(Zone);
