// const { DataTypes } = require("sequelize");
// const sequelize = require("../database/db.js");
// const Company = require("../models/company.js");

// const CompanyIdFormat = sequelize.define("CompanyIdFormat", {
//   separator: {
//     type: DataTypes.ENUM,
//     values: ["/", "-"],
//     defaultValue: "/",
//   },
//   companyCode: [
//     {
//       // isSelected: DataTypes.BOOLEAN,
//       // level: DataTypes.INTEGER,
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//     },
//     { type: DataTypes.STRING, allowNull: false },
//   ],
//   deptShortHand: {
//     isSelected: DataTypes.BOOLEAN,
//     level: DataTypes.INTEGER,
//   },
//   year: {
//     isSelected: DataTypes.BOOLEAN,
//     level: DataTypes.INTEGER,
//   },
//   format: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });

// Company.hasOne(CompanyIdFormat);
// CompanyIdFormat.belongsTo(Company);

// module.exports = CompanyIdFormat;
