const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const DeductionDefinition = require("./deductionDefinition.js");
const Grade = require("./grade.js");
const Company = require("./company.js");

const Deduction = sequelize.define("Deduction", {
  amount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  //grade id
  //Deduction id
});

Deduction.belongsTo(DeductionDefinition);
DeductionDefinition.hasMany(Deduction);

Deduction.belongsTo(Grade);
Grade.hasMany(Deduction);

Deduction.belongsTo(Company);
Company.hasMany(Deduction);
module.exports = Deduction;
