const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const PerDiemRate = sequelize.define("PerDiemRate", {
  dailyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: "Per diem amount based on grade and location type",
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: "Mark active/inactive rates",
  },
});

Company.hasMany(PerDiemRate);
PerDiemRate.belongsTo(Company);

module.exports = PerDiemRate;
