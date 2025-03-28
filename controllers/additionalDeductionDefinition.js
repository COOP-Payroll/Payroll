const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition");
const createError = require("../utils/error");

const Company = require("../models/company");
const { where } = require("sequelize");
// GET ALL ADDITIONAL DEDUCTION DEFINITION
exports.getAllAdditionalDeductionDefinition = async (req, res, next) => {
  try {
    // const Company = req.user.id;

    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const criteria = {
      CompanyId: CompanyId,
      isActive: true,
    };
    const AdditionalDeductionDefinitions =
      await AdditionalDeductionDefinition.findAll({ where: criteria });
    res.status(200).json({
      count: AdditionalDeductionDefinitions.length,
      message: "Data fetched successfully",
      data: AdditionalDeductionDefinitions,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//GET BY ID
exports.getAdditionalDeductionDefinitionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const additionalDeductionDefinition =
      await AdditionalDeductionDefinition.findOne({
        where: {
          id: id,
          CompanyId: CompanyId,
          isActive: true,
        },
      });

    if (!additionalDeductionDefinition) {
      return next(createError.createError(404, "Not defined"));
    }
    res.status(200).json({
      data: additionalDeductionDefinition,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// CREATE
exports.createAdditionalDeductionDefinition = async (req, res, next) => {
  try {
    //insert required field
    // const Company = req.user.id;

    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { name, isPercent } = req.body;

    const criteria = {
      name: name,
      CompanyId: CompanyId,
      isActive: true,
    };
    const checkAdditionalDeductionDefinition =
      await AdditionalDeductionDefinition.findOne({
        where: criteria,
      });

    if (checkAdditionalDeductionDefinition) {
      return next(createError.createError(400, "Already defined "));
    } else {
      const AdditionalDeductionDefinitions =
        await AdditionalDeductionDefinition.create({
          name,
          isPercent,
        });
      await AdditionalDeductionDefinitions.setCompany(CompanyId);
      res.status(200).json({
        message: "Successfully Registered",
        data: AdditionalDeductionDefinitions,
      });
    }
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//UPDATE
// exports.updateAdditionalDeductionDefinition = async (req, res, next) => {
//   try {
//     const { name } = req.body;
//     const updates = {};
//     const { id } = req.params;
//     const CompanyId =
//       req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
//     if (name) {
//       updates.name = name;
//     }
//     const additionalDeductionDefinitions =
//       await AdditionalDeductionDefinition.findOne({
//         where: { id: id, CompanyId: CompanyId },
//       });
//     if (!additionalDeductionDefinitions) {
//       return next(createError.createError(404, "Resource not found"));
//     }

//     const result = await AdditionalDeductionDefinition.update(
//       { name: req.body.name },
//       {
//         where: { id: id },
//       }
//     );

//     res.status(200).json({
//       message: "updated successfully",
//       //   result,
//     });
//   } catch (error) {
//     return next(
//       createError.createError(503, "An error occurred, please try again later")
//     );
//   }
// };

exports.updateAdditionalDeductionDefinition = async (req, res, next) => {
  try {
    const { name, isPercent } = req.body;
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    // Find the existing definition
    const existingDefinition = await AdditionalDeductionDefinition.findOne({
      where: { id: id, CompanyId: CompanyId, isActive: true },
    });

    if (!existingDefinition) {
      return next(createError.createError(404, "Resource not found"));
    }

    // Deactivate the old record
    await existingDefinition.update({ isActive: false });

    // Create a new record with updated values
    const newDefinition = await AdditionalDeductionDefinition.create({
      name: name || existingDefinition.name,
      isPercent:
        isPercent !== undefined ? isPercent : existingDefinition.isPercent,
      isActive: true,
      CompanyId: CompanyId, // Maintain company association
    });

    res.status(200).json({
      message: "Updated successfully by creating a new definition",
      data: newDefinition,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// //DELETE
exports.deleteAdditionalDeductionDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const additionalDeductionDefinition =
      await AdditionalDeductionDefinition.findOne({
        where: { id: id, CompanyId: CompanyId, isActive: true }, // Ensure it's active
      });

    if (!additionalDeductionDefinition) {
      return next(createError.createError(404, "Resource not found"));
    }

    // Mark as inactive instead of deleting
    await additionalDeductionDefinition.update({ isActive: false });

    res.status(200).json({ message: "Deactivated successfully" });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
