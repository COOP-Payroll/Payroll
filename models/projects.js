const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Sponsors = require("./sponsor.js");
const Company = require("./company.js");
const Projects = sequelize.define("Projects", {
  projectName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
 });
Projects.belongsTo(Sponsors);
Sponsors.hasMany(Projects);

Projects.belongsTo(Company);
Company.hasMany(Projects);

module.exports = Projects;
