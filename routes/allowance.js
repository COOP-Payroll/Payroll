const express = require("express");
const allowance = require("../controllers/allowance");
const middleware=require("../middleware/auth.js")
const router = express.Router();

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  allowance.getAllAllowance
);
router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  allowance.getAllowanceById
);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  allowance.createAllowance
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  allowance.updateAllowance
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  allowance.deleteAllowance
);

module.exports = router;