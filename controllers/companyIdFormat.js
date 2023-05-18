const IdFormat = require("../models/companyIdFormat");

// create CompanyIdFormat
exports.createCompanyIdFormat = async (req, res) => {
  try {
    const companyIdFormat = await IdFormat.create(req.body);
    return res.status(201).json(companyIdFormat);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });
      res.status(400).json(errors);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};
