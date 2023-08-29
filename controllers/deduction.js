const Deduction = require("../models/deduction");
const DeductionDefinition = require("../models/deductionDefinition");
const Grade = require("../models/grade");
const Company = require("../models/company.js");
// Define controller methods for handling User requests for deduction definition
exports.getAllDeduction = async (req, res) => {
  try {
    const deductions = await Deduction.findAll({
      where: { companyId: req.user.id },
    });
    return res.status(200).json({
      count: deductions.length,
      deductions,
    });
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

exports.getDeductionById = async (req, res) => {
  try {
    const { id } = req.params;
    const deduction = await Deduction.findByPk(id);
    if (!deduction) {
      return res.status(404).json({ message: "There is no deduction" });
    }
    {
      return res.json(deduction);
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

exports.createDeduction = async (req, res, next) => {
  try {
    //insert required field
    const amount = req.body.amount;
    const gradeId = req.body.gradeId;
    const deductinDefinitionId = req.body.deductinDefinitionId;
    console.log(amount, gradeId, deductinDefinitionId);

    //   await deduction.setDeductionDefinition(deductionDefinitionId);
    const grade = await Grade.findByPk(gradeId);
    const dedDefinition = await DeductionDefinition.findByPk(
      deductinDefinitionId
    );
    if (!grade) {
      res.status(404).json("Grade is not defined");
    } else if (!dedDefinition) {
      res.status(404).json("Deduction definition is not defined");
    } else {
      const deduction = await Deduction.create({ amount });
      await deduction.setCompany(Number(req.user.id));
      await deduction.setGrade(gradeId);
      await deduction.setDeductionDefinition(deductinDefinitionId);
      res.status(200).json({
        message: "Successfully Registered",
        deduction,
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
exports.deleteDeduction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deduction = await Deduction.findOne({ where: { id: id } });
    if (deduction) {
      await Deduction.destroy({ where: { id } });
      return res.status(200).json({ message: "Deleted successfully" });
    } else {
      return res
        .status(409)
        .json({ message: "There is no Deduction Definition with this ID" });
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
