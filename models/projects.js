const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Sponsors = require("./sponsor.js");
const Company = require("./company.js");
const Employee=require("./employee.js");

const ProjectEmployee = require("./project-employee.js");


const Projects = sequelize.define("Projects", {
  projectName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,

  },
  description: {
    type: DataTypes.STRING,

  },
  
 });
Projects.belongsTo(Sponsors);
Sponsors.hasMany(Projects);

// Projects.belongsTo(Employee);
// Employee.hasMany(Projects);


Projects.belongsTo(Company);
Company.hasMany(Projects);

Projects.belongsToMany(Employee, { through: ProjectEmployee });
Employee.belongsToMany(Projects, { through: ProjectEmployee });
module.exports = Projects;
