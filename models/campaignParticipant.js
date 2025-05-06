const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Region = require("./region");
const Zone = require("./zone");
const Woreda = require("./woreda");
const Participant = require("./participants.js");
const Campaign = require("./campaigns.js");

const CampaignParticipant = sequelize.define("CampaignParticipant", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: true,
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

Participant.belongsToMany(Campaign, {
  through: CampaignParticipant,
  // foreignKey: "participantId",
});

Campaign.belongsToMany(Participant, {
  through: CampaignParticipant,
  // foreignKey: "campaignId",
});
CampaignParticipant.belongsTo(Participant, {
  foreignKey: "ParticipantId",
});
module.exports = CampaignParticipant;
CampaignParticipant.belongsTo(Region, { foreignKey: "regionId" });
CampaignParticipant.belongsTo(Zone, { foreignKey: "zoneId" });
CampaignParticipant.belongsTo(Woreda, { foreignKey: "woredaId" });
