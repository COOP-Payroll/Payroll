const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const bcrypt = require("bcryptjs");
const Region = require("./region.js");
const Zone = require("./zone.js");
const Woreda = require("./woreda.js");

const Company = sequelize.define("Company", {
  // numberOfEmployees: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  // },
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
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    // allowNull: false,
  },

  // regionId: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  //   references: {
  //     model: "Regions",
  //     // key: "id",
  //   },
  // },

  // zoneId: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  //   references: {
  //     model: "Zones",
  //     key: "id",
  //   },
  // },

  // woredaId: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  //   references: {
  //     model: "Woredas",
  //     key: "id",
  //   },
  // },

  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  role: {
    type: DataTypes.STRING,
    defaultValue: "companyAdmin",
  },

  companyCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  isLoanGranted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  resetPasswordTokenCreatedAt: {
    type: DataTypes.DATE,
  },
  level: {
    type: DataTypes.ENUM("REGION", "ZONE", "WOREDA"),
    // allowNull: false,
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
Company.belongsTo(Region, { foreignKey: "regionId", as: "region" });
Region.hasMany(Company, { foreignKey: "regionId", as: "companies" });
Company.belongsTo(Zone, { foreignKey: "zoneId", as: "zone" });
Zone.hasMany(Company, { foreignKey: "zoneId", as: "companies" });

Company.belongsTo(Woreda, { foreignKey: "woredaId", as: "Woreda" });
Woreda.hasMany(Company, { foreignKey: "woredaId", as: "companies" });
