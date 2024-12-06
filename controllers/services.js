const Pension = require("../models/pension.js");

const Services = require("../models/services.js");
const User = require("../models/user.js");
const createError = require("../utils/error.js");
const { Op, where } = require("sequelize");

// GET ALL SERVICES
exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Services.findAll({});
    res.status(200).json({
      services,
    });
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

// SERVICES BY ID
exports.getServicesById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const services = await Services.findByPk(id);
    res.status(200).json(services);
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

//CREATE SERVICES
exports.createServices = async (req, res, next) => {
  try {
    const { serviceName, description } = req.body;

    const getAllServices = await Services.findOne({
      where: { serviceName },
    });

    if (getAllServices != null || getAllServices) {
      return next(
        createError.createError(400, "Services is already defined update it")
      );
    }

    const services = await Services.create({
      serviceName,
      description,
    });

    return res.status(200).json({
      message: "Successfully Registered",
      services,
    });
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

//UPDATE SERVICES
exports.updateServices = async (req, res, next) => {
  try {
    const { serviceName, description } = req.body;
    const updates = {};
    const { id } = req.params;

    const checkServices = await Services.findByPk(id);

    if (!checkServices) {
      return res
        .status(404)
        .json({ message: "There is no Services with these Id" });
    } else {
      if (serviceName) {
        updates.serviceName = serviceName;
      }
      if (description) {
        updates.description = description;
      }

      const result = await Services.update(serviceName, description, {
        where: { id: id },
      });
      return res.status(200).json({
        message: "updated successfully",
      });
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

//DELETE SERVICES
exports.deleteServices = async (req, res, next) => {
  try {
    const { id } = req.params;

    const services = await Services.findOne({ where: { id: id } });
    if (services) {
      await Services.destroy({ where: { id } });
      return res.status(200).json({ message: "Deleted successfully" });
    } else {
      return res
        .status(400)
        .json({ message: "There is no services with this ID" });
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
