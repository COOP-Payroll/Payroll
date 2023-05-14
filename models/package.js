const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/db.js');

const Package =sequelize.define('Package', {

    packageName: {
        type: DataTypes.ENUM('Trial', 'Monthly', 'Annual','Unlimitted'),
        allowNull:false
       
    },
     price: {
        type: DataTypes.DOUBLE,
        
    },
    min_employee: {
        type: DataTypes.INTEGER,
       
    },
    max_employee: {
        type: DataTypes.INTEGER,
       
    },
    service: [{
        type: DataTypes.STRING,
        
    }
    ],
    discount:{
        type: DataTypes.INTEGER,      
        defaultValue:0
      }
},);

module.exports = Package;



