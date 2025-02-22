// const fs=require("fs")

// const { Sequelize, Model, DataTypes } = require("sequelize");
// // const sslCertPath =
//   // "C:\\Users\\gemechubf\\Documents\\Projects\\payroll project\\Payroll\\database\\ca.pem";
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
//         // ca: fs.readFileSync(sslCertPath),
//       },
//     },
//   }
// );

// module.exports = sequelize;

// const { Sequelize, Model, DataTypes } = require("sequelize");

// const sequelize = new Sequelize("payroll-db", "user", "pass", {
//   dialect: "sqlite",
//   storage: "payroll.db",
//   logging: false,
//   // dialect: "postgres",
//   // host: "pg-16ffb2b7-gemechubulti11-ee21.a.aivencloud.com",
//   // port: 21239,
//   // database: "defaultdb",
//   // logging: false,
// });

// module.exports = sequelize;

require("dotenv").config();
// const { Sequelize } = require("sequelize");
// const CustomError = require("../utils/ErrorHandler");
// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('postgres://pgdb_1cwn_user:IVlhbD6rRoHWqVQtiDQpUyfNSQ6AAQQB@dpg-cmntv9o21fec73ctip3g-a.oregon-postgres.render.com/pgdb_1cwn', {
//   dialect: 'postgres',
//   protocol: 'postgres',
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false,
//     },
//   },
// });

// module.exports = sequelize;
// // Test the database connection
// async function testConnection() {
//   try {
//     await sequelize.authenticate();
//     console.log("Database connection has been established successfully.");
//   } catch (error) {
//     console.error("Error connecting",error);
//   }
// }
// // sequelize.sync({ alter: true }) // Use force: true carefully, as it drops existing tables
// //   .then(() => {
// //     console.log('Database synchronized successfully.');
// //   })
// //   .catch((error) => {
// //     console.error('Error synchronizing database:', error);
// //   });
// testConnection();
// module.exports = sequelize;

// /LOCAL DATABASE

// const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize("PSAAS", "postgres", "pass", {
//   host: "localhost", // or your PostgreSQL host
//   dialect: "postgres",
//   port: 5432, // Default PostgreSQL port
//   logging: false,
// });

// // Synchronize the database, create tables if they don't exist
//  sequelize.sync({alter:true})
//   .then(() => {
//     console.log('Database synchronized.');
//   })
//   .catch(err => {
//     console.error('Error synchronizing database:', err);
//   });

// module.exports = sequelize;

//PRODUCTION DATABASE

const { Sequelize } = require("sequelize");
// const CustomError = require("../utils/ErrorHandler");
const sequelize = new Sequelize({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || "5432",
  database: process.env.DB_NAME || "",
  username: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  dialect: "postgres",
  pool: {
    max: 500, // Increase the maximum number of connections
    min: 0, // Minimum number of connections
    acquire: 300000, // Maximum time (in ms) to try getting a connection
    idle: 100000, // Time (in ms) before releasing an idle connection
  },
});
// Test the database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Error connecting");
  }
}

// sequelize
//   .sync({ alter: true }) // Use force: true carefully, as it drops existing tables
//   .then(() => {
//     console.log("Database synchronized successfully.");
//   })
//   .catch((error) => {
//     console.error("Erro r synchronizing database:", error);
//   });

testConnection();
module.exports = sequelize;

/////////////////////////////////////////////////////////////////

///RENDER

// require("dotenv").config();
// const { Sequelize } = require("sequelize");
// // const CustomError = require("../utils/ErrorHandler");
// const sequelize = new Sequelize('postgresql://database_ilt0_user:xihY6VoS4jtxpY2o8w6UNMn4C5VqWBkG@dpg-ct9fajl6l47c73as14kg-a.oregon-postgres.render.com/database_ilt0',{

//   dialect: "postgres",
//   dialectOptions: {
//     ssl: {
//       require: true, // This will help in ensuring SSL connection
//       rejectUnauthorized: false // This might be necessary for some providers like Heroku
//     }
//   }
// });
// // Test the database connection
// async function testConnection() {
//   try {
//     await sequelize.authenticate();
//     console.log("Database connection has been established successfully.");
//   } catch (error) {
//     console.log(error)
//     console.log(process.env.DB_HOST)
//     console.error("Error connecting");
//   }
// }
// // sequelize.sync({ alter: true }) // Use force: true carefully, as it drops existing tables
// //   .then(() => {
// //     console.log('Database synchronized successfully.');
// //   })
// //   .catch((error) => {
// //     console.error('Erro r synchronizing database:', error);
// //   });

// testConnection();

/////////

///RENDER

// // require("dotenv").config();
// const { Sequelize } = require("sequelize");
// // const CustomError = require("../utils/ErrorHandler");
// const sequelize = new Sequelize(
//   // "postgresql://database_ilt0_user:xihY6VoS4jtxpY2o8w6UNMn4C5VqWBkG@dpg-ct9fajl6l47c73as14kg-a.oregon-postgres.render.com/database_ilt0",

//   "postgresql://gemechu:t2FiTgh8zRhn6dyHYmgL0iV1pKZOOy9d@dpg-cuebgpt2ng1s7386p9k0-a.oregon-postgres.render.com/newpayroll",
//   {
//     dialect: "postgres",
//     dialectOptions: {
//       ssl: {
//         require: true, // This will help in ensuring SSL connection
//         rejectUnauthorized: false, // This might be necessary for some providers like Heroku
//       },
//     },
//   }
// );
// // Test the database connection
// async function testConnection() {
//   try {
//     await sequelize.authenticate();
//     console.log("Database connection has been established successfully.");
//   } catch (error) {
//     console.log(error);
//     console.log(process.env.DB_HOST);
//     console.error("Error connecting");
//   }
// }
// // sequelize
// //   .sync({ alter: true }) // Use force: true carefully, as it drops existing tables
// //   .then(() => {
// //     console.log("Database synchronized successfully.");
// //   })
// //   .catch((error) => {
// //     console.error("Erro r synchronizing database:", error);
// //   });

// testConnection();

module.exports = sequelize;
