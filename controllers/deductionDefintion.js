const DeductionDefinition = require("../models/deductionDefinition");
const Company = require("../models/company");
// Define controller methods for handling User requests for deduction definition
exports.getAllDeductionDefinition = async (req, res) => {
  const Company = req.user.id;
  console.log(Company);
  try {
    const criteria = {
      CompanyId: req.user.id,
    };
    const deductionDefinitions = await DeductionDefinition.findAll({
      where: criteria,
    });
    // console.log("same deductionDefinitions",deductionDefinitions)
    //const grades = await Grade.findAll();
    res.status(200).json({
      count: deductionDefinitions.length,
      deductionDefinitions,
    });
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

exports.getDeductionDefinitionById = async (req, res) => {
  try {
    const { id } = req.params;
    const deductionDefinition = await DeductionDefinition.findByPk(id);
    return res.json(deductionDefinition);
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

exports.createDeductionDefinition = async (req, res, next) => {
  const companyId = req.user.id;
  try {
    //insert required field

    // const { name,startingAmount, ispercent} = req.body;
    // console.log("Company", companyId);
    const name = req.body.name;

    const checkDeductionDefinition = await DeductionDefinition.findAll({
      where: { name: name },
    });

    if (checkDeductionDefinition.length != 0 ) {
      res.status(404).json({ error: "Already defined" });
    } else {
      const deductionDefinition = await DeductionDefinition.create({
        name: name,
        // startingAmount: startingAmount,
        // isPercent: isPercent,
      });

      const company = await Company.findByPk(companyId);
      if (company) {
        await deductionDefinition.setCompany(company);
      } else {
        // Handle the case where the company with the given ID is not found
        return res.json("no company with this id");
      }

      res.status(200).json({
        message: "Successfully Registered",
        deductionDefinition,
      });
    }

    //console.log(deductionDefinition)
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
exports.updateDeductionDefinition = async (req, res, next) => {
  try {
    //insert required field
    const { name } = req.body;
    const updates = {};
    const { id } = req.params;

    if (name) {
      updates.name = name;
    }
    // if (startingAmount) {
    //   updates.startingAmount = startingAmount;
    // }
    // if (ispercent) {
    //   updates.ispercent = ispercent;
    // }

    const result = await DeductionDefinition.update(updates, {
      where: { id: id },
    });

    return res.status(200).json({
      message: "updated successfully",
    });
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

exports.deleteDeductionDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deductionDefinition = await DeductionDefinition.findOne({
      where: { id: id },
    });
    if (deductionDefinition) {
      await DeductionDefinition.destroy({ where: { id } });
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
