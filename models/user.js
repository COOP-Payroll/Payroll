const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const bcrypt = require("bcrypt");

const User = sequelize.define("User", {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  AccountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "superAdmin",
  },
});

User.beforeCreate((user, options) => {
  const saltRounds = 10;
  return bcrypt
    .hash(user.password, saltRounds)
    .then((hash) => {
      user.password = hash;
    })
    .catch((err) => {
      throw new Error(err);
    });
});

User.beforeUpdate((user, options) => {
  if (user.changed("password")) {
    const saltRounds = 10;
    return bcrypt
      .hash(user.password, saltRounds)
      .then((hash) => {
        user.password = hash;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }
});

module.exports = User;
