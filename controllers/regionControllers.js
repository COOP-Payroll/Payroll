const Region = require("../models/region");
const Woreda = require("../models/woreda.js");
const Zone = require("../models/zone.js");
const createError = require("../utils/error.js");

exports.createRegion = async (req, res, next) => {
  try {
    const { name, code } = req.body;

    // Check if 'name' is provided
    if (!name) {
      return next(createError.createError(400, "Region name is required"));
    }

    // Ensure only one active region exists
    // const existingRegion = await Region.findOne({ where: { isActive: true } });  
    // if (existingRegion) {
    //   return next(
    //     createError.createError(
    //       400,
    //       "Cannot create more than one active region"
    //     )
    //   );
    // }

    // Create new region (name is no longer unique)
    const region = await Region.create({ name, code });

    res.status(201).json({
      success: true,
      data: region,
      message: "Region created successfully",
    });
  } catch (error) {
    console.error("Error creating region:", error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// GET all regions
exports.getAllRegions = async (req, res, next) => {
  try {
    const regions = await Region.findAll({ where: { isActive: true } });

    res.status(200).json({
      success: true,
      //   count: regions.length,
      data: regions,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// GET single region by ID
exports.getRegionById = async (req, res, next) => {
  try {
    const region = await Region.findOne({
      where: { id: req.params.id, isActive: true },
    });

    if (!region) {
      return next(createError.createError(404, "Region not found"));
    }

    res.status(200).json({
      success: true,
      data: region,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//GET ZONE UNDER REGION
exports.getZonesUnderRegions = async (req, res, next) => {
  try {
    const regionId = Number(req.params.regionId);

    // Validate if ID is a number
    if (isNaN(regionId)) {
      return next(createError.createError(400, "Invalid Region ID"));
    }
    const region = await Region.findOne({
      where: { id: regionId, isActive: true },
      include: [
        {
          model: Zone,
          //   as: "zones", // Ensure this matches the association alias
          where: { isActive: true }, // Fetch only active zones
          required: false, // Include region even if there are no zones
        },
      ],
    });

    if (!region) {
      return next(createError.createError(404, "Region not found"));
    }

    res.status(200).json({
      success: true,
      data: region?.Zones,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.getWoredasUnderZones = async (req, res, next) => {
  try {
    const regionId = Number(req.params.regionId);
    const zoneId = Number(req.params.zoneId);

    // Validate if IDs are numbers
    if (isNaN(regionId)) {
      return next(createError.createError(400, "Invalid Region ID"));
    }
    if (isNaN(zoneId)) {
      return next(createError.createError(400, "Invalid Zone ID"));
    }

    // Check if the region exists
    const region = await Region.findOne({
      where: { id: regionId, isActive: true },
      include: [
        {
          model: Zone,
          //   as: "Zones",
          where: { id: zoneId, isActive: true }, // Ensure the zone belongs to this region
          include: [
            {
              model: Woreda,
              //   as: "Woredas", // Ensure alias matches the association
              where: { isActive: true },
              required: false, // Include the zone even if no woredas exist
            },
          ],
          required: true, // Ensure the zone is part of the region
        },
      ],
    });

    if (!region) {
      return next(createError.createError(404, "Region or Zone not found"));
    }

    res.status(200).json({
      success: true,
      data: region.Zones[0]?.Woredas || [], // Return the list of woredas under the zone
    });
  } catch (error) {
    console.error(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
// exports.getWoredasUnderZones = async (req, res, next) => {
//     try {
//         const regionId = Number(req.params.regionId);
//         const zoneId = Number(req.params.zoneId);

//         // Validate if ID is a number
//         if (isNaN(regionId)) {
//         return next(createError.createError(400, "Invalid Region ID"));
//         }

//         if (isNaN(zoneId)) {
//         return next(createError.createError(400, "Invalid zone ID"));
//         }
//         const region = await Region.findOne({
//         where: { id: regionId, isActive: true },
//         include: [
//             {
//             model: Zone,
//             //   as: "zones", // Ensure this matches the association alias
//             where: { isActive: true }, // Fetch only active zones
//             required: false, // Include region even if there are no zones
//             },
//         ],
//         });

//         if (!region) {
//         return next(createError.createError(404, "Region not found"));
//         }

//         res.status(200).json({
//         success: true,
//         data: region?.Zones,
//         });
//     } catch (error) {
//         console.log(error);
//         return next(
//         createError.createError(503, "An error occurred, please try again later")
//         );
//     }
//     };
// UPDATE a region
exports.updateRegion = async (req, res, next) => {
  try {
    const regionId = req.params.id;

    // Validate if ID is a number
    if (isNaN(regionId)) {
      return next(createError.createError(400, "Invalid region ID"));
    }

    // Find the active region by ID
    const region = await Region.findOne({
      where: { id: regionId, isActive: true },
    });

    if (!region) {
      return next(createError.createError(404, "Region not found"));
    }

    // Update region
    await region.update(req.body);

    res.status(200).json({
      success: true,
      data: region,
      message: "Region updated successfully",
    });
  } catch (error) {
    console.error("Error updating region:", error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.deleteRegion = async (req, res, next) => {
  try {
    const regionId = req.params.id;

    // Validate if ID is a number
    if (isNaN(regionId)) {
      return next(createError.createError(400, "Invalid region ID"));
    }

    // Find the active region by ID
    const region = await Region.findOne({
      where: { id: regionId, isActive: true },
    });

    if (!region) {
      return next(createError.createError(404, "Region not found"));
    }

    // Perform a soft delete by setting isActive to false
    await region.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: "Region deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting region:", error);
    next(createError(503, "An error occurred, please try again later"));
  }
};
