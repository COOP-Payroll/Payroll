const express = require("express");
const router = express.Router();
const zoneController = require("../controllers/zoneControllers");
const middleware = require("../middleware/auth.js");
// Create a new region
router.post(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  zoneController.createZone
);

// Get all regions
router.get(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  zoneController.getAllZones
);
router.get(
  "/get-woredas/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  zoneController.getWoredasUnderZone
);
// Get region by ID
router.get(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  zoneController.getZoneById
);

// Update a region
router.put(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  zoneController.updateZone
);

// Delete a region
router.delete(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  zoneController.deleteZone
);

module.exports = router;
