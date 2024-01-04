// projectEmployee.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const ProjectEmployee = sequelize.define("ProjectEmployee", {
  percent: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = ProjectEmployee;
