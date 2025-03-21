const express = require("express");
const router = express.Router();
const woredaController = require("../controllers/woredaControllers.js");
const middleware = require("../middleware/auth.js");
// Create a new region
router.post("/", woredaController.createWoreda);

// Get all regions
router.get("/", woredaController.getAllWoredas);

// Get region by ID
router.get("/:id", woredaController.getWoredaById);

// Update a region
router.put("/:id", woredaController.updateWoreda);

// Delete a region
router.delete("/:id", woredaController.deleteWoreda);

module.exports = router;
