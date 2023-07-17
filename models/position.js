const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Package = require("./package.js");
const Employee=require("./employee.js");

const Position = sequelize.define("Position", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Employee.hasMany(Position);
Position.belongsTo(Employee);

module.exports = Position;
