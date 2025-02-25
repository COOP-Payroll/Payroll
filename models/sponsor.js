const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const AccountInfo = require("./accountInfo.js");

const Sponsor = sequelize.define("Sponsor", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shortCode:{
    type: DataTypes.STRING,
  },
  budget:{
    type: DataTypes.STRING,
    allowNull: false,
  },
  // accountNumber:{
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  location:{
    type: DataTypes.STRING,
   
  }



});

// Sponsor.sync({ force: false }).then(() => console.log('Sponsor model is ready'));
module.exports = Sponsor;
Sponsor.belongsTo(Company);
Company.hasMany(Sponsor);

Sponsor.hasMany(AccountInfo);
AccountInfo.belongsTo(Sponsor);