const AllowanceDefinition = require("../models/allowanceDefinition");
const Company = require("../models/company");
const createError = require('../utils/error')

// GET ALL 
exports.getAllAllowanceDefinition = async (req, res,next) => {
  const Company = req.user.id;

  try {
    const criteria = {
      CompanyId: req.user.id,
    };
    const allowanceDefinitions = await AllowanceDefinition.findAll(
      {where:criteria});
    res.status(200).json({
      count: allowanceDefinitions.length,
      allowanceDefinitions,
    });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};
//GET BY ID
exports.getAllowanceDefinitionById = async (req, res,next) => {
  try {
    const { id } = req.params;
    const allowanceDefinition = await AllowanceDefinition.findByPk(id);

    if (!allowanceDefinition) {

      return next(createError.createError(404,"There is non allowance Definition with this id"))
    
    } else {
      res.json(allowanceDefinition);
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};
//CREATE ALLOWANCE DEFINITION
exports.createAllowanceDefinition = async (req, res, next) => {
  try {
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

      return next(createError.createError(409,"Allowance Definition is already defined"))
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

//UPDATE ALLOWANCE DEFINITION
exports.updateAllowanceDefinition = async (req, res, next) => {
  try {
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

  const allowanceDefinition= await AllowanceDefinition.findOne({
    where:{
      id,
      CompanyId: req.user.id
    }
  })


  if(!allowanceDefinition){
    return next(createError.createError(404, "Allowance definition not found"))
  }

    const result = await allowanceDefinition.update(updates, {
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
//DELETE ALLOWANCE
exports.deleteAllowanceDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;

    const allowanceDefinition = await AllowanceDefinition.findOne({
      where: { id: id ,
        CompanyId: req.user.id
      },
    });
if(!allowanceDefinition){
  return next(createError.createError(404," Allowance definition not found"))
}
  
      await allowanceDefinition.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
  
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};



