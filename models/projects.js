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


Sponsors.belongsTo(Company);
Company.hasMany(Sponsors);

module.exports = Projects;
