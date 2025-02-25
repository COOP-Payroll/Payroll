const IdFormat = require("../models/companyIdFormat");
const createError = require(".././utils/error.js");
const successResponse = require(".././utils/successResponse.js");
const Company = require("../models/company.js");
const { where } = require("sequelize");

// create CompanyIdFormat
exports.createCompanyIdFormat = async (req, res, next) => {
  // const { companyCode, year, department, separator, order } = req.body;
  try {
    const companyIds = await IdFormat.findAll({
      where: { CompanyId: Number(req.user.id) },
    });
    if (companyIds.length >= 1)
      return next(
        createError.createError(
          400,
          "A resource with this ID already exists. Please update it instead"
        )
      );

    const companyIdFormat = await IdFormat.create(req.body);
    await companyIdFormat.setCompany(Number(req.user.id));
    return res.status(201).json(companyIdFormat);
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// get all companyIdFormat
exports.getAllCompanyIdFormat = async (req, res, next) => {
  try {
    const IdFormates = await IdFormat.findAll({
      where: { CompanyId: Number(req.user.id) },
    });
    const parsedCompanies = await Promise.all(
      IdFormates.map((company) => {
        // company.order = JSON.parse(company.order);
        // company.order = JSON.parse(company.order);
        JSON.stringify(company.order);
        return company;
      })
    );

    // res.json(parsedCompanies);
    return res.status(200).json(parsedCompanies);
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// delete Company
exports.deleteCompanyIdFormat = async (req, res, next) => {
  const { id } = req.params;
  try {
    const company = await IdFormat.findByPk(Number(id));
    if (!company) {
      return next(createError.createError(404, "Resource not found"));
    } else {
      await company.destroy();
      return res.json("Id Format deleted successfully");
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.updateCompanyIdFormat = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { year, department, order, separator, digitLength } = req.body;
return res.json(req.body)
    // Validate required fields
    if (!year || !department || !order || !digitLength || !separator) {
      return next(
        createError.createError(400, "Please provide all required fields")
      );
    }

    // Validate separator value
    if (!["-", "/"].includes(separator)) {
      return next(createError.createError(400, "Invalid separator value"));
    }

    const company = await Company.findOne({
      where: { id: Number(CompanyId) },
    });

    if (!company) {
      return next(createError.createError(404, "Company not found"));
    }

    const activeCompanyId = await IdFormat.findOne({
      where: { isActive: true, CompanyId: Number(CompanyId) },
    });

    if (!activeCompanyId) {
      return next(
        createError.createError(404, "Active company ID format not found")
      );
    }

    console.log("Received Separator:", separator);

    // Update ID format
    await IdFormat.update(
      {
        companyCode: company.companyCode,
        year,
        department,
        order,
        separator, // Directly use validated separator
        digitLength,
      },
      { where: { id: activeCompanyId.id } }
    );

    // Retrieve the updated record
    const updatedIdFormat = await IdFormat.findOne({
      where: { id: activeCompanyId.id },
    });

    return res.status(200).json({
      message: "ID format updated successfully",
      data: updatedIdFormat,
    });
  } catch (error) {
    console.error("Error updating ID format:", error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
// exports.updateCompanyIdFormat = async (req, res, next) => {
//   try {
//     const CompanyId =
//       req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
//     const { year, department, order ,digitLength} = req.body;

//     if (!year || !department || !order) {
//       return next(
//         createError.createError(404, "Please provide all required field")
//       );
//     }

//     const company = await Company.findOne({
//       where: {
//         id: Number(CompanyId),
//       },
//     });

//     if (!company) {
//       return next(createError.createError(404, "Company not found"));
//     }

//     const activeCompanyId = await IdFormat.findOne({
//       where: { isActive: true, CompanyId: Number(CompanyId) },
//     });
//     if (!activeCompanyId)
//       return next(createError.createError(404, "Active company id not found"));

//     const updatedIdFormat = await IdFormat.update({
//       companyCode: company.companyCode,
//       year: year,
//       department: department,
//       order: order,
//       digitLength: digitLength
//     }, where:{
//       id: companyIdFormat?.id
//     });

//     return res
//       .status(200)
//       .json({ message: "id format updated successfully", updatedIdFormat });
//   } catch (error) {
//     console.log(error);
//     return next(
//       createError.createError(503, "An error occurred, please try again later")
//     );
//   }
// };

exports.getActiveCompany = async (req, res, next) => {
  try {
    const activeCompanyId = await IdFormat.findOne({
      where: { isActive: true, CompanyId: Number(req.user.id) },
    });
    if (!activeCompanyId)
      return next(createError.createError(404, "Resource not found"));
    res.status(200).json({
      message: "Data fetched successfully",
      data: activeCompanyId,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
