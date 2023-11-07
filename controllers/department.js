const Department = require("../models/department.js");

// Define controller methods for handling User requests
exports.getAllDepartment = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      where: { companyId: req.user.id },
    });
    if (!departments) {
      res.status(200).json("There is no department");
    } else {
      return res.status(200).json({
        count: departments.length,
        departments,
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({
        message: "There is no Department with this ID",
      });
    } else {
      return res.json({ department });
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { deptName, location, shorthandRepresentation } = req.body;

    const criteria = {
      companyId: req.user.id,
      deptName: deptName,
    };

    const checkDepartment = await Department.findOne({ where: criteria });

    if (checkDepartment) {
      res.status(404).json("Department is defined already ");
    } else {
      const departments = await Department.create({
        deptName,
        location,
        shorthandRepresentation,
      });
      await departments.setCompany(req.user.id);
      return res.status(200).json({
        message: "Successfully Registered",
        departments,
      });
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { deptName, location, shorthandRepresentation } = req.body;
    const updates = {};
    const { id } = req.params;
    const updatedEmployeeData = req.body;

    if (deptName) {
      updates.deptName = deptName;
    }
    if (location) {
      updates.location = location;
    }
    if (shorthandRepresentation) {
      updates.shorthandRepresentation = shorthandRepresentation;
    }
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ message: "department not found" });
    } else {
      const result = await Department.update(updates, { where: { id: id } });

      return res.status(200).json({
        message: "updated successfully",
      });
    }
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await Department.findOne({ where: { id: id } });
    if (department) {
      await Department.destroy({ where: { id } });
      return res
        .status(200)
        .json({ message: "Department deleted successfully" });
    } else {
      return res
        .status(409)
        .json({ message: "There is no Department with this ID" });
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
