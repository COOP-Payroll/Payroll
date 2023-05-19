const { DataTypes } = require("sequelize");
const sequelize = require("your-sequelize-instance"); // Your Sequelize instance
const Employee=require('./employee.js')

const CustomRole = sequelize.define("CustomRole", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  permission: [
    {
      module: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      write: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      update: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
  ],
});


Employee.hasOne(CustomRole);
CustomRole.belongsTo(Employee);

module.exports = CustomRole;
