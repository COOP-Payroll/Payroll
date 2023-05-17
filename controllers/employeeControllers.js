const Employee = require("../models/employee.js");
const EmployeeInfo = require("../models/employeInfo.js");
const EmergencyContact = require("../models/emergency_Contact.js");
const Address = require("../models/address.js");
const Department = require("../models/department.js");
const Grade = require("../models/grade.js");
const Company=require('../models/company.js')
// Define controller methods for handling User requests
exports.getAllEmployee = async (req, res) => {
  try {
    const Employees = await Employee.findAll({
      include: [Address, EmployeeInfo, EmergencyContact, Department, Grade,Company],
    });
    return res.status(200).json({
      count: Employees.length,
      Employees,
    });
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const Employee = await Employee.findByPk(id);
    return res.json({ Employee });
  } catch (er) {
    return res.status(500).json("Something gonna wrong");
  }
};

exports.createEmployee = async (req, res, next) => {
  try {

    const { address, employeeInfo, emergencyInfo, basicInfo } = req.body;
   let password= req.user.companyCode.substring(0, 4) + '0000';
   

    if (!basicInfo?.DepartmentId) {
      return res.status(404).json("There is no department");
    } else if (!basicInfo?.GradeId) {
      return res.status(404).json("There is no Grade");
    } else {
      const gradeId = await Grade.findByPk(Number(basicInfo?.GradeId));
      const departmentId = await Department.findByPk(
        Number(basicInfo?.DepartmentId)
      );

      if (!gradeId) {
        return res.status(404).json("There is no Grade with this ID");
      } else if (!departmentId) {
        return res.status(404).json("There is no Department with this ID");
      }
      // else if(basicInfo.basicSalary<){

      // }
      else {
        const address1 = await Address.create(address);
        const employeeInfo1 = await EmployeeInfo.create(employeeInfo);

        const basicInfo1 = await Employee.create(basicInfo);

        //add ADDRESS TO EMPLOYEE
        await basicInfo1.setAddress(address1);
        await basicInfo1.setEmployeeInfo(employeeInfo1);
        await basicInfo1.setDepartment(Number(basicInfo.DepartmentId));
        await basicInfo1.setGrade(Number(basicInfo.GradeId));
        await basicInfo1.setCompany(Number(req.user.id))
        //const emergencyInfo1 = await EmergencyContact.create(emergencyInfo);
        // console.log("employeeInfo1", basicInfo1);

        const emergencies = await Promise.all(
          emergencyInfo.map((emer) => EmergencyContact.create(emer))
        );
        // console.log("first", emergencies)

        const ss = await Promise.all(
          emergencies.map((emer) => emer.setEmployee(basicInfo1))
        );

        // const Employees = await Employee.create({ deptName, location, shorthandRepresentation });
        return res.status(200).json({
          message: "Successfully Registered",
          basicInfo1,
        });
      }
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });
      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { deptName, location, shorthandRepresentation } = req.body;
    const updates = {};
    const { id } = req.params;

    if (deptName) {
      updates.deptName = deptName;
    }
    if (location) {
      updates.location = location;
    }
    if (shorthandRepresentation) {
      updates.shorthandRepresentation = shorthandRepresentation;
    }

    const result = await Employee.update(updates, { where: { id: id } });

    return res.status(200).json({
      message: "updated successfully",
    });
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const Employee = await Employee.findOne({ where: { id: id } });
    if (Employee) {
      await Employee.destroy({ where: { id } });
      return res.status(200).json({ message: "Employee deleted successfully" });
    } else {
      return res
        .status(409)
        .json({ message: "There is no Employee with this ID" });
    }
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
  }
};
