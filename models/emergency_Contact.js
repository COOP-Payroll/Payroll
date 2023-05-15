const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const EmergencyContact = sequelize.define("EmergencyContact", {
    relation: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    optionalPhoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    kebele: {
        type: DataTypes.STRING,
        allowNull: false,
    },
///Employee ID
});

//Company.hasMany(Department);
// Department.belongsTo(Company);

module.exports = EmergencyContact;
