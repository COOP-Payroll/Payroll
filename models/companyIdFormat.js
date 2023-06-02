// // Company.js

const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const validValues = ["companyCode", "year", "department"];

const IdFormat = sequelize.define("IdFormat", {
  companyCode: {
    type: DataTypes.STRING,
  },
  year: {
    type: DataTypes.BOOLEAN,
  },
  department: {
    type: DataTypes.BOOLEAN,
  },
  separator: {
    type: DataTypes.ENUM,
    values: ["/", "-"],
    defaultValue: "/",
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  digitLength: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  order: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isValidOrder(value) {
        if (!value.split(",").every((val) => validValues.includes(val))) {
          throw new Error(
            "Invalid value for order. Must be 'companyCode', 'year', or 'department'."
          );
        }
      },
    },
  },
});

IdFormat.belongsTo(Company);
Company.hasOne(IdFormat);

module.exports = IdFormat;
