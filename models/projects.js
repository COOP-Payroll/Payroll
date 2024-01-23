const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Sponsors = require("./sponsor.js");
const Company = require("./company.js");
const Employee=require("./employee.js");
const Position =require("./position.js");
const PositionProjectAssociation=require("./positionProjectAssociation.js");

const ProjectEmployee = require("./project-employee.js");
const AccountInfo = require("./accountInfo.js");


const Projects = sequelize.define("Projects", {
  projectName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // accountNumber: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  location: {
    type: DataTypes.STRING,
  },
  budget:{
    type: DataTypes.NUMBER,
  },

  numberOfEmployees: {
    type: DataTypes.STRING,
  }, 
  startDate:{
    type: DataTypes.DATE,
    allowNull:false
  },
  endDate:{
    type: DataTypes.DATE,
    allowNull:false,
 
  },
  description: {
    type: DataTypes.STRING,

  },
 
  
 });


 // Sync only the Projects model

 
Projects.belongsTo(Sponsors);
Sponsors.hasMany(Projects);

// Projects.belongsTo(Employee);
// Employee.hasMany(Projects);


Projects.belongsTo(Company);
Company.hasMany(Projects);

Position.belongsToMany(Projects, { through: PositionProjectAssociation });
Projects.belongsToMany(Position, { through: PositionProjectAssociation });

Projects.belongsToMany(Employee, { through: ProjectEmployee });
Employee.belongsToMany(Projects, { through: ProjectEmployee });

Projects.hasMany(AccountInfo);
AccountInfo.belongsTo(Projects);

ProjectEmployee.belongsTo(Projects);
Projects.hasMany(ProjectEmployee);

ProjectEmployee.belongsTo(Employee);
Employee.hasMany(ProjectEmployee);
// Projects.sync({ force: true }).then(() => console.log('Projects model is ready'));
module.exports = Projects;
