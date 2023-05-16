const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const AccountInfo = sequelize.define("AccountInfo", {
    accountNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
   
});

//Company.hasMany(Department);
// Department.belongsTo(Company);

module.exports = AccountInfo;
