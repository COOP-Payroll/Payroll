const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Employee = require("./employee.js");
const Company = require("./company.js");

const OTPayment = sequelize.define("OTPayment", {
  hour: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = OTPayment;
OTPayment.belongsTo(Company);
Company.hasMany(OTPayment);

OTPayment.belongsTo(Employee);
Employee.hasMany(OTPayment);
