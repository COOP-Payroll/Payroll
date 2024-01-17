const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db");
const Company = require("./company.js");

const CompanyAccountInfo = sequelize.define("CompanyAccountInfo", {
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Company.hasMany(CompanyAccountInfo, {
//   onDelete: "CASCADE",
// });
// CompanyAccountInfo.belongsTo(Company);

module.exports = CompanyAccountInfo;
