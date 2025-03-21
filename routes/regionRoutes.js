const express = require("express");
const router = express.Router();
const regionController = require("../controllers/regionControllers.js");

// Create a new region
router.post("/", regionController.createRegion);

// Get all regions
router.get("/", regionController.getAllRegions);

// Get region by ID
router.get("/:id", regionController.getRegionById);
router.get("/get-zones/:regionId", regionController.getZonesUnderRegions);
router.get(
  "/get-Woredas/:regionId/:zoneId",
  regionController.getWoredasUnderZones
);

// Update a region
router.put("/:id", regionController.updateRegion);

// Delete a region
router.delete("/:id", regionController.deleteRegion);

module.exports = router;
