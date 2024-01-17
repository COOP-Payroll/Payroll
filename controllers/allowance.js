const Allowance = require("../models/allowance");
const AllowanceDefinition = require("../models/allowanceDefinition");
const Grade = require("../models/grade");
const Company = require("../models/company.js");

// Define controller methods for handling User requests for deduction definition
exports.getAllAllowance = async (req, res) => {
  try {
    const companyId = req.user.id;
    const allowances = await Allowance.findAll({ where: { companyId } });
    res.status(200).json({
      count: allowances.length,
      allowances,
    });
  } catch (error) {
    console.log(error);
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

exports.getAllowanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const allowance = await Allowance.findByPk(id);
    if (!allowance) {
      return res.status(404).json({ message: "There is no allowance" });
    } else {
      res.json(allowance);
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

exports.createAllowance = async (req, res, next) => {
  try {
    //insert required field
    const amount = req.body.amount;
    const gradeId = req.body.gradeId;
    const allowanceDefinitionId = req.body.allowanceDefinitionId;
    // console.log(amount, gradeId, allowanceDefinitionId);
    //   await allowance.setAllowanceDefinition(allowanceDefinitionId);

    const grade = await Grade.findByPk(gradeId);
    const allDefinition = await AllowanceDefinition.findByPk(
      allowanceDefinitionId
    );

    const allowancedefnCheck = await Allowance.findOne({
      where: {
        GradeId: gradeId,
        AllowanceDefinitionId: allowanceDefinitionId,
      },
    });
    if (!grade) {
      res.status(404).json("Grade is not defined");
    } else if (!allDefinition) {
      res.status(404).json("Allowance definition is not defined");

      // await allowance.setCompany(Number(req.user.id))
    } else if (allowancedefnCheck) {
      res.status(404).json("Allowance definition is already added");
    } else {
      // Handle the case where the company with the given ID is not found

      const allowance = await Allowance.create({ amount });
      await allowance.setCompany(Number(req.user.id));
      await allowance.setAllowanceDefinition(allowanceDefinitionId);
      await allowance.setGrade(grade);
      res.status(200).json({
        message: "Successfully Registered",
        allowance,
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
exports.updateAllowance = async (req, res, next) => {
  try {
    //insert required field
    const { amount } = req.body;
    const updates = {};
    const { id } = req.params;
    if (amount) {
      updates.amount = amount;
    }

    const result = await Allowance.update(updates, { where: { id: id } });

    res.status(200).json({
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

exports.deleteAllowance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowance = await Allowance.findOne({ where: { id: id } });
    if (allowance) {
      await Allowance.destroy({ where: { id } });
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
