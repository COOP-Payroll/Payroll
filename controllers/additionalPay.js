const AdditionalPay = require("../models/additionalPay.js");
const AdditionalpayDefinition = require("../models/additionalPayDefinition.js");
const Grade = require("../models/grade");
const Company = require("../models/company.js");
const Employee = require("../models/employee.js");
const createError = require("../utils/error");

//GET ALL ADDITIONAL PAY
exports.getAllAdditionalPay = async (req, res, next) => {
  try {
    const CompanyId = req.user.id;
    const additionalPay = await AdditionalPay.findAll({ where: { CompanyId } });
    res.status(200).json({
      count: additionalPay.length,
      message: "Data fetched successfully",
      data: additionalPay,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//GET ADDITIONALPAYBYID
exports.getAdditionalPayById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const additionalPay = await AdditionalPay.findByPk(id);
    if (!additionalPay) {
      return next(createError.createError(404, "Allowance not found"));
    } else {
      return res.json({
        message: "Data fetched successfully",
        data: additionalPay,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.createAdditionalPay = async (req, res, next) => {
  try {
    const { amount, employeeId, additionalPayDefinitionId } = req.body;
    const CompanyId = req.user.id;

    // Step 1: Check if the employee exists for the given CompanyId
    const employee = await Employee.findOne({
      where: { id: employeeId, CompanyId },
    });

    if (!employee) {
      return next(createError.createError(404, "Employee not found"));
    }

    // Step 2: Check if the additional pay definition exists
    const additionalPayDefinition = await AdditionalpayDefinition.findByPk(
      additionalPayDefinitionId
    );

    if (!additionalPayDefinition) {
      return next(
        createError.createError(404, "Additional Pay Definition not found")
      );
    }

    // Step 3: Check for duplicate additional pay for the employee
    const existingAdditionalPay = await AdditionalPay.findOne({
      where: {
        EmployeeId: employeeId,
        AdditionalPayDefinitionId: additionalPayDefinitionId,
      },
    });

    if (existingAdditionalPay) {
      return next(
        createError.createError(
          400,
          "Duplicate resource: Employee already has this additional pay type."
        )
      );
    }

    // Step 4: Create the new additional pay
    const additionalPay = await AdditionalPay.create({ amount });

    // Step 5: Associate the created additional pay with the employee, definition, and company
    await additionalPay.setCompany(CompanyId);
    await additionalPay.setAdditionalPayDefinition(additionalPayDefinitionId);
    await additionalPay.setEmployee(employee);

    // Step 6: Send response back to the client with success message and created data
    res.status(201).json({
      message: "Successfully registered additional pay",
      data: additionalPay,
    });
  } catch (error) {
    console.error(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//CREATE ADDITIONAL PAY
// exports.createAdditionalPay = async (req, res, next) => {
//   try {
//     const amount = req.body.amount;
//     const employeeId = req.body.employeeId;
//     const additionalPayDefinitionId = req.body.additionalPayDefinitionId;
//     // const payrollDefinitionId = req.body.payrollDefinitionId;
//     const CompanyId = req.user.id;
//     const employee = await Employee.findOne({
//       where: { id: employeeId, CompanyId },
//     });

//     if (!employee) {
//       return next(createError.createError(404, "Employee not found"));
//     }

//     const additionalPayDefinition1 = await AdditionalpayDefinition.findByPk(
//       additionalPayDefinitionId,
//       {
//         include: [
//           {
//             model: AdditionalPay,
//             where: { EmployeeId: employeeId },
//           },
//         ],
//       }
//     );

//     // const allDefinition = await AdditionalpayDefinition.findByPk(
//     //   additionalPayDefinitionId
//     // );
//     if (!employee) {
//       return next(createError.createError(404, "Employee not found"));
//     } else if (!allDefinition) {
//       return next(createError.createError(404, "Resource not found"));
//     } else if (additionalPayDefinition1) {
//       return next(createError.createError(400, "Duplicate resource"));
//     } else {
//       // Handle the case where the company with the given ID is not found
//       // const additionalPayType = await AdditionalpayDefinition.findByPk(
//       //   additionalPayDefinitionId
//       // );
//       const type2 = additionalPayType.type;
//       if (type2 === "deduction") {
//         const amount = -req.body.amount;
//         const additionalPay = await AdditionalPay.create({ amount });
//         await additionalPay.setCompany(Number(req.user.id));
//         await additionalPay.setAdditionalPayDefinition(
//           additionalPayDefinitionId
//         );
//         await additionalPay.setEmployee(employee);
//         await additionalPay.setPayrollDefinition(payrollDefinitionId);

//         res.status(200).json({
//           message: "Successfully Registered",
//           data: additionalPay,
//           // additionalAllowanceDefinition1,
//         });
//       } else {
//         const additionalPay = await AdditionalPay.create({ amount });
//         await additionalPay.setCompany(Number(req.user.id));
//         await additionalPay.setAdditionalPayDefinition(
//           additionalPayDefinitionId
//         );
//         await additionalPay.setEmployee(employee);
//         await additionalPay.setPayrollDefinition(payrollDefinitionId);

//         res.status(200).json({
//           message: "Successfully Registered",
//           data: additionalPay,
//           // additionalAllowanceDefinition1,
//         });
//       }
//     }
//   } catch (error) {
//     return next(
//       createError.createError(503, "An error occurred, please try again later")
//     );
//   }
// };

// UPDATE
exports.updateAdditionalPay = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const updates = {};
    const { id } = req.params;
    const CompanyId = req.user.id;
    if (amount) {
      updates.amount = amount;
    }
    const addAddionalPay = await AdditionalPay.findOne({
      where: { id, CompanyId },
    });

    if (!addAddionalPay) {
      return next(createError.createError(404, "Additional pay not found"));
    }

    const result = await addAddionalPay.update({ amount });

    res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//DELETE
exports.deleteAdditionalPay = async (req, res, next) => {
  try {
    const { id } = req.params;
    const additionalPay = await AdditionalPay.findOne({ where: { id: id } });
    if (additionalPay) {
      await AdditionalPay.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return next(createError.createError(404, "Resource not found"));
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
