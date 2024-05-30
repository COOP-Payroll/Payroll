const AllowanceDefinition = require("../models/allowanceDefinition");
const LoanDefinition=require('../models/loanDefinition.js')
const Company = require("../models/company");
const createError= require("../utils/error.js")
// Define controller methods for handling User requests
exports.getAllLoanDefinition = async (req, res,next) => {
  const Company = req.user.id;

  try {
    const criteria = {
      CompanyId: req.user.id,
    };
    const loanDefinitions = await LoanDefinition.findAll(criteria);
    res.status(200).json({
      count: loanDefinitions.length,
      loanDefinitions,
    });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }
};

exports.getLoanDefinitionById = async (req, res,next) => {
  try {
    const { id } = req.params;
    const loanDefinition = await LoanDefinition.findByPk(id);
       res.status(200).json({         
         loanDefinition,
       });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }
};

exports.createLoanDefinition = async (req, res, next) => {
  try {
    //insert required field
    const Company = req.user.id;
    console.log(Company);
    const { name, isTaxable, isExempted, exemptedAmount, startingAmount } =
      req.body;

    const criteria = {
      name: name,
      CompanyId:req.user.id
    };
    const checkLoan = await LoanDefinition.findOne({
      where: criteria,
    });

    if (checkLoan) {
      res.status(409).json("Loan Definition is already defined");
    } else {
      const loanDefinition = await LoanDefinition.create({
        name,
    
      });
      await loanDefinition.setCompany(req.user.id);
      res.status(200).json({
        message: "Successfully Registered",
        loanDefinition,
      });
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }
};


exports.updateLoanDefinition = async (req, res, next) => {
  try {
    //insert required field
    console.log("first")
    const { name,  } =
      req.body;
    const updates = {};
    const { id } = req.params;

    if (name) {
      updates.name = name;
    }
   console.log("name",req.body.name)
      const result = await LoanDefinition.update({name:req.body.name}, {
      where: { id: id },
    });

    res.status(200).json({
      message: "updated successfully",
      result
    });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }
};

exports.deleteLoanDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;

    const loanDefinition = await LoanDefinition.findOne({
      where: { id: id },
    });
    if (loanDefinition) {
      await loanDefinition.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res
        .status(409)
        .json({ message: "There is no Loan Definition with this ID" });
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }
};

