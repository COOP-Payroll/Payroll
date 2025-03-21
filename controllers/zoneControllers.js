const Zone = require("../models/zone");
const Region = require("../models/region");
const createError = require("../utils/error");
const Woreda = require("../models/woreda");

// CREATE a new zone
exports.createZone = async (req, res, next) => {
  try {
    const { name, regionId } = req.body;

    // Convert regionId to a number
    const regionIdNum = Number(regionId);

    // Check if 'name' is provided
    if (!name) {
      return next(createError.createError(400, "Zone name is required"));
    }

    // Validate 'regionId'
    if (!regionId || isNaN(regionIdNum)) {
      return next(createError.createError(400, "Valid region ID is required"));
    }

    // Ensure the associated region exists and is active
    const region = await Region.findOne({
      where: { id: regionIdNum, isActive: true },
    });

    if (!region) {
      return next(createError.createError(404, "Region not found or inactive"));
    }

    // Create new zone
    const zone = await Zone.create({ name, RegionId: regionIdNum });

    res.status(201).json({
      success: true,
      data: zone,
      message: "Zone created successfully",
    });
  } catch (error) {
    console.error("Error creating zone:", error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// GET all active zones
exports.getAllZones = async (req, res, next) => {
  try {
    const zones = await Zone.findAll({
      where: { isActive: true },
      include: [{ model: Region }],
    });

    res.status(200).json({
      success: true,
      data: zones,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// GET single zone by ID
exports.getZoneById = async (req, res, next) => {
  try {
    const zoneId = Number(req.params.id);

    if (isNaN(zoneId)) {
      return next(createError(400, "Invalid zone ID"));
    }

    const zone = await Zone.findOne({
      where: { id: zoneId, isActive: true },
      include: [{ model: Region }],
    });

    if (!zone) {
      return next(createError.createError(404, "Zone not found"));
    }

    res.status(200).json({
      success: true,
      data: zone,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
// Get all Woredas under a specific Zone
exports.getWoredasUnderZone = async (req, res, next) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) {
      return next(createError.createError(404, "Zone not found "));
    }

    const woredas = await Woreda.findAll({
      where: { ZoneId: zone.id }, // Assuming Woreda model has a zoneId field
    });

    res.status(200).json({
      success: true,
      data: woredas,
    });
  } catch (error) {
    console.error("Error updating zone:", error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
// UPDATE a zone
exports.updateZone = async (req, res, next) => {
  try {
    const zoneId = Number(req.params.id);

    // Validate if ID is a number
    if (isNaN(zoneId)) {
      return next(createError(400, "Invalid zone ID"));
    }

    // Find the active zone by ID
    const zone = await Zone.findOne({
      where: { id: zoneId, isActive: true },
    });

    if (!zone) {
      return next(createError.createError(404, "Zone not found"));
    }

    // Extract name from request body
    const { name } = req.body;
    if (!name) {
      return next(createError(400, "Zone name is required"));
    }

    // Update only the name
    await zone.update({ name });

    res.status(200).json({
      success: true,
      data: zone,
      message: "Zone name updated successfully",
    });
  } catch (error) {
    console.error("Error updating zone:", error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// DELETE a zone (Soft delete)
exports.deleteZone = async (req, res, next) => {
  try {
    const zoneId = Number(req.params.id);

    // Validate if ID is a number
    if (isNaN(zoneId)) {
      return next(createError.createError(400, "Invalid zone ID"));
    }

    // Find the active zone by ID
    const zone = await Zone.findOne({
      where: { id: zoneId, isActive: true },
    });

    if (!zone) {
      return next(createError.createError(404, "Zone not found"));
    }

    // Perform a soft delete by setting isActive to false
    await zone.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: "Zone deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting zone:", error);
    next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
