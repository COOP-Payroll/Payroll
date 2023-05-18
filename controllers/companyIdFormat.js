const IdFormat = require("../models/companyIdFormat");

// create CompanyIdFormat
exports.createCompanyIdFormat = async (req, res) => {
  // const { companyCode, year, department, separator, order } = req.body;
  try {
    const companyIds = await IdFormat.findAll();
    if (companyIds.length >= 1)
      return res.status(400).json({ error: "idformat already exist" });
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
    const IdFormates = await IdFormat.findAll();
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
