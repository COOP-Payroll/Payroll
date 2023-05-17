const Deduction = require("../models/deduction");
const DeductionDefinition = require("../models/deductionDefinition");
const Grade = require("../models/grade");
// Define controller methods for handling User requests for deduction definition
exports.getAllDeduction = async (req, res) => {
  try {
    const deductions = await Deduction.findAll();
    return res.status(200).json({
      count: deductions.length,
      deductions,
    });
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
  }
};

exports.getDeductionById = async (req, res) => {
  try {
    const { id } = req.params;
    const deduction = await Deduction.findByPk(id);
    return res.json(deduction);
  } catch (er) {
    return res.status(500).json("Something gonna wrong");
  }
};

exports.createDeduction = async (req, res, next) => {
  try {
    //insert required field
    const amount = req.body.amount;
    const gradeId = req.params.gradeId;
    const definitionId = req.params.definitionId;
    const deduction = await Deduction.create({ amount });
    //   await deduction.setGrade(gradeId);
    //   await deduction.setDeductionDefinition(deductionDefinitionId);
    const grade = await Grade.findByPk(gradeId);
    if (grade) {
      await deduction.setGrade(gradeId);
    } else {
      // Handle the case where the company with the given ID is not found
      console.log("no grade with this id");
    }
    const dedDefinition = await DeductionDefinition.findByPk(definitionId);
    if (dedDefinition) {
      await deduction.setDeductionDefinition(definitionId);
    } else {
      // Handle the case where the company with the given ID is not found
      console.log("no deduction with this id");
    }
    return res.status(200).json({
      message: "Successfully Registered",
      deduction,
    });
  } catch (err) {
    return res.status(500).json("Something gonna wrong2");
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
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
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
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
  }
};
