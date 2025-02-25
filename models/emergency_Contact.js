const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Employee = require("./employee.js");

const EmergencyContact = sequelize.define("EmergencyContact", {
  relation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  fullname: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  ///Employee ID
});



module.exports = EmergencyContact;
Employee.hasMany(EmergencyContact);
EmergencyContact.belongsTo(Employee);