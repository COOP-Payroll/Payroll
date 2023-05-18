// Company.js

const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const IdFormat = sequelize.define("Company", {
  companyCode: {
    type: DataTypes.STRING,
  },
  year: {
    type: DataTypes.STRING,
  },
  department: {
    type: DataTypes.STRING,
  },
  separator: {
    type: DataTypes.STRING,
    default: "/",
  },
  order: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [["companyCode", "year", "department"]],
    },
  },
});

module.exports = IdFormat;
