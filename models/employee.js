const { DataTypes } = require("sequelize");
const sequelize = require("../database/db.js");
const Company = require("../models/company.js");
const bcrypt = require("bcrypt");

const Employee = sequelize.define("Employee", {
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
  },
  sex: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("employee", "approver"),
    defaultValue: "employee",
  },
  nationality: {
    type: DataTypes.STRING,
    defaultValue: "Ethiopia",
  },
  marriageStatus: {
    type: DataTypes.ENUM("Single", "Married", "Divorced"),
    defaultValue: "Single",
  },
  employee_id_number: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  optionalNumber: {
    type: DataTypes.STRING,
  },
  id_image: {
    type: DataTypes.STRING,
  },
  id_type: {
    type: DataTypes.ENUM("kebele", "passport", "driving _License"),
    defaultValue: "kebele",
  },
  id_Number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isDeactivated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hireDate: {
    type: DataTypes.DATE,
  },
  joiningDate: {
    type: DataTypes.DATE,
  },
  password: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  rejectionCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  acceptanceCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },

 totalPercent:{
  type: DataTypes.INTEGER,
  defaultValue:0
 },
  isConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Employee.beforeCreate((employee, options) => {
  const saltRounds = 10;
  return bcrypt
    .hash(employee.password, saltRounds)
    .then((hash) => {
      employee.password = hash;
    })
    .catch((err) => {
      throw new Error(err);
    });
});

Employee.beforeUpdate((employee, options) => {
  if (employee.changed("password")) {
    const saltRounds = 10;
    return bcrypt
      .hash(employee.password, saltRounds)
      .then((hash) => {
        employee.password = hash;
      })
      .catch((err) => {
        throw new Error(err);
      });
  }
});

Company.hasMany(Employee);
Employee.belongsTo(Company);



Employee.beforeUpdate(async (employee, options) => {
  // Check if isActive is being updated
  if (employee.changed("isActive")) {
    // Create a history record before updating the employee
    await EmployeeHistory.create({
      // Map the fields you want to track
      fullname: employee.fullname,
      image: employee.image,
      sex: employee.sex,
      date_of_birth: employee.data_of_birth,
      role: employee.role,
      nationality: employee.nationality,
      marriageStatus: employee.marriageStatus,
      employee_id_number: employee.employee_id_number,
      email: employee.email,     
      phoneNumber: employee.phoneNumber,
      optionalNumber:employee.optionalNumber,
      id_image: id_image,
      id_type: employee.id_type,
      id_Number:employee.id_Number,
      isDeactivated: employee.isDeactivated,
      hireDate: employee.hireDate,
      joiningDate:employee.joiningDate,
      password: employee.password,
      
      isActive: employee.isActive,
      originalEmployeeId: employee.id,
      changeTimestamp: new Date(),
    });
  }
});



// Department.hasMany(Employee);
// Employee.belongsTo(Department);

// EmployeeInfo.hasOne(Employee);
// Employee.belongsTo(EmployeeInfo);

// Address.hasOne(Employee);
// Employee.belongsTo(Address);
// Employee.sync({ force: true }).then(() => console.log('positon model is ready'));
module.exports = Employee;
