// projectEmployee.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const ProjectEmployee = sequelize.define("ProjectEmployee", {
  percent: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gross: {
    type: DataTypes.STRING,
    allowNull: false,

  }
});
// ProjectEmployee.sync({ force: true }).then(() => console.log('positon model is ready'));
module.exports = ProjectEmployee;
