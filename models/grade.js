const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const Grade = sequelize.define("Grade", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  minSalary: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  maxSalary: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

Grade.belongsTo(Company);
Company.hasMany(Grade);


module.exports = Grade;
