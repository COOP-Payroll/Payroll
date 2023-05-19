const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const bcrypt = require("bcrypt");

const Company = sequelize.define("Company", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numberOfEmployees: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM,
    values: ["pending", "active", "blocked", "denied"],
    defaultValue: "pending",
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "companyAdmin",
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  companyCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: "Ethiopia",
  },
});

Company.beforeCreate((company, options) => {
  const saltRounds = 10;
  return bcrypt
    .hash(company.password, saltRounds)
    .then((hash) => {
      company.password = hash;
    })
    .catch((err) => {
      throw new Error(err);
    });
});

Company.beforeUpdate((company, options) => {
  if (company.changed("password")) {
    const saltRounds = 10;
    return bcrypt
      .hash(company.password, saltRounds)
      .then((hash) => {
        company.password = hash;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }
});

module.exports = Company;
