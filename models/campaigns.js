const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Region = require("./region");

const Campaign = sequelize.define("Campaign", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.TEXT,
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  regionId: {
    type: DataTypes.INTEGER,
    references: {
      model: Region,
      key: "id",
    },
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: "Array of document references and metadata",
  },

  budget: DataTypes.DOUBLE,
  status: {
    type: DataTypes.ENUM("PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"),
    defaultValue: "PLANNED",
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // New fields for health campaigns
  campaignType: {
    type: DataTypes.ENUM(
      "VACCINATION",
      "AWARENESS",
      "SCREENING",
      "TREATMENT",
      "PREVENTION",
      "OTHER"
    ),
    allowNull: false,
  },
  targetPopulation: {
    type: DataTypes.STRING,
    comment: "Specific demographic or group targeted by the campaign",
  },
  healthOutcome: {
    type: DataTypes.STRING,
    comment: "Expected health outcome or impact",
  },
  successMetrics: {
    type: DataTypes.TEXT,
    comment: "Key performance indicators and success criteria",
  },
  requiredResources: {
    type: DataTypes.TEXT,
    comment: "List of required medical supplies, personnel, and equipment",
  },
  approvalStatus: {
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
    defaultValue: "PENDING",
  },
  approvalDate: DataTypes.DATE,
  approvedBy: DataTypes.STRING,
  complianceRequirements: {
    type: DataTypes.TEXT,
    comment: "Regulatory and compliance requirements",
  },
  riskAssessment: {
    type: DataTypes.TEXT,
    comment: "Potential risks and mitigation strategies",
  },
  reportingFrequency: {
    type: DataTypes.ENUM("DAILY", "WEEKLY", "MONTHLY", "QUARTERLY"),
    defaultValue: "WEEKLY",
  },
});

module.exports = Campaign;

// Associations
const CampaignParticipant = require("./campaignParticipant");
Campaign.hasMany(CampaignParticipant);
CampaignParticipant.belongsTo(Campaign);

// ✅ Add this
Campaign.belongsTo(Region, { foreignKey: "regionId" });
Region.hasMany(Campaign, { foreignKey: "regionId" });
