const AllowanceDefinition = require("../models/allowanceDefinition");
const Company = require("../models/company");
const createError = require('../utils/error')
// Define controller methods for handling User requests
exports.getAllAllowanceDefinition = async (req, res,next) => {
  const Company = req.user.id;

  try {
    const criteria = {
      CompanyId: req.user.id,
    };
    const allowanceDefinitions = await AllowanceDefinition.findAll(criteria);
    res.status(200).json({
      count: allowanceDefinitions.length,
      allowanceDefinitions,
    });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};

exports.getAllowanceDefinitionById = async (req, res,next) => {
  try {
    const { id } = req.params;
    const allowanceDefinition = await AllowanceDefinition.findByPk(id);

    if (!allowanceDefinition) {
      return res
        .status(404)
        .json({ message: "There is non allowance Definition with this id" });
    } else {
      res.json(allowanceDefinition);
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};

exports.createAllowanceDefinition = async (req, res, next) => {
  try {
    //insert required field
    const Company = req.user.id;
    console.log(Company);
    const { name, isTaxable, isExempted, exemptedAmount, startingAmount } =
      req.body;

    const criteria = {
      name: name,
    };
    const checkAllowance = await AllowanceDefinition.findOne({
      where: criteria,
    });

    if (checkAllowance) {
      res.status(409).json("Allowance Definition is already defined");
    } else {
      const allowanceDefinition = await AllowanceDefinition.create({
        name,
        isTaxable,
        isExempted,
        exemptedAmount,
        startingAmount,
      });
      await allowanceDefinition.setCompany(Company);
      res.status(200).json({
        message: "Successfully Registered",
        allowanceDefinition,
      });
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};
exports.updateAllowanceDefinition = async (req, res, next) => {
  try {
    //insert required field
    const { name, isTaxable, isExempted, exemptedAmount, startingAmount } =
      req.body;
    const updates = {};
    const { id } = req.params;

    if (name) {
      updates.name = name;
    }
    if (isTaxable) {
      updates.isTaxable = isTaxable;
    }
    if (isExempted) {
      updates.isExempted = isExempted;
    }
    if (exemptedAmount) {
      updates.exemptedAmount = exemptedAmount;
    }
    if (startingAmount) {
      updates.startingAmount = startingAmount;
    }

    const result = await AllowanceDefinition.update(updates, {
      where: { id: id },
    });

    res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};

exports.deleteAllowanceDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;

    const allowanceDefinition = await AllowanceDefinition.findOne({
      where: { id: id },
    });
    if (allowanceDefinition) {
      await allowanceDefinition.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res
        .status(409)
        .json({ message: "There is no AllowanceDefinition with this ID" });
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};



