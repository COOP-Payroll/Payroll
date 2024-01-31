const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Employee = require("./employee.js");
const Modules = require("./addModules.js");

const CreateCustomRole = sequelize.define("CreateCustomRole", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Employee.hasOne(CreateCustomRole);
CreateCustomRole.belongsTo(Employee);

Company.hasMany(CreateCustomRole);
CreateCustomRole.belongsTo(Company);


Modules.belongsTo(CreateCustomRole);
CreateCustomRole.hasMany(Modules);
module.exports = CreateCustomRole;
