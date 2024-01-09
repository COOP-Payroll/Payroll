const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const PositionProjectAssociation = sequelize.define('PositionProjectAssociation', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
  },
  numberOfUnit: {
    type: DataTypes.INTEGER,
  },
  amountPerUnit: {
    type: DataTypes.FLOAT,
  },
  budget: {
    type: DataTypes.FLOAT,
  },
  description:{
    type: DataTypes.STRING,
  }
});

// Define associations
// Position.belongsToMany(Project, { through: PositionProjectAssociation });
// Project.belongsToMany(Position, { through: PositionProjectAssociation });
// Position.hasMany(Employee);
// Employee.belongsTo(Position);

module.exports = PositionProjectAssociation;
