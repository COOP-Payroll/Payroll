const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Package = require("../models/package.js");
const Company = require("../models/company.js");

const Employee = sequelize.define("Employee", {
    fullname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    images: {
        type: DataTypes.STRING,
    },
    sex: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date_of_birth: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('employee', 'approver',),
        allowNull: false
        
    },
    nationality: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    marriageStatus: {
     
        type: DataTypes.ENUM('Single', 'Married', 'Divorced'), 
        defaultValue: true,
    },
    id_number: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    employeeTIN: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    email: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    phoneNumber: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    optionalNumber: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isDeactivated: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    hireDate: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    joiningDate: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    employeeCode: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },

    accountNumber: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    password: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
},
    

});

Subscription.belongsTo(Package);
Package.hasOne(Subscription);

Subscription.belongsTo(Company);
Company.hasOne(Subscription);

module.exports = Employee;
