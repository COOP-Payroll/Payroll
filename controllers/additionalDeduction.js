const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition.js");
const AdditionalDeduction = require("../models/additionalDeduction.js");
const Employee = require("../models/employee.js");
const createError = require('../utils/error')

// Define controller methods for handling User requests for deduction definition
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
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};

exports.getAllowanceById = async (req, res,next) => {
  try {
    const { id } = req.params;

    const allowance = await Allowance.findByPk(id);
    res.json(allowance);
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};

exports.createAdditionalDeduction = async (req, res, next) => {
  try {
    //insert required field
    const amount = req.body.amount;
    const employeeId = req.body.employeeId;
    const AdditionalDeductionDefinitionId =
      req.body.AdditionalDeductionDefinitionId;
    console.log(amount, AdditionalDeductionDefinitionId, employeeId);

    const employee = await Employee.findByPk(employeeId);
    const AdditionalDeductionDefinitions =
      await AdditionalDeductionDefinition.findByPk(
        AdditionalDeductionDefinitionId
      );

    //       const checkAdditionalDeductionForEmployee = await Employee.findAll({where:{id:employeeId,
    //           AdditionalDeduction:AdditionalDeductionDefinitionId}}
    // );

    // console.log("first", checkAdditionalDeductionForEmployee.length);
    if (!employee) {
      res.status(404).json("No Employee with this id");
      //   console.log("no Employee with this id");
    } else if (!AdditionalDeductionDefinitions) {
      res.status(404).json("No AdditionalDeduction Definition with this id");
    }
    // else if(checkAdditionalDeductionForEmployee.length !=0){
    //      res.status(404).json("AdditionalDeduction added for this employee update it ");
    // }
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
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
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
    // const criteria = {
    //   CompanyId: req.user.id,
    // };

    const checkAdditionalDeduction = await AdditionalDeduction.findOne({
      where: { id: id, CompanyId: req.user.id },
    });
    console.log("first", checkAdditionalDeduction);
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
      res.status(404).json("No such Id");
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
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
      res.status(409).json({
        message: "There is no AdditionalDeduction Definition with this ID",
      });
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};
