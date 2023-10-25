const AdditionalPayDefinition = require("../models/additionalPayDefinition");
const Company = require("../models/company");
// Define controller methods for handling User requests
exports.getAllAdditionalPayDefinition = async (req, res) => {
  const Company = req.user.id;

  try {
    const criteria = {
      companyId: req.user.id,
    };
    const AdditionalPayDefinitions =
      await AdditionalPayDefinition.findAll({ where: criteria });
    res.status(200).json({
      count: AdditionalPayDefinitions.length,
      AdditionalPayDefinitions,
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

exports.getAdditionalPayDefinitionById = async (req, res) => {
  try {
    const { id } = req.params;
    const AdditionalPayDefinitions =
      await AdditionalPayDefinition.findByPk(id);
    res.json(AdditionalPayDefinitions);
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

exports.createAdditionalPayDefinition = async (req, res, next) => {
  try {
    //insert required field
    const Company = req.user.id;
    console.log(Company);
    const { name, type } =
      req.body;

    const criteria = {
      name: name,
    };
    const checkAdditionalPay = await AdditionalPayDefinition.findOne({
      where: criteria,
    });

    if (checkAdditionalPay) {
      res.status(409).json("this Additional pay Definition is already exists");
    } else {
      const AdditionalPayDefinitions =
        await AdditionalPayDefinition.create({
          name,
          type,
        });
      await AdditionalPayDefinitions.setCompany(Company);
      res.status(200).json({
        message: "Successfully Registered",
        AdditionalPayDefinitions,
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

exports.updateAdditionalPayDefinition = async (req, res, next) => {
  try {
    //insert required field
    const { name, type} =
      req.body;
    const updates = {};
    const { id } = req.params;

    const additionalPayDefinition = await AdditionalPayDefinition.findOne({
      where: { id },
    });
    console.log("additionalPayDefinition", !additionalPayDefinition);
    if (!additionalPayDefinition) {
      return res.status(404).json({ error: " this additional Pay Definition definition not exist" });
    } else {
      const updatedInfo = await additionalPayDefinition.update(req.body, {
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

exports.deleteAdditionalPayDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const additionalPayDefinition =
      await AdditionalPayDefinition.findOne({
        where: { id: id },
      });
    if (additionalPayDefinition) {
      await AdditionalPayDefinition.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res.status(409).json({
        message: "There is no additional pay definitiokna with this ID",
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

// name,isTaxable,isExempted,exemptedAmount,startingAmount
