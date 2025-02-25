const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Department = require("./department.js");
const CustomRole = require("./customRole.js");
const Company = require("./company.js");

const CompanyCustomRole = sequelize.define("CompanyCustomRole", {
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



module.exports = CompanyCustomRole;
Company.belongsToMany(CustomRole, {
  through: CompanyCustomRole,
});
CustomRole.belongsToMany(Company, {
  through: CompanyCustomRole,
});