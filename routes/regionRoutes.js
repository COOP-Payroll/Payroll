const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionControllers.js");
const middleware = require("../middleware/auth.js");
// Create a new region
router.post(
  "/",
  middleware.validateUserAgent,
  // middleware.protectAll,
  // middleware.restrictToAll("superAdmin"),
  regionController.createRegion
);

// Get all regions
router.get(
  "/",
  // middleware.validateUserAgent,
  // middleware.protectAll,
  regionController.getAllRegions
);

// Get region by ID
router.get(
  "/:id",
  // middleware.validateUserAgent,
  // middleware.protectAll,
  regionController.getRegionById
);
router.get(
  "/get-zones/:regionId",
  // middleware.validateUserAgent,
  // middleware.protectAll,
  regionController.getZonesUnderRegions
);
router.get(
  "/get-Woredas/:regionId/:zoneId",
  // middleware.validateUserAgent,
  // middleware.protectAll,
  regionController.getWoredasUnderZones
);

// Update a region
router.put(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  regionController.updateRegion
);

// Delete a region
router.delete(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  regionController.deleteRegion
);

module.exports = router;
