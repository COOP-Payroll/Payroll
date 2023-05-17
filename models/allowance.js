const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const AllowanceDefinition = require("./allowanceDefinition");
const Grade = require("./grade.js");

const Allowance = sequelize.define("Allowance", {
  amount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  //grade id
  //allowance id
});
Allowance.belongsTo(AllowanceDefinition);
AllowanceDefinition.hasMany(Allowance);

Allowance.belongsTo(Grade);
Grade.hasOne(Allowance);

module.exports = Allowance;
