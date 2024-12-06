const Company = require("../models/company.js");
const Subscription = require("../models/subscription.js");
const createError= require("../utils/error.js")

// Define controller methods for handling User requests
exports.getAllSubscription = async (req, res,next) => {
  try {
    const packages = await Subscription.findAll({
      include: [Company],
    });
    return res.status(200).json({
      count: packages.length,
      packages,
    });
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

