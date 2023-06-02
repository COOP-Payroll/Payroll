const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const CustomRole = require("./customRole.js");

const Permission = sequelize.define("Permission", {
  module: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAccessible: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // read: {
  //   type: DataTypes.BOOLEAN,
  //   defaultValue: false,
  // },

  // write: {
  //   type: DataTypes.BOOLEAN,
  //   defaultValue: false,
  // },
  // update: {
  //   type: DataTypes.BOOLEAN,
  //   defaultValue: false,
  // },
  // delete: {
  //   type: DataTypes.BOOLEAN,
  //   defaultValue: false,
  // },
  ///Employee ID
});

Company.hasMany(Permission);
Permission.belongsTo(Company);

CustomRole.hasMany(Permission);
Permission.belongsTo(CustomRole);

module.exports = Permission;
