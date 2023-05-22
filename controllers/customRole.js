const CustomRole = require("../models/customRole.js");
const Permission=require("../models/permission.js");
const Company=require('../models/company.js');
const Employee = require("../models/employee.js");

// Define controller methods for handling User requests for deduction definition
exports.getAllCustomRole = async (req, res) => {
  // const customRoles = await CustomRole.findAll({
  //   where: { companyId: req.user.id },
  // });

  try {
    const customRole = await CustomRole.findAll({
      where: { companyId: req.user.id },
     
    });
res.status(200).json(
  {
    count:customRole.length,
  customRole});
 
  } catch (error) {
    console.error("Error retrieving permissions:", error);
  }
};

exports.getCustomRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const customRole = await CustomRole.findByPk(id);
    res.status(200).json(customRole);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.createCustomRole = async (req, res, next) => {
  try {
    const {
      name,
      permission,
    
    } = req.body;
      
    console.log("name",req.body.name)
 const criteria = {
   name: name,
   };
 const checkrole = await CustomRole.findOne({ where: {companyId:req.user.id,name:req.body.name.name} });

 if (checkrole) {
   res.json("This Role is defined already ");
 }
else{

        const customRole = await CustomRole.create(name);
        await customRole.setCompany(req.user.id);
     
        const emergencies = await Promise.all(
          permission.map((emer) => Permission.create(emer))
        );
       

        const ss = await Promise.all(
          emergencies.map((emer) => {
            emer.setCustomRole(customRole);
            emer.setCompany(req.user.id)

          }    )      
        );


        res.status(200).json({
          message: "Successfully Registered",
          customRole,
        });
      
}
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};
exports.updateCustomRole = async (req, res, next) => {
  try {
    //insert required field
    const data = req.body;
    // const updates = {};
    const { id } = req.params;
    // if (amount) {
    //   updates.amount = amount;
    // }
     const { name, permission } = req.body;
     const checkPermission=await Permission.update({permission:permission},{where:{customRoleId:id}});
     console.log("first",checkPermission)

    const result = await CustomRole.update({name:req.body.name.name}, { where: { id: id } });


    // const re

    res.status(200).json({
      message: "updated successfully",
      result
    });
  } catch (error) {
    console.log(error)
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.deleteCustomRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const CustomRole = await CustomRole.findOne({ where: { id: id } });
    if (CustomRole) {
      await CustomRole.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res
        .status(409)
        .json({ message: "There is no Deduction Definition with this ID" });
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};


exports.assignToEmployee= async(req,res,next)=>{
try {
const {employeeId, roleId}=req.body;

const getRole=await CustomRole.findOne({where:{id:roleId}});
const getEmployee= await Employee.findOne({where:{id:employeeId}})


if(!getRole){
  
  res.status(409).json({ message: "There is no Role with this ID" });
}
else if (!getEmployee) {
   res.status(409).json({ message: "There is no Employee with this ID" });
}
else{

  const assignedRole = await getEmployee.setCustomRole(Number(roleId));
  
  res.status(200).json({ message: "Role Assigned successfully",
  assignedRole ,
});


}


} catch (error) {
  if (error.name === "SequelizeValidationError") {
    const errors = {};
    error.errors.forEach((err) => {
      errors[err.path] = [`${err.path} is required`];
    });

    return res.status(400).json(errors);
  } else if (error.name === "SequelizeUniqueConstraintError") {
    const errors = {};
    error.errors.forEach((err) => {
      errors[err.path] = [`${err.path} must be unique`];
    });

    return res.status(400).json(errors);
  } else {
    return res.status(500).json({ error: "Internal server error" });
  }
}
}