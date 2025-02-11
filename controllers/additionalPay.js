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

//CREATE ADDITIONAL PAY
exports.createAdditionalPay = async (req, res, next) => {
  try {
    const amount = req.body.amount;
    const employeeId = req.body.employeeId;
    const additionalPayDefinitionId = req.body.additionalPayDefinitionId;
    const payrollDefinitionId = req.body.payrollDefinitionId;
    const CompanyId = req.user.id;
    const employee = await Employee.findOne({
      where: { id: employeeId, CompanyId },
    });

    if (!employee) {
      return next(createError.createError(404, "Employee not found"));
    }

    const additionalPayDefinition1 = await AdditionalpayDefinition.findByPk(
      additionalPayDefinitionId,
      {
        include: [
          {
            model: AdditionalPay,
            where: { EmployeeId: employeeId },
          },
        ],
      }
    );

    const allDefinition = await AdditionalpayDefinition.findByPk(
      additionalPayDefinitionId
    );
    if (!employee) {
      return next(createError.createError(404, "Employee not found"));
    } else if (!allDefinition) {
      return next(createError.createError(404, "Resource not found"));
    } else if (additionalPayDefinition1) {
      return next(createError.createError(400, "Duplicate resource"));
    } else {
      // Handle the case where the company with the given ID is not found
      const additionalPayType = await AdditionalpayDefinition.findByPk(
        additionalPayDefinitionId
      );
      const type2 = additionalPayType.type;
      if (type2 === "deduction") {
        const amount = -req.body.amount;
        const additionalPay = await AdditionalPay.create({ amount });
        await additionalPay.setCompany(Number(req.user.id));
        await additionalPay.setAdditionalPayDefinition(
          additionalPayDefinitionId
        );
        await additionalPay.setEmployee(employee);
        await additionalPay.setPayrollDefinition(payrollDefinitionId);

        res.status(200).json({
          message: "Successfully Registered",
          data: additionalPay,
          // additionalAllowanceDefinition1,
        });
      } else {
        const additionalPay = await AdditionalPay.create({ amount });
        await additionalPay.setCompany(Number(req.user.id));
        await additionalPay.setAdditionalPayDefinition(
          additionalPayDefinitionId
        );
        await additionalPay.setEmployee(employee);
        await additionalPay.setPayrollDefinition(payrollDefinitionId);

        res.status(200).json({
          message: "Successfully Registered",
          data: additionalPay,
          // additionalAllowanceDefinition1,
        });
      }
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

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
