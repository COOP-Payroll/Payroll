const AdditionalAllowanceDefinition = require("../models/additionalAllowanceDefinition.js");
const Company = require("../models/company");
// Define controller methods for handling User requests
exports.getAllAdditionalAllowanceDefinition = async (req, res,next) => {
  const Company = req.user.id;

  try {
    const criteria = {
      companyId: req.user.id,
    };
    const AdditionalAllowanceDefinitions =
      await AdditionalAllowanceDefinition.findAll({ where: criteria });
    res.status(200).json({
      count: AdditionalAllowanceDefinitions.length,
      AdditionalAllowanceDefinitions,
    });
  } catch (error) {
   next(error)
  }
};

exports.getAdditionalAllowanceDefinitionById = async (req, res) => {
  try {
    const { id } = req.params;
    const AdditionalAllowanceDefinition =
      await AdditionalAllowanceDefinition.findByPk(id);
    res.json(AdditionalAllowanceDefinition);
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

exports.createAdditionalAllowanceDefinition = async (req, res, next) => {
  try {
    //insert required field
    const Company = req.user.id;
    console.log(Company);
    const { name, isTaxable, isExempted, exemptedAmount, startingAmount } =
      req.body;

    const criteria = {
      name: name,
    };
    const checkAllowance = await AdditionalAllowanceDefinition.findOne({
      where: criteria,
    });

    if (checkAllowance) {
      res.status(409).json("Allowance Definition is already defined");
    } else {
      const AdditionalAllowanceDefinitions =
        await AdditionalAllowanceDefinition.create({
          name,
          isTaxable,
          isExempted,
          exemptedAmount,
          startingAmount,
        });
      await AdditionalAllowanceDefinitions.setCompany(Company);
      res.status(200).json({
        message: "Successfully Registered",
        AdditionalAllowanceDefinitions,
      });
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
exports.updateAdditionalAllowanceDefinition = async (req, res, next) => {
  try {
    //insert required field
    const { name, isTaxable, isExempted, exemptedAmount, startingAmount } =
      req.body;
    const updates = {};
    const { id } = req.params;

    const allowanceDefinition = await AdditionalAllowanceDefinition.findOne({
      where: { id },
    });
    console.log("allowanceDefinition", !allowanceDefinition);
    if (!allowanceDefinition) {
      return res.status(404).json({ error: "Allowance definition not exist" });
    } else {
      const updatedInfo = await allowanceDefinition.update(req.body, {
        returning: true,
      });

      res.status(201).json({
        msg: "updated successfully",
        updatedInfo,
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

exports.deleteAdditionalAllowanceDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;

    const additionalAllowanceDefinition =
      await AdditionalAllowanceDefinition.findOne({
        where: { id: id },
      });
    if (additionalAllowanceDefinition) {
      await AdditionalAllowanceDefinition.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res.status(409).json({
        message: "There is no AdditionalAllowanceDefinition with this ID",
      });
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

//name,isTaxable,isExempted,exemptedAmount,startingAmount
