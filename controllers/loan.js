const Loan = require("../models/loan.js");
const LoanDefinition = require("../models/loanDefinition.js");
const Employee = require("../models/employee.js");
const createError = require("../utils/error.js");
const { where } = require("sequelize");

// GET ALL
exports.getAllLoan = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const criteria = {
      CompanyId,
    };
    const loans = await Loan.findAll({ where: { CompanyId, isActive: true } });
    res.status(200).json({
      count: loans.length,
      loans,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//GET BY ID
exports.getAllowanceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const loan = await Loan.findOne({ where: { CompanyId, isActive: true } });
    if (!loan) {
      return next(
        createError.createError(404, "No load found with the specified ID. ")
      );
    } else {
      res.status(200).json(loan);
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// //CREATE LOAN

// CREATE LOAN
exports.createLoan = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    // Extract required fields from request body
    const { amount, employeeId, loanDefinitionId } = req.body;

    // Find the employee and loan definition by their IDs
    const employee = await Employee.findOne({
      where: { id: employeeId, CompanyId },
    });
    const loanDefinition = await LoanDefinition.findOne({
      where: { id: loanDefinitionId, CompanyId },
    });

    if (!employee) {
      return next(
        createError.createError(404, "Employee not found with the given ID.")
      );
    }

    if (!loanDefinition) {
      return next(
        createError.createError(
          404,
          "Loan definition not found with the given ID."
        )
      );
    }

    // Check if the loan definition for the employee already exists
    const existingLoan = await Loan.findOne({
      where: {
        LoanDefinitionId: loanDefinitionId,
        EmployeeId: employeeId,
        isActive: true,
      },
    });

    if (existingLoan) {
      return next(
        createError.createError(
          400,
          "Loan with this loan definition already exists for the employee."
        )
      );
    } else {
      const loan = await Loan.create({ amount });

      // Associate the loan with the employee, loan definition, and company
      await loan.setEmployee(employee);
      await loan.setLoanDefinition(loanDefinition);
      await loan.setCompany(req.user.id);

      // Return a successful response
      res.status(201).json({
        message: "Loan successfully registered.",
        loan,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// exports.createLoan = async (req, res, next) => {
//   try {
//     //insert required field
//     const amount = req.body.amount;
//     const employeeId = req.body.employeeId;
//     const loanDefinitionId = req.body.loanDefinitionId;

//     //   await allowance.setGrade(gradeId);
//     //   await allowance.setAlflowanceDefinition(allowanceDefinitionId);

//     const employee = await Employee.findByPk(employeeId);
//     const loanDefinition = await LoanDefinition.findByPk(loanDefinitionId);
//     console.log("loanDEfinitionID", loanDefinition);

//     if (!employee) {
//       res.status(404).json({ message: "No Employee with this id" });
//       //   console.log("no Employee with this id");
//     } else if (!loanDefinition) {
//       res.status(404).json({ message: "No Loan Definition with this id" });
//     } else {
//       const checkLoanDefinitionId = await Loan.findOne({
//         where: {
//           LoanDefinitionId: loanDefinitionId,
//           EmployeeId: employeeId,
//         },
//       });

//       console.log("checkLoadDefinitionId", !checkLoanDefinitionId);
//       if (!checkLoanDefinitionId) {
//         const loan = await Loan.create({ amount });
//         await loan.setEmployee(employee);
//         await loan.setLoanDefinition(loanDefinition);
//         await loan.setCompany(req.user.id);

//         res.status(200).json({
//           message: "Successfully Registered",
//           loan,
//         });
//       } else {
//         return res
//           .status(404)
//           .json({ message: "Loan defition id is already added" });

//         // Handle the case where the company with the given ID is not found
//       }
//     }
//   } catch (error) {
//     console.log(error);
//    return next(createError.createError(503, "An error occurred, please try again later"));
//   }
// };

//UPDATE
// UPDATE LOAN
exports.updateLoan = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    // Extract required fields from the request body
    const { amount } = req.body;
    const { id } = req.params;

    const updates = {};
    if (amount) {
      updates.amount = amount;
    }

    // Find the loan based on the provided ID and CompanyId
    const checkLoan = await Loan.findOne({
      where: { id: id, CompanyId, isActive: true },
    });

    if (!checkLoan) {
      return next(createError.createError(404, "loan not found."));
    } else {
      // Update the loan amount
      const result = await Loan.update(updates, {
        where: { id: id },
      });

      res.status(200).json({
        message: "Loan updated successfully.",
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//DELETE
exports.deleteLoan = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { id } = req.params;
    const laon = await Loan.findOne({
      where: { id: id, CompanyId },
    });
    if (laon) {
      await Loan.destroy({ where: { id, isActive: true } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return next(createError.createError(404, "Loan Definition not found"));
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

///UNASSIGN LOAN FROM EMPLOYEE
/// UNASSIGN LOAN FROM EMPLOYEE
exports.unassignLoan = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { employeeId, loanDefinitionId } = req.body;

    // Find the loan by its employeeId, loanDefinitionId, and CompanyId
    const loan = await Loan.findOne({
      where: {
        EmployeeId: employeeId,
        LoanDefinitionId: loanDefinitionId,
        CompanyId,
        isActive: true,
      },
    });

    if (!loan) {
      return next(
        createError.createError(
          404,
          "No active loan found for the employee with the provided loan definition ID."
        )
      );
    }

    // Mark the loan as inactive
    loan.isActive = false;
    await loan.save();

    res.status(200).json({
      message: "Loan successfully unassigned and marked as inactive.",
      loan,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
