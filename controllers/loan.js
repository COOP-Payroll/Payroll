const Loan = require("../models/loan.js");
const LoanDefinition = require("../models/loanDefinition.js");
const Employee = require("../models/employee.js");

// Define controller methods for handling User requests for deduction definition
exports.getAllLoan = async (req, res) => {
  try {
    const criteria = {
      companyId: req.user.id,
    };
    const loans = await Loan.findAll();
    res.status(200).json({
      count: loans.length,
      loans,
    });
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.getAllowanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await Loan.findByPk(id);
    if (!loan) {
      return res.status(404).json({ message: "There is no Loan with this ID" });
    } else {
      res.json(loan);
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.createLoan = async (req, res, next) => {
  try {
    //insert required field
    const amount = req.body.amount;
    const employeeId = req.body.employeeId;
    const loanDefinitionId = req.body.loanDefinitionId;

    //   await allowance.setGrade(gradeId);
    //   await allowance.setAlflowanceDefinition(allowanceDefinitionId);

    const employee = await Employee.findByPk(employeeId);
    const loanDefinition = await LoanDefinition.findByPk(loanDefinitionId);
    console.log("loanDEfinitionID", loanDefinition);
 
    if (!employee) {
      res.status(404).json({message:"No Employee with this id"});
      //   console.log("no Employee with this id");
    } else if (!loanDefinition) {
      res.status(404).json({message:"No Loan Definition with this id"});
    } else {
      const checkLoanDefinitionId = await Loan.findOne({
        where: {
          LoanDefinitionId: loanDefinitionId,
          EmployeeId: employeeId,
        },
      });

      console.log("checkLoadDefinitionId", !checkLoanDefinitionId);
      if (!checkLoanDefinitionId) {
        const loan = await Loan.create({ amount });
        await loan.setEmployee(employee);
        await loan.setLoanDefinition(loanDefinition);
        await loan.setCompany(req.user.id);

        res.status(200).json({
          message: "Successfully Registered",
          loan,
        });
      } else {
        return res
          .status(404)
          .json({ message: "Loan defition id is already added" });

        // Handle the case where the company with the given ID is not found
      }
    }
  } catch (error) {
    console.log("error",error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
exports.updateLoan = async (req, res, next) => {
  try {
    //insert required field
    const { amount } = req.body;
    const updates = {};
    const { id } = req.params;
    if (amount) {
      updates.amount = amount;
    }
    // const criteria = {
    //   companyId: req.user.id,
    // };

    const checkLoan = await Loan.findOne({
      where: { id: id, companyId: req.user.id },
    });

    if (!checkLoan) {
    return res.status(404).json({ message:"There is no loan with this ID"})
    } else {
       const result = await Loan.update(
         { amount: amount },
         { where: { id: id } }
       );

       res.status(200).json({
         message: "updated successfully",
         result,
       });
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.deleteLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const laon = await Loan.findOne({
      where: { id: id, companyId: req.user.id },
    });
    if (laon) {
      await Loan.destroy({ where: { id } });
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

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
