const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Employee = require("./employee.js");

const AccountInfo = sequelize.define("AccountInfo", {
  accountNumber: {
    type: DataTypes.STRING,
    // allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
  },
   referenceNumber:{
   type:DataTypes.STRING,
  //  allowNull:false
   },
   referenceLetter:{
    type:DataTypes.STRING,
    // allowNull:false
    },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});



module.exports = AccountInfo;
Employee.hasMany(AccountInfo);
AccountInfo.belongsTo(Employee);


Company.hasMany(AccountInfo);
AccountInfo.belongsTo(Company);
