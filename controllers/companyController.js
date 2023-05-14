const Company = require("../models/company.js");
const Package = require("../models/package.js");
const Subscription = require("../models/subscription.js");
const { calculateNextPayment } = require("../utils/helper.js");

// create Company
exports.createCompany = async (req, res) => {
  const data = Object.keys(req.body)
    .filter((key) => key !== "duration" && key !== "packageId")
    .reduce((acc, key) => {
      acc[key] = req.body[key];
      return acc;
    }, {});

  const packageId = Number(req.body.packageId);
  const duration = Number(req.body.duration);
  try {
    const company = await Company.create(data);
    const package = await Package.findByPk(packageId);
    if (!package) {
      res.status(404).json({ error: "package does not exist!" });
    } else {
      const subscription = await Subscription.create({ duration });
      await subscription.setPackage(packageId);
      await subscription.setCompany(company.id);
      const nextPaymentDate = await calculateNextPayment({
        chargeType: package.packageName,
        duration,
        normalDate: Date.now(),
      });
      await subscription.update({ nextPaymentDate });
      res.status(201).json(subscription);
    }
  } catch (error) {
    console.log("first", error);
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

// get AllCompany
exports.getAllCompany = async (req, res) => {
  const companys = await Company.findAll({
    attributes: { exclude: ["password"] },
    include: [Subscription],
  });
  res.json(companys);
};

// get only one company
exports.getCompanyById = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findByPk(Number(id), {
      attributes: { exclude: ["password"] },
    });
    if (!company) res.status(404).json({ error: "Company does not exist" });
    res.json(company);
  } catch (error) {
    res.json(error);
  }
};

// update Company
exports.updateCompany = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const company = await Company.findByPk(Number(id));
    if (!company) res.status(404).json({ error: "Company does not exist" });

    // Disallow updating password field
    if (body.password) {
      delete body.password;
    }

    // Validate the updated data against the model
    await company.validate();
    await company.update(body);

    // Return the updated company object
    return res.json(company);
  } catch (error) {
    // Handle validation errors
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((error) => ({
        field: error.path,
        message: error.message,
      }));
      return res.status(400).json(validationErrors);
    }

    // Handle other errors
    return res.status(500).json({ error: "Internal server error" });
  }
};

// delete Company
exports.deleteCompany = async (req, res) => {
  const { id } = req.params;
  try {
    const company = await Company.findByPk(Number(id));
    if (!company) res.status(404).json({ error: "Company does not exist" });
    await company.destroy();
    res.json("company deleted successfully");
  } catch (error) {
    console.log("err", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
