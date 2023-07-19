const express = require("express");
const allowance = require("../controllers/additionAllowance.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  allowance.getAllAllowance
);
router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  allowance.getAllowanceById
);
router.post(
  "/",
  
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  allowance.createAllowance
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  allowance.updateAllowance
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  allowance.deleteAllowance
);

module.exports = router;
