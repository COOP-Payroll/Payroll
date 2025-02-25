const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const DeductionDefinition = sequelize.define("DeductionDefinition", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // isPercent: {
  //   type: DataTypes.BOOLEAN,
  //   allowNull: false,
  // },
  // startingAmount: {
  //   type: DataTypes.FLOAT,
  //   defaultValue: 0,
  // },
});


module.exports = DeductionDefinition;

DeductionDefinition.belongsTo(Company);
Company.hasMany(DeductionDefinition);