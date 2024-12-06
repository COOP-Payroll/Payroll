const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const bcrypt = require("bcrypt");

const Company = sequelize.define("Company", {
  name: {
    type: DataTypes.STRING,
    // allowNull: false,
  },
  numberOfEmployees: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM,
    values: ["pending", "active", "reject", "denied"],
    defaultValue: "pending",
  },
  organizationName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Organization name cannot be null.",
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    // allowNull: false,
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
    // allowNull: false,
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
    defaultValue: "#00adef",
  },
  primary_Font_Color: {
    type: DataTypes.STRING,
    defaultValue: "#000000",
  },
  primary_Gradient_Color: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  secondary_Color: {
    type: DataTypes.STRING,
    defaultValue: "#008000",
  },
  secondary_Font_Color: {
    type: DataTypes.STRING,
    defaultValue: "#ffffff",
  },
  secondary_Gradient_Color: {
    type: DataTypes.STRING,
    defaultValue: "",
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

  accountNumber: {
    type: DataTypes.STRING,
  },
  isProjectBased: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isSetted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  resetPasswordTokenCreatedAt: {
    type: DataTypes.DATE,
  },
});

Company.beforeCreate((company, options) => {
  const saltRounds = 10;
  if (company.password != null && company.password === "") {
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

// Company.sync({ force: true }).then(() => console.log('positon model is ready'));
module.exports = Company;
