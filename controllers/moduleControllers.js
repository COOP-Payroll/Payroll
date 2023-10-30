
const Modules = require("../models/addModules.js");
const Employee = require("../models/employee.js");

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
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.getAllowanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await Modules.findByPk(id);
    res.json(module);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.createModules = async (req, res, next) => {
  try {
    //insert required field
    const name = req.body.name;
const getAllModules = await Modules.findAll({where:{name:name}});
console.log(getAllModules)
if(!getAllModules)
{ 
      const Moduless = await Modules.create({ name });
 
      res.status(200).json({
        message: "Successfully Registered",
        Moduless,
      });
      // Handle the case where the company with the given ID is not found
 }
else{
  return res.status(404).json("Already Registered")
}


}
   catch (error) {
    console.log(error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
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
      where: { id: id, companyId: req.user.id },
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
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.deleteModules = async (req, res, next) => {
  try {
    const { id } = req.params;
    const module = await Modules.findOne({
      where: { id: id, companyId: req.user.id },
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
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
exports.detlete= async(req,res,next)=>{
  try {

    const {id}=req.params.id;

    const module = await Modules.findOne({
      where: { id: id, companyId: req.user.id },
    });
    if (module) {
      await module.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res.status(409).json({
        message: "There is no Modules  with this ID",
      });
    }
    
  } catch (error) {
    console.log("error ", error)
    
  }
}

exports.updateModule=async(req,res,next)=>{
  try{

  }catch(err){
    console.log("error",error)
  }
}