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

    //   isPercent: {
    //     type: DataTypes.BOOLEAN,
    //     allowNull: false,
    //   },
    //   startingAmount: {
    //     type: DataTypes.FLOAT,
    //     defaultValue: 0,
    //   },
  }
);

AdditionalDeductionDefinition.belongsTo(Company);
Company.hasMany(AdditionalDeductionDefinition);


// AdditionalDeductionDefinition.belongsTo(Employee);
// Employee.hasMany(AdditionalDeductionDefinition);

module.exports = AdditionalDeductionDefinition;
