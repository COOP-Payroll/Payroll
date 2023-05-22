const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const User = require("./user.js");

const ProvidentFund = sequelize.define("ProvidentFund", {
  employerContribution: {
    type: DataTypes.DOUBLE,
  },
  employeeContribution: {
    type: DataTypes.INTEGER,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

Company.hasMany(ProvidentFund);
ProvidentFund.belongsTo(Company);

User.hasMany(ProvidentFund);
ProvidentFund.belongsTo(User);

module.exports = ProvidentFund;
