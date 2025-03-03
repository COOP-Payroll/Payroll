const Deduction = require("../models/deduction");
const DeductionDefinition = require("../models/deductionDefinition");
const Grade = require("../models/grade");
const Company = require("../models/company.js");
const createError = require("../utils/error.js");

// Define controller methods for handling User requests for deduction definition
exports.getAllDeduction = async (req, res, next) => {
  try {
    const deductions = await Deduction.findAll({
      where: { CompanyId: req.user.id },
    });
    return res.status(200).json({
      count: deductions.length,
      data: deductions,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getDeductionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deduction = await Deduction.findOne({
      where: {
        id: id,
        CompanyId: req.user.id,
      },
    });
    if (!deduction) {
      return next(createError.createError(404, "There is no deduction"));
      // return res.status(404).json({ message: "There is no deduction" });
    }
    {
      return res.json({ data: deduction });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.createDeduction = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    //insert required field
    const amount = req.body.amount;
    const gradeId = req.body.gradeId;
    const deductinDefinitionId = req.body.deductinDefinitionId;

    //   await deduction.setDeductionDefinition(deductionDefinitionId);
    const grade = await Grade.findOne({
      where: {
        id: gradeId,
        CompanyId: CompanyId,
      },
    });
    const dedDefinition = await DeductionDefinition.findOne({
      where: {
        id: deductinDefinitionId,
        CompanyId: CompanyId,
      },
    });
    if (!grade) {
      res.status(404).json("Grade is not defined");
    }
    const checkIfAssigned = await Deduction.findOne({
      where: {
        GradeId: gradeId,
        DeductionDefinitionId: deductinDefinitionId,
      },
    });
    if (!dedDefinition) {
      return next(
        createError.createError(404, "Deduction definition is not defined")
      );
    }
    if (checkIfAssigned) {
      return next(
        createError.createError(404, "Deduction definition is already added")
      );
    } else {
      const deduction = await Deduction.create({ amount });
      await deduction.setCompany(Number(req.user.id));
      await deduction.setGrade(gradeId);
      await deduction.setDeductionDefinition(deductinDefinitionId);
      res.status(200).json({
        message: "Successfully Registered",
        data: deduction,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.updateDeduction = async (req, res, next) => {
  try {
    //insert required field
    const { amount } = req.body;
    const updates = {};
    const { id } = req.params;

    if (amount) {
      updates.amount = amount;
    }

    const result = await Deduction.update(updates, { where: { id: id } });

    return res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.deleteDeduction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deduction = await Deduction.findOne({ where: { id: id } });
    if (deduction) {
      await Deduction.destroy({ where: { id } });
      return res.status(200).json({ message: "Deleted successfully" });
    } else {
      return next(createError.createError(404, "Deduction not found"));
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
