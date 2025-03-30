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
      type: DataTypes.ENUM("hourly", "amount"), // Replace with your actual ENUM values
      defaultValue: "amount", // Set a default value from your ENUM values
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    validate: {
      validateEnumValue() {
        if (!["hourly", "amount"].includes(this.type)) {
          throw new Error(
            'Invalid value for "type". It must be "hourly" or "amount".'
          );
        }
      },
    },
  }
);

module.exports = AdditionalPayDefinition;
AdditionalPayDefinition.belongsTo(Company);
Company.hasMany(AdditionalPayDefinition);
