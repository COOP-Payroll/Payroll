const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const PasswordResetRequest = sequelize.define("PasswordResetRequest", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  companyCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reset_token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiration_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    // allowNull: false,
    defaultValue: true,
  },
});

module.exports = PasswordResetRequest;
