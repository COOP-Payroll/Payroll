const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const User = require("./user.js");

// Helper function to convert "Infinity" string to Infinity value
function parseInfinity(value) {
  return value === "Infinity" ? Infinity : parseFloat(value);
}

function parseInfinityBack(value) {
  return value === -1 ? Infinity : value;
}


const Taxslab = sequelize.define("Taxslab", {
  from_Salary: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },

  to_Salary: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    // set(value) {
    //   this.setDataValue("to_Salary", parseInfinity(value));
    // },
  },
  

  income_tax_payable: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },

  deductible_Fee: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  remark: {
    type: DataTypes.STRING,
  },
  
});

// Taxslab.beforeSave((taxslab, options) => {
//   taxslab.to_Salary = parseInfinityBack(taxslab.to_Salary);
// });

// Override the `toJSON` function to handle -1 value as Infinity when converting to JSON
// Taxslab.prototype.toJSON = function () {
//   const values = { ...this.get() };

//   if (values.to_Salary === -1) {
//     values.to_Salary = Infinity;
//   }

//   return values;
// };

// // Override the `toJSON` function to handle "Infinity" string correctly
// Taxslab.prototype.toJSON = function () {
//   const values = { ...this.get() };

//   if (typeof values.to_Salary === DataTypes.STRING && values.to_Salary.toLowerCase() === 'infinity') {
//     values.to_Salary = Infinity;
//   }

//   return values;
// };

Company.hasMany(Taxslab);
Taxslab.belongsTo(Company);

User.hasMany(Taxslab);
Taxslab.belongsTo(User);

module.exports = Taxslab;
