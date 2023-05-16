const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const User = require("./user.js");

const Pension = sequelize.define("Pension", {
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

Company.hasMany(Pension);
Pension.belongsTo(Company);

User.hasMany(Pension);
Pension.belongsTo(User);

module.exports = Pension;
