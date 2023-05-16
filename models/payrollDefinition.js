const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Company = require("./company.js");

const Payroll = sequelize.define("Payroll", {
payrollName:{
    type:DataTypes.STRING,
    allowNull:false
},
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    enum: ['created', 'ordered', 'pending', 'approved','active','paid'],
    default: 'created'
  },
  isRollBacked: {
    type: DataTypes.BOOLEAN,
    default: false,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    default: false,
  },
});

Payroll.belongsTo(Company);
Company.hasMany(Payroll);

module.exports = Payroll;