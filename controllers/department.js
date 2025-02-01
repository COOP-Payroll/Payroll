const { where } = require("sequelize");
const Department = require("../models/department.js");
const createError = require("../utils/error.js");

//GET ALL DEPARTMENT
exports.getAllDepartment = async (req, res, next) => {
  try {

    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const departments = await Department.findAll({
      where: { CompanyId },
    });
    if (!departments) {
      res.status(200).json("There is no department");
    } else {
      return res.status(200).json({
        count: departments.length,
        message: "Fetched successfully",
        data: departments,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//GET DEPARTMENT BY ID
exports.getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const department = await Department.findOne({
      where: { id, CompanyId },
    });
    if (!department) {
      return next(createError.createError(404, "Department not found"));
      // return res.status(404).json({
      //   message: "There is no Department with this ID",
      // });
    } else {
      return res.status(200).json({
        message: "Fetched successfully",
        data: department,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { deptName, location, shorthandRepresentation } = req.body;

    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const criteria = {
      CompanyId,
      deptName: deptName,
    };

    const checkDepartment = await Department.findOne({ where: criteria });

    if (checkDepartment) {
      res.status(404).json({ message: "Department is defined already " });
    } else {
      const departments = await Department.create({
        deptName,
        location,
        shorthandRepresentation,
      });
      await departments.setCompany(req.user.id);
      return res.status(200).json({
        message: "Successfully Registered",
        data: departments,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { deptName, location, shorthandRepresentation } = req.body;
    const updates = {};
    const { id } = req.params;
    const updatedEmployeeData = req.body;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    if (deptName) {
      updates.deptName = deptName;
    }
    if (location) {
      updates.location = location;
    }
    if (shorthandRepresentation) {
      updates.shorthandRepresentation = shorthandRepresentation;
    }
    const department = await Department.findOne({ where: { id, CompanyId } });
    if (!department) {
      return next(createError.createError(404, "Department not found"));
    } else {
      const result = await Department.update(updates, { where: { id: id } });

      return res.status(200).json({
        message: "updated successfully",
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const department = await Department.findOne({
      where: { id: id, CompanyId },
    });
    if (department) {
      await Department.destroy({ where: { id } });
      return res
        .status(200)
        .json({ message: "Department deleted successfully" });
    } else {
      return next(createError.createError(404, "Department not found"));
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
