const AllowanceDefinition = require("../models/allowanceDefinition");
const LoanDefinition=require('../models/loanDefinition.js')
const Company = require("../models/company");
// Define controller methods for handling User requests
exports.getAllLoanDefinition = async (req, res) => {
  const Company = req.user.id;

  try {
    const criteria = {
      companyId: req.user.id,
    };
    const loanDefinitions = await LoanDefinition.findAll(criteria);
    res.status(200).json({
      count: loanDefinitions.length,
      loanDefinitions,
    });
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

exports.getLoanDefinitionById = async (req, res) => {
  try {
    const { id } = req.params;
    const loanDefinition = await LoanDefinition.findByPk(id);
       res.status(200).json({         
         loanDefinition,
       });
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

exports.createLoanDefinition = async (req, res, next) => {
  try {
    //insert required field
    const Company = req.user.id;
    console.log(Company);
    const { name, isTaxable, isExempted, exemptedAmount, startingAmount } =
      req.body;

    const criteria = {
      name: name,
      companyId:req.user.id
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

//name,isTaxable,isExempted,exemptedAmount,startingAmount
