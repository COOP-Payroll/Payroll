const CustomRole = require("../models/customRole.js");
const Permission = require("../models/permission.js");
const Company = require("../models/company.js");
const Employee = require("../models/employee.js");
const createError = require("../utils/error.js");

//GET ALL CUSTOM ROLE
exports.getAllCustomRole = async (req, res, next) => {
  try {
    // return res.json("data")
    const customRole = await CustomRole.findAll({
      where: { CompanyId: req.user.id },
      attributes: { exclude: ["CompanyId", "createdAt", "updatedAt"] },
      include: [Permission],
    });
    res.status(200).json({
      count: customRole.length,
      data: customRole,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//GET CUSTOM ROLE BY ID
exports.getCustomRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customRole = await CustomRole.findByPk(id);
    res.status(200).json(customRole);
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//CREATE CUSTOM ROLE
exports.createCustomRole = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { name, permission } = req.body;

    if (permission.length === 0 || !permission) {
      return next(
        createError.createError(400, "Please select atleast on permission")
      );
    }

    const checkrole = await CustomRole.findOne({
      where: { name: name, CompanyId },
    });

    if (checkrole) {
      return next(createError.createError(400, "The role is already defined"));
    } else {
      const customRole = await CustomRole.create({
        name: name,
        CompanyId: CompanyId,
      });
      // await customRole.setCompany(req.user.id);

      const permissions = await Promise.all(
        permission.map((emer) => Permission.create(emer))
      );

      const ss = await Promise.all(
        permissions.map((emer) => {
          emer.setCustomRole(customRole);
        })
      );

      res.status(200).json({
        message: "Successfully Registered",
        data: customRole,
      });
    }
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// UPDATE CUSTOM ROLE
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

    if (permissionsData) {
      for (const permissionData of permissionsData) {
        const { module, isAccessible } = permissionData;

        let permission = await Permission.findOne({
          where: { module, CustomRoleId: customRole.id },
        });

        if (!permission) {
          permission = await Permission.create({
            module,
            isAccessible,

            CustomRoleId: customRole.id,
            CompanyId: req.user.id,
          });
        } else {
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
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// generalsetup;
// payrollsetup;
// payrollpublish;
// PayrollPublishedReport;
// EmployeeInfornation;
// EmployeeList;
// reports;

// exports.deleteCustomRole = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const CustomRole = await CustomRole.findOne({ where: { id: id } });
//     if (CustomRole) {
//       await CustomRole.destroy({ where: { id } });
//       res.status(200).json({ message: "Deleted successfully" });
//     } else {
//       res
//         .status(400)
//         .json({ message: "There is no Deduction Definition with this ID" });
//     }
//   } catch (error) {
//     return next(
//       createError.createError(503, "An error occurred, please try again later")
//     );
//   }
// };

exports.deleteCustomRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the Custom Role
    const customRole = await CustomRole.findOne({ where: { id } });

    if (!customRole) {
      return next(
        createError.createError(404, "There is no Custom Role with this ID")
      );
      // return res
      //   .status(400)
      //   .json({ message: "There is no Custom Role with this ID" });
    }

    // Delete all permissions associated with this Custom Role
    await Permission.destroy({ where: { CustomRoleId: id } });

    // Delete the custom role itself
    await CustomRole.destroy({ where: { id } });

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.assignToEmployee = async (req, res, next) => {
  try {
    const { employeeId, roleId } = req.body;

    // Find the role
    const getRole = await CustomRole.findOne({
      where: { id: Number(roleId), CompanyId: req.user.id },
    });
    if (!getRole) {
      return next(createError.createError(404, "Resource not found"));
    }

    // Find the employee
    const getEmployee = await Employee.findOne({
      where: { id: Number(employeeId), CompanyId: req.user.id },
    });
    if (!getEmployee) {
      return next(createError.createError(404, "Resource not found"));
    }

    // Check if the role is already assigned to the employee
    if (getEmployee.CustomRoleId === Number(roleId)) {
      return res
        .status(400)
        .json({ message: "Role already assigned to the employee" });
    }

    // Assign the role to the employee
    await getEmployee.update({ CustomRoleId: Number(roleId) });

    res.status(200).json({
      success: true,
      message: "Role assigned successfully",
      data: {
        id: getEmployee.id,
        fullname: getEmployee.fullname,
        CustomRoleId: getEmployee.CustomRoleId,
      },
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
