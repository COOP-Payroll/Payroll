const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const Pension = sequelize.define("Pension", {
  employerContribution: {
    type: DataTypes.DOUBLE,
  },
  employeeContribution: {
    type: DataTypes.INTEGER,
  },
});

Company.hasMany(Pension);
Pension.belongsTo(Company);

module.exports = Pension;
