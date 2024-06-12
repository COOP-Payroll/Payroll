const { DataTypes } = require("sequelize");

const sequelize = require("../database/db.js");

const Services = sequelize.define("Services", {
    serviceName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        // allowNull: false,
    },
});

module.exports = Services;
