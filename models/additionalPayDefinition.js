const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const AdditionalPayDefinition = sequelize.define(
  "AdditionalPayDefinition",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('allowance', 'deduction'), // Replace with your actual ENUM values
      defaultValue: 'allowance', // Set a default value from your ENUM values
    }
  }, {
    validate: {
      validateEnumValue() {
        if (!['allowance', 'deduction'].includes(this.type)) {
          throw new Error('Invalid value for "type". It must be "allowance" or "deduction".');
        }
      }
    }
  }
);

AdditionalPayDefinition.belongsTo(Company);
Company.hasMany(AdditionalPayDefinition);

module.exports = AdditionalPayDefinition;
