const { DataTypes } = require("sequelize");

const sequelize = require("../database/db.js");

const Services = sequelize.define("Services", {
    serviceName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Package.hasMany("Services")
// Services.sync({ force: true }).then(() => console.log('positon model is ready'));
module.exports = Services;
