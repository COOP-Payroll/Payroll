const Allowance = require("../models/allowance");
const AllowanceDefinition = require("../models/allowanceDefinition");
const Grade = require("../models/grade");
const Company = require("../models/company.js");
const createError = require("../utils/error");
const { all } = require("axios");

//GET ALL ALLOWANCE
exports.getAllAllowance = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const allowances = await Allowance.findAll({ where: { CompanyId } });
    res.status(200).json({
      count: allowances.length,
      data: allowances,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//GET BY ID
exports.getAllowanceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const allowance = await Allowance.findByPk(id);
    if (!allowance) {
      return next(createError.createError(404, "Resource not found"));
    } else {
      res.status(200).json({ data: allowance });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// CREATE ALLOWANCE
exports.createAllowance = async (req, res, next) => {
  try {
    const amount = req.body.amount;
    const gradeId = req.body.gradeId;
    const allowanceDefinitionId = req.body.allowanceDefinitionId;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const grade = await Grade.findOne({
      where: { id: gradeId, CompanyId },
    });

    if (!grade) {
      return next(createError.createError(404, "Grade not found"));
    }
    const allDefinition = await AllowanceDefinition.findOne({
      where: { id: allowanceDefinitionId, CompanyId: req.user.id },
    });

    if (!allDefinition) {
      return next(
        createError.createError(404, "Allowance definition not found")
      );
    }

    const allowancedefnCheck = await Allowance.findOne({
      where: {
        GradeId: gradeId,
        AllowanceDefinitionId: allowanceDefinitionId,
      },
    });

    if (allowancedefnCheck) {
      return next(
        createError.createError(404, "Allowance definition is already added")
      );
    }

    const allowance = await Allowance.create({ amount });
    await allowance.setCompany(Number(req.user.id));
    await allowance.setAllowanceDefinition(allowanceDefinitionId);
    await allowance.setGrade(grade);
    res.status(200).json({
      message: "Successfully Registered",
      data: allowance,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
//UPDATE ALLOWANCES
exports.updateAllowance = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const updates = {};
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    if (amount) {
      updates.amount = amount;
    }

    const allowance = await Allowance.findOne({
      where: { id, CompanyId },
    });

    if (!allowance) {
      return next(createError.createError(404, "Allowance not found"));
    }
    const result = await allowance.update(updates, { where: { id: id } });

    res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
//DELETE ALLOWANCES
exports.deleteAllowance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const allowance = await Allowance.findOne({
      where: { id: id, CompanyId },
    });

    if (!allowance) {
      return next(createError.createError(404, "Allowance not found"));
    }

    await allowance.destroy();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
