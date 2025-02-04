const Company = require("../models/company.js");
const Package = require("../models/package.js");
const Subscription = require("../models/subscription.js");
const createError = require("../utils/error.js");

// Define controller methods for handling User requests
exports.getAllSubscription = async (req, res, next) => {
  try {
    const packages = await Subscription.findAll({
      include: [Company],
    });
    return res.status(200).json({
      count: packages.length,
      packages,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.getCompanySubscription = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const subscriptions = await Subscription.findAll({
      where: { CompanyId }, // Add the filter to only get subscriptions for the user's company
      include: [
        // {
        //   model: Company,
        // },
        {
          model: Package, // Include the associated Package
        },
      ],
    });

    return res.status(200).json({
      count: subscriptions.length,
      message: "Fetched successfully",
      data: subscriptions,
    });
  } catch (error) {
    // print(error);
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
