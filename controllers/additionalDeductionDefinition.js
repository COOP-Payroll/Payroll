const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition");

const Company = require("../models/company");
// Define controller methods for handling User requests
exports.getAllAdditionalDeductionDefinition = async (req, res) => {
  const Company = req.user.id;

  try {
    const criteria = {
      companyId: req.user.id,
    };
    const AdditionalDeductionDefinitions =
      await AdditionalDeductionDefinition.findAll({ where: criteria });
    res.status(200).json({
      count: AdditionalDeductionDefinitions.length,
      AdditionalDeductionDefinitions,
    });
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

exports.getAdditionalDeductionDefinition = ById = async (req, res) => {
  try {
    const { id } = req.params;
    const AdditionalDeductionDefinition =
      await AdditionalDeductionDefinition.findByPk(id);
    res.status(200).json({
      AdditionalDeductionDefinition,
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

exports.createAdditionalDeductionDefinition = async (req, res, next) => {
  try {
    //insert required field
    const Company = req.user.id;
    console.log(Company);
    const { name } = req.body;

    const criteria = {
      name: name,
      companyId: req.user.id,
    };
    const checkAdditionalDeductionDefinition =
      await AdditionalDeductionDefinition.findOne({
        where: criteria,
      });

    if (checkAdditionalDeductionDefinition) {
      res.status(409).json("Already defined");
    } else {
      const AdditionalDeductionDefinitions =
        await AdditionalDeductionDefinition.create({
          name,
        });
      await AdditionalDeductionDefinitions.setCompany(req.user.id);
      res.status(200).json({
        message: "Successfully Registered",
        AdditionalDeductionDefinitions,
      });
    }
  } catch (error) {
   next(error)
  }
};

exports.updateAdditionalDeductionDefinition = async (req, res, next) => {
  try {
    const { name } = req.body;
    const updates = {};
    const { id } = req.params;

    if (name) {
      updates.name = name;
    }
    console.log("name", req.body.name);
    const result = await AdditionalDeductionDefinition.update(
      { name: req.body.name },
      {
        where: { id: id },
      }
    );

    res.status(200).json({
      message: "updated successfully",
      //   result,
    });
  } catch (error) {
   next(error)
  }
};

exports.deleteAdditionalDeductionDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;

    const AdditionalDeductionDefinitions =
      await AdditionalDeductionDefinition.findOne({
        where: { id: id, companyId: req.user.id },
      });
    if (AdditionalDeductionDefinitions) {
      await AdditionalDeductionDefinition.destroy({
        where: { id, companyId: req.user.id },
      });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res.status(409).json({ message: "There is no such ID" });
    }
  } catch (error) {
    console.log("first", error);
   next(error)
  }
};

//name,isTaxable,isExempted,exemptedAmount,startingAmount
