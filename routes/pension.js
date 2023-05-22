const express = require("express");
const router = express.Router();
const pensionController = require("../controllers/pension.js");
const middleware = require("../middleware/auth.js");

// Define routes for handling User requests
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  pensionController.getAllPension
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  pensionController.createPension
);

router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),

  pensionController.updatePension
);
router.get("/:id", pensionController.getpensionById);

module.exports = router;
