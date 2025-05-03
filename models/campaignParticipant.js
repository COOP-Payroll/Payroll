// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../database/db.js");

// const Campaign = require("./campaigns.js");
// const Company = require("./company.js");
// const Region = require("./region.js");
// const Zone = require("./zone.js");
// const Woreda = require("./woreda.js");

// const CampaignParticipant = sequelize.define("CampaignParticipant", {
//   fullName: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   sex: {
//     type: DataTypes.ENUM("MALE", "FEMALE", "OTHER"),
//     allowNull: false,
//   },
//   age: {
//     type: DataTypes.INTEGER,
//   },
//   nationalId: {
//     type: DataTypes.STRING,
//   },
//   address: {
//     type: DataTypes.STRING,
//   },
//   email: {
//     type: DataTypes.STRING,
//     validate: { isEmail: true },
//   },
//   phoneNumber: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   accountNumber: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   paymentMethod: {
//     type: DataTypes.ENUM("PHONENUMBER", "ACCOUNTNUMBER"),
//     allowNull: false,
//   },
//   detail: {
//     type: DataTypes.TEXT,
//   },
//   isVerified: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
//   status: {
//     type: DataTypes.ENUM("INVITED", "CONFIRMED", "CANCELLED"),
//     defaultValue: "INVITED",
//   },
//   isActive: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true,
//   },
//   regionId: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: Region,
//       key: "id",
//     },
//   },
//   zoneId: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: Zone,
//       key: "id",
//     },
//   },
//   woredaId: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: Woreda,
//       key: "id",
//     },
//   },
// });

// // Relationships
// CampaignParticipant.belongsTo(Campaign);
// Campaign.hasMany(CampaignParticipant);

// module.exports = CampaignParticipant;
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Region = require("./region");
const Zone = require("./zone");
const Woreda = require("./woreda");

const CampaignParticipant = sequelize.define("CampaignParticipant", {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sex: {
    type: DataTypes.ENUM("MALE", "FEMALE", "OTHER"),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  age: DataTypes.INTEGER,
  nationalId: DataTypes.STRING,
  address: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    validate: { isEmail: true },
  },
  phoneNumber: DataTypes.STRING,
  accountNumber: DataTypes.STRING,
  paymentMethod: {
    type: DataTypes.ENUM("PHONENUMBER", "ACCOUNTNUMBER"),
    allowNull: false,
  },
  detail: DataTypes.TEXT,
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM("INVITED", "CONFIRMED", "CANCELLED"),
    defaultValue: "INVITED",
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  regionId: {
    type: DataTypes.INTEGER,
    references: {
      model: Region,
      key: "id",
    },
  },
  zoneId: {
    type: DataTypes.INTEGER,
    references: {
      model: Zone,
      key: "id",
    },
  },
  woredaId: {
    type: DataTypes.INTEGER,
    references: {
      model: Woreda,
      key: "id",
    },
  },
});

module.exports = CampaignParticipant;
