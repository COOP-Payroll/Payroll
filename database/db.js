const { Sequelize, Model, DataTypes } = require("sequelize");

const sequelize = new Sequelize("payroll-db", "user", "pass", {
  dialect: "sqlite",
  storage: "./payroll.db",
  logging: false,
});

module.exports = sequelize;
