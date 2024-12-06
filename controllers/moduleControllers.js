
const Modules = require("../models/addModules.js");
const Employee = require("../models/employee.js");
const createError= require("../utils/error.js")

// Define controller methods for handling User requests for deduction definition
exports.getAllModules = async (req, res, next) => {
  try {
  
    const Moduless = await Modules.findAll({
    });
    res.status(200).json({
      count: Moduless.length,
      Moduless,
    });
  } catch (error) {
    return next(createError.createError(503,"Internal server error"))
  }
};

exports.getAllowanceById = async (req, res,next) => {
  try {
    const { id } = req.params;

    const module = await Modules.findByPk(id);
    res.json(module);
  } catch (error) {
    return next(createError.createError(503,"Internal server error"))
  }
};

exports.createModules = async (req, res, next) => {
  try {
    //insert required field
    const name = req.body.name;
const getAllModules = await Modules.findAll({where:{name:name}});


if(getAllModules.length != 0 ){
  return next(createError.createError(400,"Module already Registered"))
}

      const Moduless = await Modules.create({ name });
 
      res.status(200).json({
        message: "Successfully Registered",
        Moduless,
      });




}
   catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
exports.updateModules = async (req, res, next) => {
  try {
    //insert required field
    const { amount } = req.body;
    const updates = {};
    const { id } = req.params;
    if (amount) {
      updates.amount = amount;
    }
 

    const checkModules = await Modules.findOne({
      where: { id: id, CompanyId: req.user.id },
    });
    if (checkModules) {
      const result = await Modules.update(
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
     return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.deleteModules = async (req, res, next) => {
  try {
    const { id } = req.params;
    const module = await Modules.findOne({
      where: { id: id, CompanyId: req.user.id },
    });
    if (module) {
      await Modules.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return next(createError.createError(404, "Module not found"));
    }
  } catch (error) {

    return next(createError.createError(503, "An error occurred, please try again later"));
  }
}

exports.updateModule=async(req,res,next)=>{
  try{

  }catch(err){

  }
}