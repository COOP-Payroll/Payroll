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
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }
};

