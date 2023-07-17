const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("./company.js");

const Department = sequelize.define("Department", {
  deptName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  location: {
    type: DataTypes.STRING,
  },

  shorthandRepresentation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // previous_Info:[ {
  //   type: Sequelize.JSON,
  //   allowNull: true,
  //   defaultValue: null,
  // }],
});

Company.hasMany(Department);
Department.belongsTo(Company);

// Department.hasMany(Employee);
// Employee.belongsTo(Department);
// Set up the one-to-many association
// Department.hasMany(Employee, { foreignKey: "departmentId" });

module.exports = Department;
