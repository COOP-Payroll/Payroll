const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const Address = sequelize.define("Address", {
    country: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.STRING,
    
    },

    zone_or_city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    woreda: {
        type: DataTypes.STRING,
        
    },
    kebele: {
        type: DataTypes.STRING,
        
    },
    houseNumber: {
        type: DataTypes.STRING,
     
    },
});

//Company.hasMany(Department);
// Department.belongsTo(Company);

module.exports = Address;
