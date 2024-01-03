const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const Sponsor = sequelize.define("Sponsor", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },




});

Sponsor.belongsTo(Company);
Company.hasMany(Sponsor);

module.exports = Sponsor;
