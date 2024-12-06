const AllowanceDefinition = require("../models/allowanceDefinition");
const LoanDefinition = require("../models/loanDefinition.js");
const Company = require("../models/company");
const createError = require("../utils/error.js");
//GET ALL
exports.getAllLoanDefinition = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const criteria = {
      CompanyId,
    };

    // return res.json(CompanyId);
    const loanDefinitions = await LoanDefinition.findAll({ where: criteria });
    res.status(200).json({
      count: loanDefinitions.length,
      loanDefinitions,
    });
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

//GET ONE
exports.getLoanDefinitionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const loanDefinition = await LoanDefinition.findByPk(id);
    res.status(200).json({
      loanDefinition,
    });
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.createLoanDefinition = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { name, isTaxable, isExempted, exemptedAmount, startingAmount } =
      req.body;

    const criteria = {
      name: name,
      CompanyId,
    };
    const checkLoan = await LoanDefinition.findOne({
      where: criteria,
    });

    if (checkLoan) {
      return next(
        createError.createError(400, "Loan Definition is already defined")
      );
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
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

//UPDATE

exports.updateLoanDefinition = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    // Check if the loan definition exists
    const existingLoanDefinition = await LoanDefinition.findOne({
      where: { id, CompanyId },
    });

    if (!existingLoanDefinition) {
      return next(createError.createError(404, "Loan definition not found."));
    }

    const updates = {};
    if (name) {
      updates.name = name;
    }

    await LoanDefinition.update(updates, {
      where: { id, CompanyId },
    });

    res.status(200).json({
      message: "Loan definition updated successfully.",
    });
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

//DELETE
exports.deleteLoanDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    // Check if the loan definition exists
    const loanDefinition = await LoanDefinition.findOne({
      where: { id, CompanyId },
    });

    // If the loan definition is found, proceed with deletion
    if (loanDefinition) {
      await loanDefinition.destroy();
      res
        .status(200)
        .json({ message: "Loan definition deleted successfully." });
    } else {
      // Return 404 if not found
      return next(createError.createError(404, "Loan definition not found."));
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
