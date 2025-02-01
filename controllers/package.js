const { getNameOfDeclaration } = require("typescript");
const Package = require("../models/package.js");
const createError = require("../utils/error.js");

// Define controller methods for handling User requests
exports.getAllPackages = async (req, res, next) => {
  try {
    const packages = await Package.findAll();
    // return res.json("dddd");
    // res.removeHeader("Set-Cookie");
    return res.status(200).json({
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getMonthlyPackages = async (req, res, next) => {
  try {
    const monthlyPackages = await Package.findAll({
      where: { packageType: "Monthly" },
    });

    res.status(200).json({
      // status: 200,
      message: "Monthly packages fetched successfully.",
      // count: monthlyPackages.length,
      data: monthlyPackages,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getYearlyPackages = async (req, res, next) => {
  try {
    const yearlyPackages = await Package.findAll({
      where: { packageType: "Yearly" },
    });

    res.status(200).json({
      // status: 200,
      message: "Yearly packages fetched successfully.",
      // count: yearlyPackages.length,
      data: yearlyPackages,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getpackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const package = await Package.findByPk(id);
    return res.json({ data: package });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.createPackage = async (req, res, next) => {
  try {
    const {
      packageType,
      packageName,
      min_employee,
      max_employee,
      price,
      service,
      discount,
    } = req.body;

    console.log({
      packageType,
      packageName,
      min_employee,
      max_employee,
      price,
      service,
    });

    var isTrial = packageName === "Trial" ? true : false;

    const existingPackage = await Package.findOne({
      where: {
        packageType: packageType,
        packageName: packageName,
        max_employee: max_employee,
        min_employee: min_employee,
        price: price,
      },
    });

    if (existingPackage) {
      return next(createError.createError(400, "Package already created "));
    } else {
      const packages = await Package.create({
        packageType,
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
        data: packages,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.updatePackage = async (req, res, next) => {
  try {
    const {
      packageType,
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
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
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
        .status(400)
        .json({ message: "There is no package with this ID" });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getTrial = async (req, res, next) => {
  try {
    const trial = await Package.findAll({ where: { packageType: "Trial" } });

    res.status(200).json({ success: true, data: trial });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
