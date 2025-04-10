// const PerDiemRate = require("../models/perdem.js"); // Adjust if needed
const sequelize = require("../database/db.js");
const PerDiemRate = require("../models/dailyperdiemrate.js");
const createError = require("../utils/error.js");
// GET ALL PER DIEM RATES FOR COMPANY
exports.getAllPerDiemRates = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const perDiemRates = await PerDiemRate.findOne({
      where: { CompanyId, isActive: true },
      attributes: { exclude: ["CompanyId", "createdAt", "updatedAt"] },
      order: [["id", "ASC"]],
    });
    res.status(200).json({
      //   count: perDiemRates.length,
      data: perDiemRates,
    });
  } catch (error) {
    console.error(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// GET PER DIEM RATE BY ID
exports.getPerDiemRateById = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { id } = req.params;

    const perDiem = await PerDiemRate.findOne({
      where: {
        id,
        CompanyId,
        isActive: true,
      },
    });

    if (!perDiem) {
      return next(createError.createError(404, "Per diem rate not found"));
    }

    res.status(200).json(perDiem);
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// CREATE PER DIEM RATE
exports.createPerDiemRate = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const { dailyRate } = req.body;

    if (!dailyRate) {
      return next(
        createError.createError(400, "Per diem daily rate is required")
      );
    }
    // Check if a per diem already exists for this company
    const existing = await PerDiemRate.findOne({
      where: { CompanyId },
    });

    if (existing) {
      return next(
        createError.createError(
          409,
          "Per diem rate already exists for this company"
        )
      );
    }

    const perDiem = await PerDiemRate.create({
      dailyRate,
      CompanyId,
    });

    res.status(201).json({
      message: "Per diem rate created successfully",
      data: perDiem,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// UPDATE PER DIEM RATE
exports.updatePerDiemRate = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { id } = req.params;
    const { dailyRate } = req.body;

    const existingRate = await PerDiemRate.findOne({
      where: {
        isActive: true,
        CompanyId: CompanyId,
      },
    });

    if (!existingRate) {
      return next(createError.createError(404, "Per diem rate not found"));
    }

    // Set the previous one to inactive
    existingRate.isActive = false;
    await existingRate.save();

    // Create a new active rate with updated dailyRate
    const newRate = await PerDiemRate.create({
      dailyRate: dailyRate ?? existingRate.dailyRate,
      isActive: true,
      CompanyId: existingRate.CompanyId,
    });

    res.status(200).json({
      message: "Per diem rate updated successfully (new version created)",
      data: newRate,
    });
  } catch (error) {
    console.error(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// DELETE PER DIEM RATE
exports.deletePerDiemRate = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { id } = req.params;

    const perDiem = await PerDiemRate.findOne({
      where: {
        id: id,
        isActive: true,
        CompanyId: CompanyId,
      },
    });

    if (!perDiem) {
      return next(createError.createError(404, "Per diem rate not found"));
    }

    // Soft delete: set isActive to false
    perDiem.isActive = false;
    await perDiem.save();

    res.status(200).json({
      message: "Per diem rate marked as inactive",
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
