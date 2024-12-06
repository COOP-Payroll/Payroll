const ApprovalMethod = require("../models/approvalMethod");
const Company = require("../models/company");
const Approver = require("../models/approver");
const createError = require("../utils/error.js");
const { Op } = require("sequelize");
const sequelize = require("../database/db");
const { Sequelize } = require("sequelize");
const Employee = require("../models/employee.js");

//GET ALL APPROVAL METHOD
exports.getAllApprovalMethod = async (req, res, next) => {
  const CompanyId = req.user.id;
  try {
    const criteria = {
      where: { CompanyId: req.user.id },
    };
    const approvalMethod = await ApprovalMethod.findAll(criteria);
    res.status(200).json({
      count: approvalMethod.length,
      approvalMethod,
    });
  } catch (err) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

// GET ALL ACTIVE APPROVAL METHOD
exports.getAllActiveApprovalMethod = async (req, res, next) => {
  const CompanyId = req.user.id;
  try {
    const criteria = {
      where: { CompanyId: req.user.id, isActive: true },
    };
    const approvalMethod = await ApprovalMethod.findAll(criteria);
    res.status(200).json({
      count: approvalMethod.length,
      approvalMethod,
    });
  } catch (err) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
exports.getAllInActiveApprovalMethod = async (req, res, next) => {
  const CompanyId = req.user.id;

  try {
    const criteria = {
      where: { CompanyId: req.user.id, isActive: false },
    };
    const approvalMethod = await ApprovalMethod.findAll(criteria);
    res.status(200).json({
      count: approvalMethod.length,
      approvalMethod,
    });
  } catch (err) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
async function saveApprovalMethod(
  CompanyId,
  minimumApprover,
  approvalLevel,
  isCompleted,
  isThereMasterApprover,
  approvalMethod,
  lastUpdated,
  isActive
) {
  const appMethod = await ApprovalMethod.create({
    minimumApprover,
    approvalLevel,
    approvalMethod,
    isCompleted,
    isThereMasterApprover,
    lastUpdated,
    isActive,
  });

  const company = await Company.findByPk(Number(CompanyId));

  if (company) {
    await appMethod.setCompany(CompanyId);
  } else {
    return "no such company";
  }
  return {
    success: true,
    Message: "Successfully defined approvel method",
    created: appMethod,
  };
}

exports.createApprovalMethod = async (req, res, next) => {
  try {
    const CompanyId = req.user.id;
    let minimumApprover = req.body.minimumApprover;
    let approvalLevel = req.body.approvalLevel;
    const isCompleted = false;
    const isThereMasterApprover = req.body.isThereMasterApprover ?? false;
    const approvalMethod = req.body.approvalMethod;
    const lastUpdated = new Date();
    const isActive = true;

    const criteria = {
      where: { CompanyId: req.user.id, isActive: true },
    };

    const isExist = await ApprovalMethod.count(criteria);

    if (isExist >= 1) {
      return next(
        createError.createError(400, "Approval method already setted")
      );
    }

    if (!approvalMethod) {
      return next(createError.createError(400, "Set approvalMethod"));
    }

    if (approvalMethod == "hierarchy") {
      if (!approvalLevel) {
        return next(createError.createError(400, "Set approval Level "));
      }
    } else if (approvalMethod == "horizontal") {
      if (!minimumApprover) {
        return next(
          createError.createError(400, "Please set minimum approvers")
        );
      }
    }

    if (approvalMethod === "horizontal") {
      approvalLevel = 0;
      let response = await saveApprovalMethod(
        CompanyId,
        minimumApprover,
        approvalLevel,
        isCompleted,
        isThereMasterApprover,
        approvalMethod,
        lastUpdated,
        isActive
      );
      return res.status(200).json({
        success: true,
        message: "approval method created successfully",
      });
    } else if (approvalMethod === "hierarchy") {
      minimumApprover = approvalLevel;
      let response = saveApprovalMethod(
        CompanyId,
        minimumApprover,
        approvalLevel,
        isCompleted,
        isThereMasterApprover,
        approvalMethod,
        lastUpdated,
        isActive
      );
      return res.status(200).json({
        success: true,
        message: "approval method created successfully",
        // response
      });
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
async function reSaveApprovalMethod(
  CompanyId,
  minimumApprover,
  approvalLevel,
  isCompleted,
  isThereMasterApprover,
  approvalMethod,
  lastUpdated,
  isActive,
  oldId,
  res,
  next
) {
  console.log;

  const appMethod = await ApprovalMethod.create({
    minimumApprover,
    approvalLevel,
    approvalMethod,
    isCompleted,
    isThereMasterApprover,
    lastUpdated,
    isActive,
  });
  const company = await Company.findByPk(Number(CompanyId));

  if (company) {
    await appMethod.setCompany(CompanyId);
  } else {
    return "no such company";
  }
  const approver = await Approver.update(
    { isActive: false },
    {
      where: { ApprovalMethodId: oldId },
    }
  );

  const result = await ApprovalMethod.update(
    { isActive: false },
    {
      where: { id: oldId },
    }
  );
}
exports.reCreateApprovalMethods = async (req, res, next) => {
  const CompanyId = req.user.id;
  let minimumApprover = req.body.minimumApprover;
  let approvalLevel = req.body.approvalLevel;
  const isCompleted = false;
  const isThereMasterApprover = req.body.isThereMasterApprover;
  const approvalMethod = req.body.approvalMethod;
  const lastUpdated = new Date();
  const isActive = true;

  const criteria = {
    where: { CompanyId: CompanyId, isActive: true },
  };
  const CountOldApprovalMethod = await ApprovalMethod.count(criteria);
  if (CountOldApprovalMethod >= 1) {
    const activeMethod = {
      where: { CompanyId: CompanyId, isActive: true },
    };
    const activeApprovalMethod = await ApprovalMethod.findOne(activeMethod);

    //fetch each data required to set new approval method
    const oldId = activeApprovalMethod.id;
    const oldMinimumApprover = activeApprovalMethod.minimumApprover;
    const oldApprovalLevel = activeApprovalMethod.approvalLevel;
    const oldApprovalMethod = activeApprovalMethod.approvalMethod;
    const isOldThereMasterApprover = activeApprovalMethod.isThereMasterApprover;
    const isOldActive = activeApprovalMethod.isActive;

    if (
      (oldApprovalMethod === approvalMethod &&
        oldMinimumApprover === minimumApprover &&
        isOldThereMasterApprover === isThereMasterApprover &&
        CompanyId === req.user.id) ||
      (oldApprovalMethod === approvalMethod &&
        oldApprovalLevel === approvalLevel &&
        isOldThereMasterApprover === isThereMasterApprover &&
        CompanyId === req.user.id)
    ) {
      return next(
        createError.createError(
          400,
          "This is the same with your previous approval method"
        )
      );
    } else {
      if (
        oldApprovalMethod === "horizontal" &&
        approvalMethod === "horizontal"
      ) {
        approvalLevel = 0;
        let response = reSaveApprovalMethod(
          CompanyId,
          minimumApprover,
          approvalLevel,
          isCompleted,
          isThereMasterApprover,
          approvalMethod,
          lastUpdated,
          isActive,
          oldId,
          res,
          next
        );
        return res.status(201).json({
          success: true,
          message: "recreated successfully",
        });
      } else if (
        oldApprovalMethod === "hierarchy" &&
        approvalMethod === "hierarchy"
      ) {
        minimumApprover = approvalLevel;
        let response = reSaveApprovalMethod(
          CompanyId,
          minimumApprover,
          approvalLevel,
          isCompleted,
          isThereMasterApprover,
          approvalMethod,
          lastUpdated,
          isActive,
          oldId,
          res,
          next
        );
        return res.status(201).json({
          message: "recreated successfully",
          response,
        });
      } else if (
        (oldApprovalMethod === "horizontal" &&
          approvalMethod === "hierarchy") ||
        (oldApprovalMethod === "hierarchy" && approvalMethod === "horizontal")
      ) {
        if (
          oldApprovalMethod === "horizontal" &&
          approvalMethod === "hierarchy"
        ) {
          minimumApprover = approvalLevel;
          let response = reSaveApprovalMethod(
            CompanyId,
            minimumApprover,
            approvalLevel,
            isCompleted,
            isThereMasterApprover,
            approvalMethod,
            lastUpdated,
            isActive,
            oldId,
            res,
            next
          );
          return res.status(200).json({
            message: "recreated successfully",
            response,
          });
        } else if (
          oldApprovalMethod === "hierarchy" &&
          approvalMethod === "horizontal"
        ) {
          approvalLevel = 0;
          let response = reSaveApprovalMethod(
            CompanyId,
            minimumApprover,
            approvalLevel,
            isCompleted,
            isThereMasterApprover,
            approvalMethod,
            lastUpdated,
            isActive,
            oldId,
            res,
            next
          );
          return res.status(201).json({
            message: "recreated successfully",
            response,
          });
        } else {
          return next(
            createError.createError(400, "undefined approval relationship")
          );
        }
      } else {
        return next(createError.createError(404, "undefined approval methodp"));
      }
    }
  } else {
    return next(
      createError.createError(404, "define your  approval method first")
    );
  }
};

exports.updateApprovalMethod = async (req, res, next) => {
  const id = req.params.id;
  try {
    const appMethod = await ApprovalMethod.findByPk(Number(id));

    const updates = {};
    const minimumApprover = req.body.minimumApprover;
    const approvalLevel = req.body.approvalLevel;
    const isCompleted = req.body.isCompleted;
    const isThereMasterApprover = req.body.isThereMasterApprover;
    const approvalMethod = req.body.approvalMethod;
    const isActive = req.body.isActive;

    if (minimumApprover) {
      updates.minimumApprover = minimumApprover;
    }
    if (approvalLevel) {
      updates.approvalLevel = approvalLevel;
    }
    if (isCompleted) {
      updates.isCompleted = isCompleted;
    }
    if (isThereMasterApprover) {
      updates.isThereMasterApprover = isThereMasterApprover;
    }
    if (approvalMethod) {
      updates.approvalMethod = approvalMethod;
    }
    if (approvalMethod) {
      updates.isActive = isActive;
    }

    if (appMethod) {
      const result = await ApprovalMethod.update(
        {
          minimumApprover: minimumApprover,
          approvalLevel: approvalLevel,
          isCompleted: isCompleted,
          isThereMasterApprover: isThereMasterApprover,
          isActive: isActive,
        },
        {
          where: { id: id },
        }
      );
      res.status(201).json({
        message: "success",
        appMethod,
      });
    } else {
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.deleteApprovalMethod = async (req, res, next) => {
  try {
    const id = req.params.id;
    const approvalMethod = await ApprovalMethod.findOne({ where: { id: id } });
    if (approvalMethod) {
      await approvalMethod.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return next(createError.createError(404, "Resource not found"));
    }
  } catch (err) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.reCreateApprovalMethods = async (req, res, next) => {
  try {
    const CompanyId = req.user.id;
    let minimumApprover = req.body.minimumApprover;
    let approvalLevel = req.body.approvalLevel;
    const isCompleted = req.body.isCompleted;
    const isThereMasterApprover = req.body.isThereMasterApprover;
    const approvalMethod = req.body.approvalMethod;
    const lastUpdated = new Date();
    const isActive = true;

    const criteria = {
      where: { CompanyId: req.user.id, isActive: true },
    };

    const isExist = await ApprovalMethod.count(criteria);

    if (isExist >= 1) {
      return next(
        createError.createError(400, "Approval method already setted")
      );
      // return res.json("this company setted approval method");
    }

    if (!approvalMethod) {
      return next(createError.createError(400, "Set approvalMethod"));
    }

    if (approvalMethod == "hierarchy") {
      if (!approvalLevel) {
        return next(createError.createError(400, "Set approval Level "));
      }
    } else if (approvalMethod == "horizontal") {
      if (!minimumApprover) {
        return next(
          createError.createError(400, "Please set minimum approvers")
        );
      }
    }

    if (approvalMethod === "horizontal") {
      approvalLevel = 0;
      let response = saveApprovalMethod(
        CompanyId,
        minimumApprover,
        approvalLevel,
        isCompleted,
        isThereMasterApprover,
        approvalMethod,
        lastUpdated,
        isActive
      );
      return res.status(200).json({
        success: true,
        message: "approval method created successfully",
      });
    } else if (approvalMethod === "hierarchy") {
      minimumApprover = approvalLevel;
      let response = saveApprovalMethod(
        CompanyId,
        minimumApprover,
        approvalLevel,
        isCompleted,
        isThereMasterApprover,
        approvalMethod,
        lastUpdated,
        isActive
      );
      return res.status(200).json({
        success: true,
        message: "approval method created successfully",
        // response
      });
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
    // res.status(503).json("Something gonna wrong");
  }
};

exports.reCreateApprovalMethod = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      minimumApprover,
      approvalLevel,
      isThereMasterApprover,
      approvalMethod,
    } = req.body;

    if (!approvalMethod) {
      return next(createError.createError(400, "Set approvalMethod"));
    }
    const isActive = true;
    const CompanyId = req.user.id;
    const foundApprovalMethod = await ApprovalMethod.findOne({
      where: {
        isActive: isActive,
        CompanyId: CompanyId,
      },
    });
    if (!foundApprovalMethod) {
      return next(createError.createError(400, "No approval method found"));
    }
    const approvalMethods = await ApprovalMethod.findOne({
      where: {
        minimumApprover: minimumApprover,
        approvalLevel: approvalLevel,
        isThereMasterApprover: isThereMasterApprover,
        approvalMethod: approvalMethod,
        CompanyId: CompanyId,
        isActive: isActive,
      },
    });

    if (approvalMethods) {
      return next(
        createError.createError(400, "Similar with previous approval methods")
      );
    }

    const getAllApprovers = await Approver.findAll({
      where: {
        isActive: true,
        ApprovalMethodId: foundApprovalMethod.id,
      },
    });
    const employeeIds = [
      ...new Set(getAllApprovers.map((employee) => employee.EmployeeId)),
    ];
    if (employeeIds.length > 0) {
      const updatedEmployee = await sequelize.query(
        `
  UPDATE "Employees"
  SET "role" = 'employee'
  WHERE "id" IN (${employeeIds.join(",")})
  `,
        { transaction }
      );

      // const updatedEmployee = await Employee.update(
      //   { role: 'employee' },
      //   {
      //     where: {
      //       id: employeeIds
      //     },
      //     transaction
      //   }
      // );
    }

    const appMethod = await ApprovalMethod.create(
      {
        minimumApprover,
        approvalLevel,
        approvalMethod,
        isCompleted: false,
        isThereMasterApprover,
        isActive,
      },
      { transaction }
    );
    await appMethod.setCompany(CompanyId, { transaction });

    const approver = await Approver.update(
      { isActive: false },
      {
        where: { ApprovalMethodId: foundApprovalMethod?.id },
      },
      { transaction }
    );

    await foundApprovalMethod.update({ isActive: false }, { transaction });
    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: "Recreated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
