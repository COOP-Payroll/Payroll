const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Package = require("./package.js");
// const Employee=require("./employee.js");
// const EmployeePosition = require("./employeePosition.js");
const Projects=require('./projects.js');
const PositionProjectAssociation = require("./positionProjectAssociation.js");

const Position = sequelize.define("Position", {
  positionName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
   
  },
});

// Employee.belongsToMany(Position, {
//   through: EmployeePosition,
// });
// Position.belongsToMany(Employee, {
//   through: EmployeePosition,
// });


// Position.belongsToMany(Employee, { through: EmployeePosition });
// Employee.belongsToMany(Position, { through: EmployeePosition });

Company.hasMany(Position);
Position.belongsTo(Company);
// Position.sync({ force: true }).then(() => console.log('positon model is ready'));
module.exports = Position;
