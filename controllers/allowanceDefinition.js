const AllowanceDefinition = require("../models/allowanceDefinition");
const Company = require("../models/company");
const createError = require("../utils/error");

// GET ALL
exports.getAllAllowanceDefinition = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const criteria = {
      CompanyId: CompanyId,
    };
    const allowanceDefinitions = await AllowanceDefinition.findAll({
      where: criteria,
    });
    res.status(200).json({
      count: allowanceDefinitions.length,
      message: "Data fetched successfully",
      data: allowanceDefinitions,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
//GET BY ID
exports.getAllowanceDefinitionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowanceDefinition = await AllowanceDefinition.findByPk(id);

    if (!allowanceDefinition) {
      return next(
        createError.createError(
          404,
          "There is non allowance Definition with this id"
        )
      );
    } else {
      res.json({
        message: "Data fetched successfully",
        data: allowanceDefinition,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
// CREATE ALLOWANCE DEFINITION
exports.createAllowanceDefinition = async (req, res, next) => {
  try {
    // Determine the company ID based on the user's role
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    // Destructure and validate input
    const { name, isTaxable, isExempted, exemptedAmount, startingAmount } =
      req.body;

    // Ensure numeric values or default to zero if undefined or empty
    const sanitizedExemptedAmount = exemptedAmount
      ? parseFloat(exemptedAmount)
      : 0;
    const sanitizedStartingAmount = startingAmount
      ? parseFloat(startingAmount)
      : 0;

    // Criteria to check if the allowance already exists
    const criteria = {
      name,
      CompanyId,
    };

    // Check if the allowance definition already exists
    const checkAllowance = await AllowanceDefinition.findOne({
      where: criteria,
    });

    if (checkAllowance) {
      // Return 400 Conflict if allowance is already defined
      return next(
        createError.createError(400, "Allowance Definition is already defined")
      );
    }

    // Create a new allowance definition
    const allowanceDefinition = await AllowanceDefinition.create({
      name,
      isTaxable,
      isExempted,
      exemptedAmount: sanitizedExemptedAmount,
      startingAmount: sanitizedStartingAmount,
    });

    // Associate the allowance definition with the company
    await allowanceDefinition.setCompany(CompanyId);

    // Respond with success message
    res.status(200).json({
      message: "Successfully Registered",
      data: allowanceDefinition,
    });
  } catch (error) {
    // Return 503 Internal Server Error if any error occurs
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//UPDATE ALLOWANCE DEFINITION
exports.updateAllowanceDefinition = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { name, isTaxable, isExempted, exemptedAmount, startingAmount } =
      req.body;
    const updates = {};
    const { id } = req.params;

    if (name) {
      updates.name = name;
    }
    if (isTaxable) {
      updates.isTaxable = isTaxable;
    }
    if (isExempted) {
      updates.isExempted = isExempted;
    }
    if (exemptedAmount) {
      updates.exemptedAmount = exemptedAmount;
    }
    if (startingAmount) {
      updates.startingAmount = startingAmount;
    }

    const allowanceDefinition = await AllowanceDefinition.findOne({
      where: {
        id,
        CompanyId,
      },
    });

    if (!allowanceDefinition) {
      return next(
        createError.createError(404, "Allowance definition not found")
      );
    }

    const result = await allowanceDefinition.update(updates, {
      where: { id: id },
    });

    res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
//DELETE ALLOWANCE
exports.deleteAllowanceDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const allowanceDefinition = await AllowanceDefinition.findOne({
      where: { id: id, CompanyId },
    });
    if (!allowanceDefinition) {
      return next(
        createError.createError(404, " Allowance definition not found")
      );
    }

    await allowanceDefinition.destroy({ where: { id } });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
