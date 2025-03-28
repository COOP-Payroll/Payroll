const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Employee = require("./employee.js");

const AdditionalDeductionDefinition = sequelize.define(
  "AdditionalDeductionDefinition",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    isPercent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }
);

// AdditionalDeductionDefinition.belongsTo(Employee);
// Employee.hasMany(AdditionalDeductionDefinition);

module.exports = AdditionalDeductionDefinition;

AdditionalDeductionDefinition.belongsTo(Company);
Company.hasMany(AdditionalDeductionDefinition);
