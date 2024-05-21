
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
    console.log("first", error);
    return next(createError.createError(500,"Internal server error"))
  }
};

exports.getAllowanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await Modules.findByPk(id);
    res.json(module);
  } catch (error) {
    return next(createError.createError(500,"Internal server error"))
  }
};

exports.createModules = async (req, res, next) => {
  try {
    //insert required field
    const name = req.body.name;
const getAllModules = await Modules.findAll({where:{name:name}});
console.log(!getAllModules)


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
    console.log(error);
    return next(createError.createError(500,"Internal server error"));
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
    console.log("first", checkModules);
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
     console.log(error);
     return next(createError.createError(500,"Internal server error"));
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
      res.status(409).json({
        message: "There is no Modules  with this ID",
      });
    }
  } catch (error) {

    console.log(error);
    return next(createError.createError(500,"Internal server error"));
  }
}

exports.updateModule=async(req,res,next)=>{
  try{

  }catch(err){
    console.log("error",error)
  }
}