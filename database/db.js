const { Sequelize, Model, DataTypes } = require("sequelize");

const sequelize = new Sequelize("payroll-db", "user", "pass", {
  // dialect: "postgres",
  // host: "localhost",
  // // storage: "./payroll.db",
  // logging: false,\
  "dialect": "sqlite",
  "storage": "payroll.db",
  "logging": false
});

module.exports = sequelize;
