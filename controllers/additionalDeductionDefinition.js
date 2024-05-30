const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition");
const createError = require('../utils/error')

const Company = require("../models/company");
// Define controller methods for handling User requests
exports.getAllAdditionalDeductionDefinition = async (req, res,next) => {
  const Company = req.user.id;

  try {
    const criteria = {
      CompanyId: req.user.id,
    };
    const AdditionalDeductionDefinitions =
      await AdditionalDeductionDefinition.findAll({ where: criteria });
    res.status(200).json({
      count: AdditionalDeductionDefinitions.length,
      AdditionalDeductionDefinitions,
    });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};

exports.getAdditionalDeductionDefinition = ById = async (req, res,next) => {
  try {
    const { id } = req.params;
    const AdditionalDeductionDefinition =
      await AdditionalDeductionDefinition.findByPk(id);
    res.status(200).json({
      AdditionalDeductionDefinition,
    });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
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
      CompanyId: req.user.id,
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
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
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
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};

exports.deleteAdditionalDeductionDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;

    const AdditionalDeductionDefinitions =
      await AdditionalDeductionDefinition.findOne({
        where: { id: id, CompanyId: req.user.id },
      });
    if (AdditionalDeductionDefinitions) {
      await AdditionalDeductionDefinition.destroy({
        where: { id, CompanyId: req.user.id },
      });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res.status(409).json({ message: "There is no such ID" });
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};

