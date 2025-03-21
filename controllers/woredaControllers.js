const Woreda = require("../models/woreda");
const Zone = require("../models/zone");
const createError = require("../utils/error");

// // CREATE a new woreda
// exports.createWoreda = async (req, res, next) => {
//   try {
//     const { name, zoneId } = req.body;

//     // Validate 'name'
//     if (!name) {
//       return next(createError.createError(400, "Woreda name is required"));
//     }

//     // Validate 'zoneId'
//     const zoneIdNum = Number(zoneId);
//     if (!zoneId || isNaN(zoneIdNum)) {
//       return next(createError.createError(400, "Valid zone ID is required"));
//     }

//     // Ensure the associated zone exists
//     const zone = await Zone.findOne({ where: { id: zoneIdNum } });

//     if (!zone) {
//       return next(createError.createError(404, "Zone not found"));
//     }

//     // Create the new woreda
//     const woreda = await Woreda.create({ name, ZoneId: zoneIdNum });

//     res.status(201).json({
//       success: true,
//       data: woreda,
//       message: "Woreda created successfully",
//     });
//   } catch (error) {
//     console.error("Error creating woreda:", error);
//     return next(createError.createError(503, "An error occurred, please try again later"));
//   }
// };

// CREATE a new woreda
exports.createWoreda = async (req, res, next) => {
  try {
    const { name, zoneId } = req.body;

    // Validate 'name'
    if (!name) {
      return next(createError.createError(400, "Woreda name is required"));
    }

    // Validate 'zoneId'
    const zoneIdNum = Number(zoneId);
    if (!zoneId || isNaN(zoneIdNum)) {
      return next(createError.createError(400, "Valid zone ID is required"));
    }

    // Ensure the associated zone exists
    const zone = await Zone.findOne({ where: { id: zoneIdNum } });

    if (!zone) {
      return next(createError.createError(404, "Zone not found"));
    }

    // Check if a Woreda with the same name already exists in the zone
    const existingWoreda = await Woreda.findOne({
      where: { name, ZoneId: zoneIdNum },
    });

    if (existingWoreda) {
      return next(
        createError.createError(400, "Woreda name already taken in this zone")
      );
    }

    // Create the new woreda
    const woreda = await Woreda.create({ name, ZoneId: zoneIdNum });

    res.status(201).json({
      success: true,
      data: woreda,
      message: "Woreda created successfully",
    });
  } catch (error) {
    console.error("Error creating woreda:", error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// GET all active woredas
exports.getAllWoredas = async (req, res, next) => {
  try {
    const woredas = await Woreda.findAll({
      where: { isActive: true },
      include: [{ model: Zone }],
    });

    res.status(200).json({
      success: true,
      data: woredas,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// GET a single woreda by ID
exports.getWoredaById = async (req, res, next) => {
  try {
    const woredaId = Number(req.params.id);

    if (isNaN(woredaId)) {
      return next(createError.createError(400, "Invalid woreda ID"));
    }

    const woreda = await Woreda.findOne({
      where: { id: woredaId, isActive: true },
      include: [{ model: Zone }],
    });

    if (!woreda) {
      return next(createError.createError(404, "Woreda not found"));
    }

    res.status(200).json({
      success: true,
      data: woreda,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// UPDATE a woreda
exports.updateWoreda = async (req, res, next) => {
  try {
    const woredaId = Number(req.params.id);

    if (isNaN(woredaId)) {
      return next(createError.createError(400, "Invalid woreda ID"));
    }

    const woreda = await Woreda.findOne({
      where: { id: woredaId, isActive: true },
    });

    if (!woreda) {
      return next(createError.createError(404, "Woreda not found"));
    }

    const { name } = req.body;
    if (!name) {
      return next(createError.createError(400, "Woreda name is required"));
    }

    await woreda.update({ name });

    res.status(200).json({
      success: true,
      data: woreda,
      message: "Woreda updated successfully",
    });
  } catch (error) {
    console.error("Error updating woreda:", error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// DELETE a woreda (Soft delete)
exports.deleteWoreda = async (req, res, next) => {
  try {
    const woredaId = Number(req.params.id);

    if (isNaN(woredaId)) {
      return next(createError.createError(400, "Invalid woreda ID"));
    }

    const woreda = await Woreda.findOne({
      where: { id: woredaId, isActive: true },
    });

    if (!woreda) {
      return next(createError.createError(404, "Woreda not found"));
    }

    await woreda.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: "Woreda deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting woreda:", error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
