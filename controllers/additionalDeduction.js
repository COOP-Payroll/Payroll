const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition.js");
const AdditionalDeduction = require("../models/additionalDeduction.js");
const Employee = require("../models/employee.js");
const createError = require("../utils/error");
const { all } = require("axios");
//GET ALL
exports.getAllAdditionalDeduction = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const AdditionalDeductions = await AdditionalDeduction.findAll({
      where: { CompanyId: CompanyId, isActive: true },
      attributes: ["id", "amount"],
      include: [
        {
          model: Employee, // Assuming Employee is associated with AdditionalDeduction
          attributes: ["id", "fullname", "phoneNumber", "email"], // Select only specific fields
        },
        {
          model: AdditionalDeductionDefinition, // Assuming this is the definition model
          attributes: ["id", "name", "isPercent"],
        },
      ],
    });

    res.status(200).json({
      count: AdditionalDeductions.length,
      data: AdditionalDeductions,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// GET BY ID
exports.getAdditionalDeductionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const AdditionalDeductions = await AdditionalDeduction.findOne({
      where: { id: id, CompanyId: CompanyId, isActive: true },
      attributes: ["id", "amount"],
      include: [
        {
          model: Employee, // Assuming Employee is associated with AdditionalDeduction
          attributes: ["id", "fullname", "phoneNumber", "email"], // Select only specific fields
        },
        {
          model: AdditionalDeductionDefinition, // Assuming this is the definition model
          attributes: ["id", "name", "isPercent"],
        },
      ],
    });

    res.status(200).json({
      // count: AdditionalDeductions?.length,
      data: AdditionalDeductions,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.createAdditionalDeduction = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const { amount, employeeId, AdditionalDeductionDefinitionId } = req.body;

    const employee = await Employee.findOne({
      where: { id: employeeId, CompanyId: CompanyId },
    });

    const AdditionalDeductionDefinitions =
      await AdditionalDeductionDefinition.findOne({
        where: {
          id: AdditionalDeductionDefinitionId,
          CompanyId: CompanyId,
          isActive: true,
        },
      });

    if (!employee) {
      return next(createError.createError(404, "No Employee with this ID"));
    }
    if (!AdditionalDeductionDefinitions) {
      return next(
        createError.createError(404, "Additional deduction not found")
      );
    }

    // Check if an Additional Deduction already exists for the employee
    const existingDeduction = await AdditionalDeduction.findOne({
      where: {
        EmployeeId: employeeId,
        AdditionalDeductionDefinitionId: AdditionalDeductionDefinitionId,
        CompanyId: CompanyId,
        isActive: true,
      },
    });

    if (existingDeduction) {
      return next(
        createError.createError(
          409,
          "This deduction is already assigned to the employee"
        )
      );
    }

    // Create new deduction if not already assigned
    const AdditionalDeductions = await AdditionalDeduction.create({ amount });
    await AdditionalDeductions.setEmployee(employee);
    await AdditionalDeductions.setAdditionalDeductionDefinition(
      AdditionalDeductionDefinitions
    );
    await AdditionalDeductions.setCompany(CompanyId);

    res.status(200).json({
      message: "Successfully Registered",
      data: AdditionalDeductions,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// exports.createAdditionalDeduction = async (req, res, next) => {
//   try {
//     const CompanyId =
//       req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
//     //insert required field
//     const amount = req.body.amount;
//     const employeeId = req.body.employeeId;
//     const AdditionalDeductionDefinitionId =
//       req.body.AdditionalDeductionDefinitionId;

//     const employee = await Employee.findOne({
//       where: { id: employeeId, CompanyId: CompanyId },
//     });
//     const AdditionalDeductionDefinitions =
//       await AdditionalDeductionDefinition.findOne({
//         where: {
//           id: AdditionalDeductionDefinitionId,
//           CompanyId: CompanyId,
//           isActive: true,
//         },
//       });

//     if (!employee) {
//       return next(createError.createError(404, "No Employee with this id"));
//     } else if (!AdditionalDeductionDefinitions) {
//       return next(createError.createError(404, "Addional deduction not found"));
//     } else {
//       const AdditionalDeductions = await AdditionalDeduction.create({ amount });
//       await AdditionalDeductions.setEmployee(employee);
//       await AdditionalDeductions.setAdditionalDeductionDefinition(
//         AdditionalDeductionDefinitions
//       );
//       await AdditionalDeductions.setCompany(CompanyId);

//       res.status(200).json({
//         message: "Successfully Registered",
//         data: AdditionalDeductions,
//       });
//       // Handle the case where the company with the given ID is not found
//     }
//   } catch (error) {
//     console.log(error);
//     return next(
//       createError.createError(503, "An error occurred, please try again later")
//     );
//   }
// };
exports.copyAndUpdateAdditionalDeduction = async (req, res, next) => {
  try {
    const { amount, isActive } = req.body; // Allow updating `isActive` as well
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    // Find the existing deduction
    const existingDeduction = await AdditionalDeduction.findOne({
      where: { id: id, CompanyId: CompanyId, isActive: true }, // Ensure it's active
    });

    if (!existingDeduction) {
      return next(
        createError.createError(404, "Additional deduction not found")
      );
    }

    // Mark the previous deduction as inactive
    await existingDeduction.update({ isActive: false });

    // Create a new copy with updated values
    const newDeduction = await AdditionalDeduction.create({
      amount: amount || existingDeduction.amount,
      isActive: isActive !== undefined ? isActive : true, // Default new copy to active
      EmployeeId: existingDeduction.EmployeeId,
      AdditionalDeductionDefinitionId:
        existingDeduction.AdditionalDeductionDefinitionId,
      CompanyId: existingDeduction.CompanyId,
    });

    res.status(200).json({
      message: "Updated successfully",
      data: newDeduction,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.deleteAdditionalDeduction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const additionalDeduction = await AdditionalDeduction.findOne({
      where: { id: id, CompanyId: CompanyId, isActive: true }, // Ensure it's active
    });

    if (!additionalDeduction) {
      return next(createError.createError(404, "Resource not found"));
    }

    // Mark as inactive instead of deleting
    await additionalDeduction.update({ isActive: false });

    res.status(200).json({ message: "Deactivated successfully" });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
