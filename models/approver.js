const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Employee = require("../models/employee.js");
const Company = require("../models/company.js");
const ApprovalMethod = require("../models/approvalMethod.js")

const Approver = sequelize.define("Approver", {
  
  level: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  isMaster: {
    type: DataTypes.BOOLEAN,
    // allowNull: false,
    defaultValue: false,
  },
});

// Approver.beforeCreate(async (approver, options) => {
//   try {
//     if (!approver.ApprovalMethodId) {
//       throw new Error('ApprovalMethodId is not set for the Approver.');
//     }

//     // Assuming you have the necessary relationships defined
//     const approvalMethod = await ApprovalMethod.findByPk(approver.ApprovalMethodId);

//     if (!approvalMethod) {
//       throw new Error(`No ApprovalMethod found with id: ${approver.ApprovalMethodId}`);
//     }

//     const existingLevels = await Approver.findAll({
//       where: {
//         ApprovalMethodId: approver.ApprovalMethodId,
//       },
//       attributes: ['level'],
//       raw: true,
//     });

//     const maxLevel = 5;

//     const allLevelsAssigned = Array.from({ length: maxLevel }, (_, i) => i + 1).every(level =>
//       existingLevels.some(approverLevel => approverLevel.level === level)
//     );

//     if (allLevelsAssigned) {
//       approvalMethod.isCompleted = true;
//       await approvalMethod.save();
//     }
//   } catch (error) {
//     console.error(`Error in beforeCreate hook: ${error.message}`);
//     // Handle the error as needed
//     throw error;
//   }
// });
Approver.belongsTo(Company,{ as: 'Company', foreignKey: 'CompanyId' });
Company.hasMany(Approver);

Approver.belongsTo(ApprovalMethod,{ as: 'ApprovalMethod', foreignKey: 'ApprovalMethodId' });
ApprovalMethod.hasMany(Approver);

Approver.belongsTo(Employee);
Employee.hasOne(Approver);

module.exports = Approver;
