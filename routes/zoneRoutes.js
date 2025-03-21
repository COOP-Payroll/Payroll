const express = require("express");
const router = express.Router();
const zoneController = require("../controllers/zoneControllers");
const middleware = require("../middleware/auth.js");
// Create a new region
router.post("/", zoneController.createZone);

// Get all regions
router.get("/", zoneController.getAllZones);
router.get("/get-woredas/:id", zoneController.getWoredasUnderZone);
// Get region by ID
router.get("/:id", zoneController.getZoneById);

// Update a region
router.put("/:id", zoneController.updateZone);

// Delete a region
router.delete("/:id", zoneController.deleteZone);

module.exports = router;
