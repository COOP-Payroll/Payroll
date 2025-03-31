const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const ContactUs = sequelize.define("ContactUs", {
  fullname: {
    type: DataTypes.STRING,
    // allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    //  allowNull:false
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = ContactUs;
