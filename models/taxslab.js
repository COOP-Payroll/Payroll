const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");
const User = require("./user.js");

const Taxslab = sequelize.define("Taxslab", {
  from_Salary: {
    type: DataTypes.DOUBLE,
    allowNull: false,
<<<<<<< HEAD
=======
   
>>>>>>> eb278fe5c9c1b2d22deb89968ce96b0675444ab2
  },
  to_Salary: {
    type: DataTypes.DOUBLE,
    allowNull: false,
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
  remark:{
    type:DataTypes.STRING,
    
  }
});

Company.hasMany(Taxslab);
Taxslab.belongsTo(Company);


User.hasMany(Taxslab);
Taxslab.belongsTo(User);

module.exports = Taxslab;
