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
    type: DataTypes.ENUM("MALE", "FEMALE"),
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
    // validate: { isEmail: true },
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
  paymentStatus: {
    type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED", "REJECTED"),
    defaultValue: "PENDING",
  },
  approvalStatus: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
    defaultValue: "PENDING",
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
CampaignParticipant.belongsTo(Region, { foreignKey: "regionId" });
CampaignParticipant.belongsTo(Zone, { foreignKey: "zoneId" });
CampaignParticipant.belongsTo(Woreda, { foreignKey: "woredaId" });

module.exports = CampaignParticipant;
