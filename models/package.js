const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Package = sequelize.define("Package", {
  packageName: {
    type: DataTypes.ENUM("Trial", "Monthly", "Annual", "Unlimitted"),
    allowNull: false,
  },
  price: {
    type: DataTypes.DOUBLE,
  },
  min_employee: {
    type: DataTypes.INTEGER,
  },
  max_employee: {
    type: DataTypes.INTEGER,
  },
  service: {
    type: DataTypes.TEXT, // TEXT
  },
  discount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isTrial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Package;
