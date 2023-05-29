const Grade = require("../models/grade");
const Company = require("../models/company");
const Allowance=require("../models/allowance.js")
const AllowanceDefinition=require("../models/allowanceDefinition.js")

// Define controller methods for handling User requests

exports.getAllGrade = async (req, res) => {
  const companyId = req.user.id;
  try {
console.log(req.user.id)

    const criteria = {
      companyId: req.user.id,
    };
    const companyGrade = await Grade.findAll({
      where: criteria,
      include: [
        {
          model: Allowance, // Use the correct alias defined in the association
          include: [AllowanceDefinition],
        },
      ],
    });

    if(!companyGrade){
res.status(200).json('There no Grade')
    }
    else{
     res.status(200).json({
        count: companyGrade.length,
      companyGrade,
    });}
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.getGradeById = async (req, res) => {
  try {
    const id = req.params.id;
    const grade = await Grade.findByPk(id);
    res.json(grade);
  } catch (er) {
    res.status(500).json("Something gonna wrong");
  }
};

exports.createGrade = async (req, res, next) => {
  try {
    //insert required field

    const { name, minSalary, maxSalary } = req.body;
    const companyId = req.user.id;
    console.log(name, minSalary, maxSalary);
    console.log("company id", req.user.id);
    const criteria = {
      name: name,
      
    };
    const sameGrade = await Grade.findOne({ where: criteria });

    if (sameGrade) {
      res.json("this grade is defined already ");
    } else {
      const grade = await Grade.create({ name,minSalary,maxSalary});
      await grade.setCompany(companyId);

      res.status(200).json({
        message: "Successfully Registered",
        grade,
      });
    }
  } catch (error) {
    console.log("first",error)
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.updateGrade = async (req, res, next) => {
  try {
    //insert required field
    const { name, minSalary, maxSalary } = req.body;
    const updates = {};
    const { id } = req.params;

    if (name) {
      updates.name = name;
    }
    if (minSalary) {
      updates.minSalary = minSalary;
    }
    if (maxSalary) {
      updates.maxSalary = maxSalary;
    }

    const result = await Grade.update(updates, { where: { id: id } });

    res.status(200).json({
      message: "updated successfully",
      result,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.deleteGrade = async (req, res, next) => {
  try {
    const { id } = req.params;

    const grade = await Grade.findOne({ where: { id: id } });
    if (grade) {
      await grade.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res.status(409).json({ message: "There is no grade with this ID" });
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};
