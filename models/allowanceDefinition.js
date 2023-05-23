const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const AllowanceDefinition = sequelize.define("AllowanceDefinition", {
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
  
});

AllowanceDefinition.belongsTo(Company);
Company.hasMany(AllowanceDefinition);

module.exports = AllowanceDefinition;
