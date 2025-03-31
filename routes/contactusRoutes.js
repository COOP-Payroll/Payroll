const express = require("express");
const contactus = require("../controllers/contactusControllers.js");

const router = express.Router();
const middleware = require("../middleware/auth.js");

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictTo("superAdmin"),
  middleware.validateUserAgent,
  contactus.getAllContacts
);
router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("superAdmin"),
  //   middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  //   deduction.getDeductionById
  contactus.getContactById
);
router.post("/", middleware.validateUserAgent, contactus.createContact);

router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("superAdmin"),
  contactus.deleteContact
);

module.exports = router;
