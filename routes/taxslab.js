const express = require("express");
const router = express.Router();
const taxslabController = require("../controllers/taxslab.js");

const middleware = require("../middleware/auth.js");

// Define routes for handling User requests
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictToAdmin("superAdmin"),
  taxslabController.getAllTaxslabs
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAdmin("superAdmin"),
  taxslabController.createTaxslab
);
router.delete("/:id", taxslabController.deleteTaxslab);
router.put("/:id", taxslabController.updateTaxslab);
router.get("/:id", taxslabController.getTaxslabById);

module.exports = router;
