const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const AdditionalAllowanceDefinition = sequelize.define(
  "AdditionalAllowanceDefinition",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isTaxable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isExempted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    exemptedAmount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    //if taxable is true
    startingAmount: {
      type: DataTypes.FLOAT,
    },
  }
);


module.exports = AdditionalAllowanceDefinition;
AdditionalAllowanceDefinition.belongsTo(Company);
Company.hasMany(AdditionalAllowanceDefinition);
