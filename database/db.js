require("dotenv").config();
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

///RENDER

// require("dotenv").config();

// // const company = require("../models/company")
// const { Sequelize } = require("sequelize");
// // const CustomError = require("../utils/ErrorHandler");
// const sequelize = new Sequelize(
//   "postgresql://payroll12_user:E2b5wPXC05W1rqBRDqTSVz9GVRaqfGrN@dpg-cvr5uvh5pdvs73ecc8og-a.oregon-postgres.render.com/payroll12",

//   // "postgresql://gemechu:t2FiTgh8zRhn6dyHYmgL0iV1pKZOOy9d@dpg-cuebgpt2ng1s7386p9k0-a.oregon-postgres.render.com/newpayroll",
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
//     // console.log(process.env.DB_HOST);
//     console.error("Error connecting");
//   }
// }
// // sequelize
// //   .sync({ alter: true })
// //   .then(() => {
// //     console.log("Database synchronized successfully.");
// //   })
// //   .catch((error) => {
// //     console.error("Erro r synchronizing database:", error);
// //   });

// testConnection();
// module.exports = sequelize;
