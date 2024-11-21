const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition");
const createError = require('../utils/error')

const Company = require("../models/company");
// GET ALL ADDITIONAL DEDUCTION DEFINITION
exports.getAllAdditionalDeductionDefinition = async (req, res,next) => {

 
  try {
    const Company = req.user.id;
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


//GET BY ID
exports.getAdditionalDeductionDefinitionById = async (req, res,next) => {
  try {
    const { id } = req.params;
    const additionalDeductionDefinition =   await AdditionalDeductionDefinition.findByPk(id);

    if(!additionalDeductionDefinition){
      return next(createError.createError(404,"There is no additional deduction definition with this Id"))
    }
    res.status(200).json({
      additionalDeductionDefinition,
    });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};

// CREATE
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

      return next(createError.createError(409,"Aready defined"))
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


//UPDATE
exports.updateAdditionalDeductionDefinition = async (req, res, next) => {
  try {
    const { name } = req.body;
    const updates = {};
    const { id } = req.params;

    if (name) {
      updates.name = name;
    }
    const additionalDeductionDefinitions =
    await AdditionalDeductionDefinition.findOne({
      where: { id: id, CompanyId: req.user.id },
    });
    if(!additionalDeductionDefinitions){
      return next(createError.createError(404,"There is no additional deduction definition with this ID"))
    }

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


//DELETE
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

      return next(createError.createError(404, "There is no such Id"))
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};

