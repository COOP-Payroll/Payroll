const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition.js");
const AdditionalDeduction = require("../models/additionalDeduction.js");
const Employee = require("../models/employee.js");
const createError = require("../utils/error");
const { all } = require("axios");
//GET ALL
exports.getAllAdditionalDeduction = async (req, res, next) => {
  try {
    const criteria = {
      CompanyId: req.user.id,
    };

    const AdditionalDeductions = await AdditionalDeduction.findAll({
      where: criteria,
    });
    res.status(200).json({
      count: AdditionalDeductions.length,
      AdditionalDeductions,
    });
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

// GET BY ID
exports.getAdditionalDeductionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const allowance = await Allowance.findByPk(id);

    if (!allowance) {
      return next(createError.createError(404, " Allowance not found"));
    }
    res.status(200).json(allowance);
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.createAdditionalDeduction = async (req, res, next) => {
  try {
    //insert required field
    const amount = req.body.amount;
    const employeeId = req.body.employeeId;
    const AdditionalDeductionDefinitionId =
      req.body.AdditionalDeductionDefinitionId;

    const employee = await Employee.findByPk(employeeId);
    const AdditionalDeductionDefinitions =
      await AdditionalDeductionDefinition.findByPk(
        AdditionalDeductionDefinitionId
      );

    //       const checkAdditionalDeductionForEmployee = await Employee.findAll({where:{id:employeeId,
    //           AdditionalDeduction:AdditionalDeductionDefinitionId}}
    // );

    if (!employee) {
      return next(createError.createError(404, "No Employee with this id"));
    } else if (!AdditionalDeductionDefinitions) {
      return next(createError.createError(404, "Resource not found"));
    }
  
    else {
      const AdditionalDeductions = await AdditionalDeduction.create({ amount });
      await AdditionalDeductions.setEmployee(employee);
      await AdditionalDeductions.setAdditionalDeductionDefinition(
        AdditionalDeductionDefinitions
      );
      await AdditionalDeductions.setCompany(req.user.id);

      res.status(200).json({
        message: "Successfully Registered",
        AdditionalDeductions,
      });
      // Handle the case where the company with the given ID is not found
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
exports.updateAdditionalDeduction = async (req, res, next) => {
  try {
    //insert required field
    const { amount } = req.body;
    const updates = {};
    const { id } = req.params;
    if (amount) {
      updates.amount = amount;
    }

    const checkAdditionalDeduction = await AdditionalDeduction.findOne({
      where: { id: id, CompanyId: req.user.id },
    });
    if (checkAdditionalDeduction) {
      const result = await AdditionalDeduction.update(
        { amount: amount },
        { where: { id: id } }
      );

      res.status(200).json({
        message: "updated successfully",
        result,
      });
    } else {
      return next(createError.createError(404, "Resource not found"));
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.deleteAdditionalDeduction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const laon = await AdditionalDeduction.findOne({
      where: { id: id, CompanyId: req.user.id },
    });
    if (laon) {
      await AdditionalDeduction.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return next(createError.createError(404, "Resource not found"));
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
