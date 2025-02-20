const IdFormat = require("../models/companyIdFormat");
const createError = require(".././utils/error.js");
const successResponse = require(".././utils/successResponse.js");

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
    const { id } = req.params;
    const { data } = req.body;
    const idFormat = await IdFormat.findByPk(id);
    if (!idFormat)
      return next(createError.createError(404, "Invalid request data"));
    // idFormat.isActive = false;

    const updatedIdFormat = await idFormat.update(req.body);

    return res
      .status(200)
      .json({ msg: "id format updated successfully", updatedIdFormat });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

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
