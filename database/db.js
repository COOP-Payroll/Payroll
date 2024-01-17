// const fs=require("fs")

// const { Sequelize, Model, DataTypes } = require("sequelize");
// const sslCertPath =
//   "C:\\Users\\gemechubf\\Documents\\Projects\\payroll project\\Payroll\\database\\ca.pem";
// const sequelize = new Sequelize(
//   "payrollDB",
//   "avnadmin",
//   "AVNS_1tPPo5MWLfsYI-bodW1",
//   {
//     // "dialect": "sqlite",
//     // "storage": "payroll.db",
//     // "logging": false
//     dialect: "postgres",
//     host: "pg-16ffb2b7-gemechubulti11-ee21.a.aivencloud.com",
//     port: 21239,
//     // database: "defaultdb",
//     logging: false,
//     dialectOptions: {
//       ssl: {
//         ca: fs.readFileSync(sslCertPath),
//       },
//     },
//   }
// );

// module.exports = sequelize;

const { Sequelize, Model, DataTypes } = require("sequelize");

const sequelize = new Sequelize("payroll-db", "user", "pass", {
  dialect: "sqlite",
  storage: "payroll.db",
  logging: false,
  // dialect: "postgres",
  // host: "pg-16ffb2b7-gemechubulti11-ee21.a.aivencloud.com",
  // port: 21239,
  // database: "defaultdb",
  // logging: false,
});

module.exports = sequelize;