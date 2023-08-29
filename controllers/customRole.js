const CustomRole = require("../models/customRole.js");
const Permission = require("../models/permission.js");
const Company = require("../models/company.js");
const Employee = require("../models/employee.js");

// Define controller methods for handling User requests for deduction definition
exports.getAllCustomRole = async (req, res) => {
  // const customRoles = await CustomRole.findAll({
  //   where: { companyId: req.user.id },
  // });

  try {
    const customRole = await CustomRole.findAll({
      where: { companyId: req.user.id },
      include: [Permission],
    });
    res.status(200).json({
      count: customRole.length,
      customRole,
    });
  } catch (error) {
    console.error("Error retrieving permissions:", error);
  }
};

exports.getCustomRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const customRole = await CustomRole.findByPk(id);
    res.status(200).json(customRole);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.createCustomRole = async (req, res, next) => {
  try {
    const { name, permission } = req.body;

    const checkrole = await CustomRole.findOne({
      where: { companyId: req.user.id, name: name },
    });

    if (checkrole) {
      res.json("This Role is defined already ");
    } else {
      const customRole = await CustomRole.create({ name: name });
      await customRole.setCompany(req.user.id);

      const emergencies = await Promise.all(
        permission.map((emer) => Permission.create(emer))
      );

      const ss = await Promise.all(
        emergencies.map((emer) => {
          emer.setCustomRole(customRole);
          emer.setCompany(req.user.id);
        })
      );

      res.status(200).json({
        message: "Successfully Registered",
        customRole,
      });
    }
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
exports.updateCustomRole = async (req, res, next) => {
  try {
    const customRoleName = req.body.name;
    let updatedRole;

    const { id } = req.params.id;
    let customRole = await CustomRole.findOne({ where: { id: req.params.id } });

    if (!customRole) {
      res.status(404).json("There is no customRole ");
      // customRole = await CustomRole.create({ name: customRoleName });
    } else {
      customRole.name = customRoleName;
      updatedRole = await customRole.save();
    }

    const permissionsData = req.body.permission;

    // console.log("permissionData",!permissionsData)
    if (permissionsData) {
      for (const permissionData of permissionsData) {
        const { module, isAccessible } = permissionData;

        let permission = await Permission.findOne({
          where: { module, CustomRoleId: customRole.id },
        });

        if (!permission) {
          console.log("first", "no permission");
          permission = await Permission.create({
            module,
            isAccessible,

            CustomRoleId: customRole.id,
            CompanyId: req.user.id,
          });
        } else {
          console.log("first", "there is permission");
          permission.isAccessible = isAccessible;
     

          await permission.save();
        }
      }
      //  const updatedRole=await customRole.save();

      // const re

      res.status(200).json({
        message: "updated successfully",
      });
    } else {
      return res.status(404).json(updatedRole);
    }
  } catch (error) {
    console.log(error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};


// generalsetup;
// payrollsetup;
// payrollpublish;
// PayrollPublishedReport;
// EmployeeInfornation;
// EmployeeList;
// reports;

exports.deleteCustomRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const CustomRole = await CustomRole.findOne({ where: { id: id } });
    if (CustomRole) {
      await CustomRole.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res
        .status(409)
        .json({ message: "There is no Deduction Definition with this ID" });
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.assignToEmployee = async (req, res, next) => {
  try {
    const { employeeId, roleId } = req.body;

    const getRole = await CustomRole.findOne({ where: { id: roleId } });
    const getEmployee = await Employee.findOne({ where: { id: employeeId } });

    if (!getRole) {
      res.status(409).json({ message: "There is no Role with this ID" });
    } else if (!getEmployee) {
      res.status(409).json({ message: "There is no Employee with this ID" });
    } else {
      const assignedRole = await getEmployee.setCustomRole(Number(roleId));

      res
        .status(200)
        .json({ message: "Role Assigned successfully", assignedRole });
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
