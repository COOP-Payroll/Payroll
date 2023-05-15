const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const DeductionDefinition = require('./deductionDefinition.js');
const Grade = require("./grade.js");

const Deduction = sequelize.define("Deduction", {
  amount:{
    type: DataTypes.STRING,
    allowNull: false,
  }
//grade id
//Deduction id
});
Deduction.belongsTo(DeductionDefinition);
DeductionDefinition.hasMany(Deduction);

Deduction.belongsTo(Grade);
Grade.hasOne(Deduction);


module.exports = Deduction;
