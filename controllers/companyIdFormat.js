const IdFormat = require("../models/companyIdFormat");
const createError = require('.././utils/error.js')
const successResponse = require('.././utils/successResponse.js')

// create CompanyIdFormat
exports.createCompanyIdFormat = async (req, res) => {
  // const { companyCode, year, department, separator, order } = req.body;
  try {
    const companyIds = await IdFormat.findAll({
      where: { companyId: Number(req.user.id) },
    });
    if (companyIds.length >= 1)
      return res
        .status(400)
        .json({ error: "id format already exist, try to update" });
    const companyIdFormat = await IdFormat.create(req.body);
    await companyIdFormat.setCompany(Number(req.user.id));
    return res.status(201).json(companyIdFormat);
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'));
  }
};

// get all companyIdFormat
exports.getAllCompanyIdFormat = async (req, res) => {
  try {
    const IdFormates = await IdFormat.findAll({
      where: { companyId: Number(req.user.id) },
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
    return next(createError.createError(500, 'Internal server error'));
  
  }
};

// delete Company
exports.deleteCompanyIdFormat = async (req, res) => {
  const { id } = req.params;
  try {
    const company = await IdFormat.findByPk(Number(id));
    if (!company) {
      res.status(404).json({ error: "Id Format does not exist" });
    } else {
      await company.destroy();
      return res.json("Id Format deleted successfully");
    }
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'));
  }
};

exports.updateCompanyIdFormat = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    console.log("first",req.body)
    const idFormat = await IdFormat.findByPk(id);
    if (!idFormat)
      return res.status(404).json({ error: "Id format not found" });
    // idFormat.isActive = false;
    try {
  const updatedIdFormat=    await idFormat.update(req.body);

        return res.status(200).json({ msg: "id format updated successfully" ,
        updatedIdFormat
      });
   
    } catch (error) {
      return next(createError.createError(500, 'Internal server error'));
    }
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'));
  }
};

exports.getActiveCompany = async (req, res) => {
  try {
    const activeCompanyId = await IdFormat.findOne({
      where: { isActive: true, companyId: Number(req.user.id) },
    });
    if (!activeCompanyId)
      return res.status(404).json({ message: "there is no active Id format" });
    res.status(200).json(activeCompanyId);
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'));
  }
};
