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
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: "#FFF",
  },
  companyLogo: {
    type: DataTypes.STRING,
  },

  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
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
  header: {
    type: DataTypes.STRING,
  },
  footer: {
    type: DataTypes.STRING,
  },
  //NEW CHANGE
  companyBanner: {
    type: DataTypes.STRING,
  },
  primary_Color: {
    type: DataTypes.STRING,
  },
  primary_Font_Color: {
    type: DataTypes.STRING,
  },
  primary_Gradient_Color: {
    type: DataTypes.STRING,
  },
  secondary_Color: {
    type: DataTypes.STRING,
  },
  secondary_Font_Color: {
    type: DataTypes.STRING,
  },
  social_Media_Images: {
    type: DataTypes.BOOLEAN,

    defaultValue: false,
  },
  region_or_City: {
    type: DataTypes.STRING,
  },
  fax: {
    type: DataTypes.STRING,
  },
  address_Street: {
    type: DataTypes.STRING,
  },
  notes: {
    type: DataTypes.STRING,
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
