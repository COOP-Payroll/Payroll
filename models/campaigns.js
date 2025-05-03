// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../database/db.js");


// const CampaignParticipant = require("./campaignParticipant.js");

// const Campaign = sequelize.define("Campaign", {
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   description: {
//     type: DataTypes.TEXT,
//   },
//   startDate: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   endDate: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   budget: {
//     type: DataTypes.DOUBLE,
//   },
//   status: {
//     type: DataTypes.ENUM("PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"),
//     defaultValue: "PLANNED",
//   },
//   isActive: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true,
//   },
// });

// // Campaign.hasMany(CampaignParticipant);
// // CampaignParticipant.belongsTo(Campaign);


// module.exports = Campaign;
// const { DataTypes } = require("sequelize");
// const sequelize = require("../database/db.js");
// const Region = require("./region");
// const Campaign = sequelize.define("Campaign", {
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   description: DataTypes.TEXT,
//   startDate: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   endDate: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   regionId: {
//     type: DataTypes.INTEGER,
//     references: {
//       model: Region,
//       key: "id",
//     },
//   },
//   budget: DataTypes.DOUBLE,
//   status: {
//     type: DataTypes.ENUM("PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"),
//     defaultValue: "PLANNED",
//   },
//   isActive: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true,
//   },
// });

// module.exports = Campaign;

// // ⚠️ Define associations *after* export to avoid circular require issues
// const CampaignParticipant = require("./campaignParticipant");
// Campaign.hasMany(CampaignParticipant);
// CampaignParticipant.belongsTo(Campaign);



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
  budget: DataTypes.DOUBLE,
  status: {
    type: DataTypes.ENUM("PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"),
    defaultValue: "PLANNED",
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
