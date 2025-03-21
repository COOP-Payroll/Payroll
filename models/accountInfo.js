// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../database/db.js");
// const Company = require("./company.js");
// const Employee = require("./employee.js");

// const AccountInfo = sequelize.define("AccountInfo", {
//   accountNumber: {
//     type: DataTypes.STRING,
//     // allowNull: false,
//   },
//   image: {
//     type: DataTypes.STRING,
//   },
//   referenceNumber: {
//     type: DataTypes.STRING,
//     //  allowNull:false
//   },
//   referenceLetter: {
//     type: DataTypes.STRING,
//     // allowNull:false
//   },
//   isActive: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
//   isVerified: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
// });

// module.exports = AccountInfo;
// Employee.hasMany(AccountInfo);
// AccountInfo.belongsTo(Employee);

// Company.hasMany(AccountInfo);
// AccountInfo.belongsTo(Company);

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const Employee = require("./employee.js");

const AccountInfo = sequelize.define("AccountInfo", {
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true, // Phone number can be optional
  },
  image: {
    type: DataTypes.STRING,
  },
  referenceNumber: {
    type: DataTypes.STRING,
  },
  referenceLetter: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Default to inactive
  },
  isVerified:{
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Default to inactive
  },
  paymentMethod: {
    type: DataTypes.ENUM("phone", "account"),
    defaultValue: "account", // Default to accountNumber
  },
});

// Add relationships
Employee.hasMany(AccountInfo);
AccountInfo.belongsTo(Employee);

Company.hasMany(AccountInfo);
AccountInfo.belongsTo(Company);

module.exports = AccountInfo;
