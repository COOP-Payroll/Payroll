const Grade = require("../models/grade");
const Company = require("../models/company");
const Allowance = require("../models/allowance.js");
const AllowanceDefinition = require("../models/allowanceDefinition.js");
const EmployeeGrade = require("../models/EmployeeGrade.js");
const { Op } = require("sequelize");

const createError = require(".././utils/error.js");
const CustomError = require(".././utils/customError.js");
const successResponse = require(".././utils/successResponse.js");
const { max } = require("moment/moment.js");
const Deduction = require("../models/deduction.js");
const DeductionDefinition = require("../models/deductionDefinition.js");

//CREATE GRADE
exports.getAllGrade = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const criteria = {
      CompanyId,
    };
    const companyGrade = await Grade.findAll({
      where: criteria,
      include: [
        {
          model: Allowance,
          include: [AllowanceDefinition],
        },
        {
          model: Deduction,
          include: [DeductionDefinition],
        },
      ],
    });

    if (!companyGrade) {
      return next(createError.createError(404, "There is no Grade"));
    } else {
      res.status(200).json({
        count: companyGrade.length,
        message: "Fetched successfully",
        data: companyGrade,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//GET BY ID
exports.getGradeById = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const id = req.params.id;
    const grade = await Grade.findOne({
      where: { id, CompanyId },
    });
    if (!grade) {
      return next(
        createError.createError(404, "There is no Grade with this ID")
      );
    } else {
      res.json({ message: "Fetched successfully", data: grade });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//CREATE GRADE
exports.createGrade = async (req, res, next) => {
  try {
    const { name, minSalary, maxSalary } = req.body;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const criteria = {
      CompanyId,
      [Op.or]: [
        { name: name },
        { minSalary: minSalary },
        { minSalary: maxSalary },
        { maxSalary: maxSalary },
        { maxSalary: minSalary },
      ],
    };
    const sameGrade = await Grade.findOne({ where: criteria });

    if (sameGrade) {
      return next(
        createError.createError(
          400,
          "This grade is defined already  check if data provided is not the same with the inserted grade"
        )
      );
    }

    if (parseFloat(minSalary) < parseFloat(maxSalary)) {
      const grade = await Grade.create({ name, minSalary, maxSalary });
      await grade.setCompany(CompanyId);

      return res.status(200).json({
        message: "Successfully Registered",
        data: grade,
      });
    } else {
      return next(
        createError.createError(
          400,
          "Minimum salary cannot be greater than maximum salary"
        )
      );
    }
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//UPDATE GRADE
exports.updateGrade = async (req, res, next) => {
  try {
    //insert required field
    const { name, minSalary, maxSalary } = req.body;
    const updates = {};
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    if (name) {
      updates.name = name;
    }
    if (minSalary) {
      updates.minSalary = minSalary;
    }
    if (maxSalary) {
      updates.maxSalary = maxSalary;
    }

    const result = await Grade.update(updates, {
      where: { id: id, CompanyId },
    });

    res.status(200).json({
      message: "updated successfully",
      data: result,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//DELETE GRADE
exports.deleteGrade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const grade = await Grade.findOne({ where: { id: id, CompanyId } });
    if (grade) {
      const employeeGrade = await EmployeeGrade.findOne({
        where: {
          GradeId: id,
        },
      });
      if (employeeGrade) {
        return next(
          createError.createError(
            404,
            "This grade is attached to an employee. You can't delete it"
          )
        );
      } else {
        await grade.destroy({ where: { id } });
        res.status(200).json({ message: "Deleted successfully" });
      }
    } else {
      return next(createError.createError(404, "Grade not found"));
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.addNewGradeDefn = async (req, res, next) => {
  try {
    const { name } = data;
  } catch (error) {}
};
