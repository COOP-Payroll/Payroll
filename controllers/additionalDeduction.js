const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition.js");
const AdditionalDeduction = require("../models/additionalDeduction.js");
const Employee = require("../models/employee.js");

// Define controller methods for handling User requests for deduction definition
exports.getAllAdditionalDeduction = async (req, res, next) => {
  try {
    const criteria = {
      companyId: req.user.id,
    };
    const AdditionalDeductions = await AdditionalDeduction.findAll({
      where: criteria,
    });
    res.status(200).json({
      count: AdditionalDeductions.length,
      AdditionalDeductions,
    });
  } catch (error) {
    console.log("first", error);
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

exports.getAllowanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const allowance = await Allowance.findByPk(id);
    res.json(allowance);
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

exports.createAdditionalDeduction = async (req, res, next) => {
  try {
    //insert required field
    const amount = req.body.amount;
    const employeeId = req.body.employeeId;
    const AdditionalDeductionDefinitionId =
      req.body.AdditionalDeductionDefinitionId;
    console.log(amount, AdditionalDeductionDefinitionId, employeeId);

    const employee = await Employee.findByPk(employeeId);
    const AdditionalDeductionDefinitions =
      await AdditionalDeductionDefinition.findByPk(
        AdditionalDeductionDefinitionId
      );

    //       const checkAdditionalDeductionForEmployee = await Employee.findAll({where:{id:employeeId,
    //           AdditionalDeduction:AdditionalDeductionDefinitionId}}
    // );

    // console.log("first", checkAdditionalDeductionForEmployee.length);
    if (!employee) {
      res.status(404).json("No Employee with this id");
      //   console.log("no Employee with this id");
    } else if (!AdditionalDeductionDefinitions) {
      res.status(404).json("No AdditionalDeduction Definition with this id");
    }
    // else if(checkAdditionalDeductionForEmployee.length !=0){
    //      res.status(404).json("AdditionalDeduction added for this employee update it ");
    // }
    else {
      const AdditionalDeductions = await AdditionalDeduction.create({ amount });
      await AdditionalDeductions.setEmployee(employee);
      await AdditionalDeductions.setAdditionalDeductionDefinition(
        AdditionalDeductionDefinitions
      );
      await AdditionalDeductions.setCompany(req.user.id);

      res.status(200).json({
        message: "Successfully Registered",
        AdditionalDeductions,
      });
      // Handle the case where the company with the given ID is not found
    }
  } catch (error) {
    console.log(error);
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
exports.updateAdditionalDeduction = async (req, res, next) => {
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

    const checkAdditionalDeduction = await AdditionalDeduction.findOne({
      where: { id: id, companyId: req.user.id },
    });
    console.log("first", checkAdditionalDeduction);
    if (checkAdditionalDeduction) {
      const result = await AdditionalDeduction.update(
        { amount: amount },
        { where: { id: id } }
      );

      res.status(200).json({
        message: "updated successfully",
        result,
      });
    } else {
      res.status(404).json("No such Id");
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

exports.deleteAdditionalDeduction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const laon = await AdditionalDeduction.findOne({
      where: { id: id, companyId: req.user.id },
    });
    if (laon) {
      await AdditionalDeduction.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res.status(409).json({
        message: "There is no AdditionalDeduction Definition with this ID",
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
