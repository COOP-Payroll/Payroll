const IdFormat = require("../models/companyIdFormat");

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
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });
      return res.status(400).json(errors);
    }
    return res.status(500).json({ error: "Internal server error" });
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
    res.json(error);
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
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateCompanyIdFormat = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    const idFormat = await IdFormat.findByPk(id);
    if (!idFormat)
      return res.status(404).json({ error: "Id format not found" });
    // idFormat.isActive = false;
    try {
      await idFormat.update(data);
      // await idFormat.save();
      // const companyIdFormat = await IdFormat.create(req.body);
      // try {
      //   await companyIdFormat.setCompany(Number(req.user.id));
      //   return res.status(200).json({ msg: "id format updated successfully" });
      // } catch (error) {
      //   // Handle the error during association
      //   await companyIdFormat.destroy(); // Rollback the created companyIdFormat if association fails
      //   return res
      //     .status(500)
      //     .json({ error: "Error associating id format with company" });
      // }
    } catch (error) {
      return res.status(500).json(error);
    }
  } catch (error) {
    return res.status(400).json({ error });
  }
};

exports.getActiveCompany = async (req, res) => {
  try {
    const activeCompanyId = await IdFormat.findOne({
      where: { isActive: true, companyId: Number(req.user.id) },
    });
    if (!activeCompanyId)
      return res.status(404).json({ error: "there is no active Id format" });
    res.status(200).json(activeCompanyId);
  } catch (error) {
    return res.status(500).json({ error });
  }
};
