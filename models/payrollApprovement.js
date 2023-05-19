const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");

const Approver = require("./approver.js")
const PayrollDefinition  = require("./payrollDefinition");

const PayrollApprovement = sequelize.define("Payroll", {

    status: {
        type: DataTypes.STRING,
        enum: [ 'pending', 'approved','rejected'],
        default: 'pending'
    },
        level: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    approvedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }

});

PayrollApprovement.belongsTo(PayrollDefinition);
PayrollDefinition.hasMany(PayrollApprovement);

Approver.belongsTo(PayrollApprovement);
PayrollApprovement.hasOne(Approver);

module.exports = PayrollApprovement;