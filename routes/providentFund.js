const express = require("express");
const router = express.Router();
const providentController = require("../controllers/providentFund.js");
const middleware = require("../middleware/auth.js");

// Define routes for handling User requests
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  providentController.getAllProvidentFund
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  providentController.createProvidentFund
);

router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  providentController.updateProvidentFund
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin", "companyAdmin"),
  providentController.deleteProvidentFund
);


// router.get("/:id", providentController.getpensionById);

module.exports = router;
