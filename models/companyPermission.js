const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Department = require("./department.js");
const Company = require("./company.js");

const Permissions= require("./permission.js")
const CompanyPermission = sequelize.define("CompanyPermission", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});



module.exports = CompanyPermission;
Company.belongsToMany(Permissions, {
  through: CompanyPermission,
});
Permissions.belongsToMany(Company, {
  through: CompanyPermission,
});