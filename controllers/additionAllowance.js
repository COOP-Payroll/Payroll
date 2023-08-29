const Allowance = require("../models/additionalAllowance.js");
const AllowanceDefinition = require("../models/additionalAllowanceDefinition.js");
const Grade = require("../models/grade");
const Company = require("../models/company.js");
const Employee = require("../models/employee.js");

// Define controller methods for handling User requests for deduction definition
exports.getAllAllowance = async (req, res) => {
  try {
    const companyId = req.user.id;
    const allowances = await Allowance.findAll({ where: { companyId } });
    res.status(200).json({
      count: allowances.length,
      allowances,
    });
  } catch (error) {
    console.log(error);
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

    const allowance = await Allowance.findByPk(id);
    if (!allowance) {
      return res.status(404).json({ message: "There is no allowance id" });
    } else {
     return  res.json(allowance);
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

exports.createAllowance = async (req, res, next) => {
  try {
    //insert required field
    const amount = req.body.amount;
    const employeeId = req.body.employeeId;
    const allowanceDefinitionId = req.body.allowanceDefinitionId;
    // console.log(amount, gradeId, allowanceDefinitionId);
    //   await allowance.setAllowanceDefinition(allowanceDefinitionId);

    const employee = await Employee.findByPk(employeeId);
    const emp2 = await Employee.findAll({
      where: { id: employeeId },
      include: {
        model: Allowance,
        // /// Use the correct alias defined in the association
        // include: [AllowanceDefinition],
      },
    });

    const additionalAllowanceDefinition1 = await AllowanceDefinition.findByPk(
      allowanceDefinitionId,
      {
        include: [
          {
            model: Allowance,
            where: { EmployeeId: employeeId },
          },
        ],
      }
    );

    const allDefinition = await AllowanceDefinition.findByPk(
      allowanceDefinitionId
    );
    // console.log("first",allowanceDefinitionId)
    if (!employee) {
      res.status(404).json("Employee is not defined");
    } else if (!allDefinition) {
      res.status(404).json({
        message: "Allowance definition is not defined",
        additionalAllowanceDefinition1,
      });

      // await allowance.setCompany(Number(req.user.id))
    }
    else if (additionalAllowanceDefinition1) {
      res.status(404).json({
        message: "Allowance definition is already added",
      });
    } else {
      // Handle the case where the company with the given ID is not found

      const allowance = await Allowance.create({ amount });
      await allowance.setCompany(Number(req.user.id));
      await allowance.setAdditionalAllowanceDefinition(allowanceDefinitionId);
      await allowance.setEmployee(employee);
      res.status(200).json({
        message: "Successfully Registered",
        allowance,
        // additionalAllowanceDefinition1,
      });
    }
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
exports.updateAllowance = async (req, res, next) => {
  try {
    //insert required field
    const { amount } = req.body;
    const updates = {};
    const { id } = req.params;
    if (amount) {
      updates.amount = amount;
    }

    const result = await Allowance.update({ amount }, { where: { id: id } });

    res.status(200).json({
      message: "updated successfully",
    });
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

exports.deleteAllowance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowance = await Allowance.findOne({ where: { id: id } });
    if (allowance) {
      await Allowance.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res
        .status(409)
        .json({ message: "There is no Deduction Definition with this ID" });
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
