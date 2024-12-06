const express = require("express");
const middleware = require("../middleware/auth");
const serviceController = require("../controllers/services.js");
const router = express.Router();
//
//get all grade of the same company
router.get(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  serviceController.getAllServices
);

router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  serviceController.getServicesById
);
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.validateUserAgent,
  serviceController.createServices
);

router.put(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  serviceController.updateServices
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,

  serviceController.deleteServices
);
module.exports = router;
