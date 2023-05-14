const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Package = require("../models/package.js");
const Company = require("../models/company.js");

const Subscription = sequelize.define("Subscription", {
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nextPaymentDate: {
    type: DataTypes.DATE,
  },
  leftPaymentDate: {
    type: DataTypes.INTEGER,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

Subscription.belongsTo(Package);
Package.hasOne(Subscription);

Subscription.belongsTo(Company);
Company.hasOne(Subscription);

module.exports = Subscription;
