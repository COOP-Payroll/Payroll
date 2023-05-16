const express = require("express");
const router = express.Router();
const pensionController = require("../controllers/pension.js");
const middleware = require("../middleware/auth.js");

// Define routes for handling User requests
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictToAdmin("superAdmin"),
  pensionController.getAllPension
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAdmin("superAdmin"),
  pensionController.createPension
);
router.delete("/:id", pensionController.deletePension);
router.put("/:id", pensionController.updatePension);
router.get("/:id", pensionController.getpensionById);

module.exports = router;
