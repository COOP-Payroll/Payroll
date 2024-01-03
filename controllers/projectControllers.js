const Allowance = require("../models/allowance");
const AllowanceDefinition = require("../models/allowanceDefinition");
const Grade = require("../models/grade");
const Company = require("../models/company.js");

const Projects=require("../models/projects.js");
const createError = require('.././utils/error.js')
// Define controller methods for handling User requests for deduction definition
exports.getAllProjects = async (req, res,next) => {
  try {
    const companyId = req.user.id;
    const projects = await Projects.findAll({ where: { companyId } });
    res.status(200).json({
        success:true,
        message:"Data found",
        data: projects

    });
  } catch (error) {
    console.log(error);
    return next(createError.createError(500,"Internal server error"))
  }
};
