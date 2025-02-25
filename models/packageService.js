const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Employee = require("./employee.js");
const Grade = require("./grade.js");
const Services = require("./services.js");
const PackageInfo = require("./packages.js");

const PackageServices = sequelize.define("PackageServices", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  isAactive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

});




module.exports = PackageServices;
Services.belongsToMany(PackageInfo, {
  through: PackageServices,
});
PackageInfo.belongsToMany(Services, {
  through: PackageServices,
});