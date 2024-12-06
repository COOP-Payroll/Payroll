const DeductionDefinition = require("../models/deductionDefinition");
const Company = require("../models/company");

const createError= require("../utils/error")

//GET ALL DEDUCTION DEFINITION
exports.getAllDeductionDefinition = async (req, res,next) => {
  const Company = req.user.id;
  try {
    const criteria = {
      CompanyId: req.user.id,
    };
    const deductionDefinitions = await DeductionDefinition.findAll({
      where: criteria,
    });
    res.status(200).json({
      count: deductionDefinitions.length,
      deductionDefinitions,
    });
  } catch (error) {
  return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
//GET BY ID
exports.getDeductionDefinitionById = async (req, res,next) => {
  try {
    const { id } = req.params;
    const deductionDefinition = await DeductionDefinition.findByPk(id);
    return res.json(deductionDefinition);
  } catch (error) {
   return next(createError.createError(503, "An error occurred, please try again later"));
  }
};


//CREATE DEDUCTION DEFINITION
exports.createDeductionDefinition = async (req, res, next) => {
  const companyId = req.user.id;
  try {

    const name = req.body.name;

    const checkDeductionDefinition = await DeductionDefinition.findAll({
      where: { name: name },
    });

    if (checkDeductionDefinition.length != 0 ) {

      return next(createError.createError(404,"Already defined"))
    } else {
      const deductionDefinition = await DeductionDefinition.create({
        name: name,
      
      });

      const company = await Company.findByPk(companyId);
      if (company) {
        await deductionDefinition.setCompany(company);
      } else {

        return next(createError.createError(404,"Company not found"))
      }

      res.status(200).json({
        message: "Successfully Registered",
        deductionDefinition,
      });
    }

  } catch (error) {
   return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

//UPDATE
exports.updateDeductionDefinition = async (req, res, next) => {
  try {
    const { name } = req.body;
    const updates = {};
    const { id } = req.params;

    if (name) {
      updates.name = name;
    }
 const deductionDefinition= await DeductionDefinition.findOne({
  where:{id}
 })


 if(!deductionDefinition){
  return next(createError.createError(404, "Deduction definition not found "))
 }
    const result = await deductionDefinition.update(updates);

    return res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
   return next(createError.createError(503, "An error occurred, please try again later"));
  }
};


//DELETE
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
      return next(createError.createError(404, "Deduction definition not found"));
    }
  } catch (error) {
   return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
