const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const Sponsor = sequelize.define("Sponsor", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  budget:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountNumber:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  location:{
    type: DataTypes.STRING,
   
  }



});
Sponsor.belongsTo(Company);
Company.hasMany(Sponsor);
// Sponsor.sync({ force: false }).then(() => console.log('Sponsor model is ready'));
module.exports = Sponsor;
