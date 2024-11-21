const Allowance = require("../models/additionalAllowance.js");
const AllowanceDefinition = require("../models/additionalAllowanceDefinition.js");
const Grade = require("../models/grade");
const Company = require("../models/company.js");
const Employee = require("../models/employee.js");
const createError = require('../utils/error');
const { where } = require("sequelize");
const AdditionalAllowance = require("../models/additionalAllowance.js");

// GET ALL ALLOWANCE
exports.getAllAllowance = async (req, res,next) => {
  try {
    const CompanyId = req.user.id;
    const allowances = await Allowance.findAll({ where: { CompanyId } });
    res.status(200).json({
      count: allowances.length,
      allowances,
    });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};


//GET BY ID
exports.getAllowanceById = async (req, res,next) => {
  try {
    const { id } = req.params;

    const allowance = await Allowance.findByPk(id);
    if (!allowance) {

      return next(createError.createError(404,"There is no allowance with this ID"))
    } else {
     return  res.status(200).json(allowance);
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};



// CREATE
exports.createAllowance = async (req, res, next) => {
  try {
    const amount = req.body.amount;
    const employeeId = req.body.employeeId;
    const allowanceDefinitionId = req.body.allowanceDefinitionId;

    const allowanceDefinition = await AllowanceDefinition.findOne({
      where:{ id: allowanceDefinitionId,
        CompanyId: req.user.id
      }
    }        );


    if(!allowanceDefinition){
      return next(createError.createError(404,"Allowance definition not found"))
    }
    const employee = await Employee.findOne({
      where: { id: employeeId,
        CompanyId: req.user.id
       },
      include: {
        model: Allowance,
       
      },
    });

  
    const additionalAllowanceDefinition1 = await AdditionalAllowance.findOne(
     {where: {id: allowanceDefinitionId,
      CompanyId:req.user.id,
      EmployeeId: employeeId
     }}
     
    );
  

   
    if (!employee) {

      return next(createError.createError(400,"There is no employee with this ID"))
    } 
    else if (additionalAllowanceDefinition1) {

      return next(createError.createError(400, "Allowance definition is already added"))
  
    }
    
    else {

      const allowance = await Allowance.create({ amount });
      await allowance.setCompany(Number(req.user.id));
      await allowance.setAdditionalAllowanceDefinition(Number(allowanceDefinitionId));
      await allowance.setEmployee(employee);
      res.status(200).json({
        message: "Successfully Registered",
        allowance,
      });
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};

//UPDATE
exports.updateAllowance = async (req, res, next) => {
  try {
    //insert required field
    const { amount } = req.body;
    const updates = {};
    const { id } = req.params;
    if (amount) {
      updates.amount = amount;
    }


    

    const checkAllowance = await Allowance.findOne({
      where: {id: id}
    })

    // return res.json(checkAllowance)
    const result = await Allowance.update({ amount }, { where: { id: id } });

    res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};
//DE
exports.deleteAllowance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowance = await Allowance.findOne({ where: { id: id } });
    if (allowance) {
      await Allowance.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res
        .status(409)
        .json({ message: "There is no Deduction Definition with this ID" });
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
};
