const Package = require("../models/package.js");

// Define controller methods for handling User requests
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.findAll();

    return res.status(200).json({
      count: packages.length,
      packages,
    });
  } 
  catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      console.log("first", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.getpackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const package = await Package.findByPk(id);
    return res.json(package);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.createPackage = async (req, res, next) => {
  try {
    const {
      packageName,
      min_employee,
      max_employee,
      price,
      service,
      discount,
      isTrial,
    } = req.body;

    const existingPackage = await Package.findOne({
      where: {
        packageName: packageName,
        max_employee: max_employee,
        min_employee: min_employee,
        price: price,
      },
    });

    if (existingPackage) {
      return res.status(409).json({
        message: "Package already created ",
      });
    } else {
      const packages = await Package.create({
        packageName,
        price,
        max_employee,
        min_employee,
        service,
        discount,
        isTrial,
      });
      return res.status(200).json({
        message: "Successfully Registered",
        packages,
      });
    }
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json({ message: "Validation error", errors });
    } else if (error instanceof Sequelize.UniqueConstraintError) {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(409).json({ message: "Conflict", errors });
    } else {
      console.error("Error during registration:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.updatePackage = async (req, res, next) => {
  try {
    const {
      packageName,
      min_employee,
      max_employee,
      price,
      service,
      discount,
      isTrial,
    } = req.body;
    const updates = {};
    const { id } = req.params;

    if (packageName) {
      updates.packageName = packageName;
    }
    if (min_employee) {
      updates.min_employee = min_employee;
    }
    if (max_employee) {
      updates.max_employee = max_employee;
    }
    if (price) {
      updates.price = price;
    }
    if (service) {
      updates.service = service;
    }
    if (discount) {
      updates.discount = discount;
    }
    if (isTrial) {
      updates.isTrial = isTrial;
    }

    const result = await Package.update(updates, { where: { id: id } });

    return res.status(200).json({
      message: "updated successfully",
    });
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
  }
};

exports.deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const package = await Package.findOne({ where: { id: id } });
    if (package) {
      await Package.destroy({ where: { id } });
      return res.status(200).json({ message: "package deleted successfully" });
    } else {
      return res
        .status(409)
        .json({ message: "There is no package with this ID" });
    }
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
  }
};
