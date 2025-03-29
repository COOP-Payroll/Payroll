const AdditionalAllowanceDefinition = require("../models/additionalAllowanceDefinition.js");
const Company = require("../models/company");
const createError = require('../utils/error')

// GET ALL ADDITIONAL ALLOWANCE DEFINITION
exports.getAllAdditionalAllowanceDefinition = async (req, res,next) => {
  const Company = req.user.id;

  try {
    const CompanyId =
    req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const criteria = {
      CompanyId: CompanyId,
    };
    const AdditionalAllowanceDefinitions =
      await AdditionalAllowanceDefinition.findAll({ where: criteria });
    res.status(200).json({
      count: AdditionalAllowanceDefinitions.length,
      AdditionalAllowanceDefinitions,
    });
  } catch (error) {
    return next(createError.createError(503, 'Internal Server Error'))
  }
};


// GET BY ID
exports.getAdditionalAllowanceDefinitionById = async (req, res,next) => {
  try {
    const { id } = req.params;
    const AdditionalAllowanceDefinition =
      await AdditionalAllowanceDefinition.findByPk(id);
    res.status(200).json(AdditionalAllowanceDefinition);
  } catch (error) {
   
    return next(createError.createError(503, 'Internal Server Error'))}
};


//CREATE ADDITIONAL ALLOWANCE DEFINITION
exports.createAdditionalAllowanceDefinition = async (req, res, next) => {
  try {
 
    const Company = req.user.id;
    const { name, isTaxable, isExempted, exemptedAmount, startingAmount } =
      req.body;

    const criteria = {
      name: name,
    };
    const checkAllowance = await AdditionalAllowanceDefinition.findOne({
      where: criteria,
    });

    if (checkAllowance) {

      return next(createError.createError(400,"Allowance definition is already defined"))
      // res.status(400).json("Allowance Definition is already defined");
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
 
    return next(createError.createError(503, 'Internal Server Error'))
  }
};

//UPDATE ADDITIONAL ALLOWANCE DEFINITION
exports.updateAdditionalAllowanceDefinition = async (req, res, next) => {
  try {
    const { name, isTaxable, isExempted, exemptedAmount, startingAmount } =
      req.body;
    const updates = {};
    const { id } = req.params;

    const allowanceDefinition = await AdditionalAllowanceDefinition.findOne({
      where: { id },
    });
    if (!allowanceDefinition) {

      return next(createError.createError(404, "Allowance definition not exist"))
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
 
    return next(createError.createError(503, 'Internal Server Error'))
  }
};

//DELETE 
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

      return next(createError.createError(404,"There is no AdditionalAllowanceDefinition with this ID"))
    
    }
  } catch (error) {
    return next(createError.createError(503, 'Internal Server Error'))
  }
};

