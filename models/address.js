const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Employee = require("./employee.js");

const Address = sequelize.define("Address", {
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
  },

  zone_or_city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  woreda: {
    type: DataTypes.STRING,
  },
  kebele: {
    type: DataTypes.STRING,
  },
  houseNumber: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});



module.exports = Address;
Employee.hasOne(Address);
Address.belongsTo(Employee);