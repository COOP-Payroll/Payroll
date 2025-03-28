const express = require("express");
const router = express.Router();
const woredaController = require("../controllers/woredaControllers.js");
const middleware = require("../middleware/auth.js");
// Create a new region
router.post(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictTo("superAdmin"),
  woredaController.createWoreda
);

// Get all regions
router.get(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  woredaController.getAllWoredas
);

// Get region by ID
router.get(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  woredaController.getWoredaById
);

// Update a region
router.put(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  woredaController.updateWoreda
);

// Delete a region
router.delete(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  woredaController.deleteWoreda
);

module.exports = router;
