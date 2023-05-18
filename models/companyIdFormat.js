// Company.js

const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const IdFormat = sequelize.define("IdFormat", {
  companyCode: {
    type: DataTypes.STRING,
  },
  year: {
    type: DataTypes.STRING,
  },
  department: {
    type: DataTypes.STRING,
  },
  separator: {
    type: DataTypes.STRING,
    default: "/",
  },
  order: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    validate: {
      isValidOrder(value) {
        const validValues = ["companyCode", "year", "department"];
        if (!value.every((val) => validValues.includes(val))) {
          throw new Error(
            "Invalid value for order. Must be 'companyCode', 'year', or 'department'."
          );
        }
      },
    },
  },
});

module.exports = IdFormat;
