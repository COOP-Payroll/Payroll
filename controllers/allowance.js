const Allowance = require("../models/allowance");
const AllowanceDefinition = require("../models/allowanceDefinition");
const Grade = require("../models/grade");

// Define controller methods for handling User requests for deduction definition
exports.getAllAllowance = async (req, res) => {
<<<<<<< HEAD
    
    try {
        
        const allowances = await Allowance.findAll();
        res.status(200).json({
            count: allowances.length,
            allowances
        });
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }
=======
  try {

    
    const allowances = await Allowance.findAll();
    res.status(200).json({
      count: allowances.length,
      allowances,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
>>>>>>> 49421b529e8a792330349c0f0aa03934134ed285
};

exports.getAllowanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const allowance = await Allowance.findByPk(id);
    res.json(allowance);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.createAllowance = async (req, res, next) => {
  try {
    //insert required field
    const amount = req.body.amount;
    const gradeId = req.body.gradeId;
    const allowanceDefinitionId = req.body.definitionId;
    console.log(amount, gradeId, allowanceDefinitionId);
    const allowance = await Allowance.create({ amount });
    //   await allowance.setGrade(gradeId);
    //   await allowance.setAllowanceDefinition(allowanceDefinitionId);

    const grade = await Grade.findByPk(gradeId);
    if (grade) {
      await allowance.setGrade(grade);
    } else {
      // Handle the case where the company with the given ID is not found
      console.log("no grade with this id");
    }
    const allDefinition = await AllowanceDefinition.findByPk(
      allowanceDefinitionId
    );
    if (allDefinition) {
      await allowance.setAllowanceDefinition(allowanceDefinitionId);
    } else {
      // Handle the case where the company with the given ID is not found
      console.log("no allowance with this id");
    }

    res.status(200).json({
      message: "Successfully Registered",
      allowance,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
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

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
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

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};
