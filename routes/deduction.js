const express = require("express");
const deduction = require("../controllers/deduction");

const router = express.Router();
const middleware=require('../middleware/auth.js')
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),

  deduction.getAllDeduction
);
router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  deduction.getDeductionById
);
router.post(
  "/",

  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  deduction.createDeduction
);
router.put("/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
deduction.updateDeduction);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  deduction.deleteDeduction
);


module.exports = router;
