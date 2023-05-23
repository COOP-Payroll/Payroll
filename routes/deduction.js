const express = require("express");
const deduction = require("../controllers/deduction");

const router = express.Router();
const middleware=require('../middleware/auth.js')
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),

  deduction.getAllDeduction
);
router.get("/:id", deduction.getDeductionById);
router.post("/", deduction.createDeduction);
router.put("/:id", deduction.updateDeduction);
router.delete("/:id", deduction.deleteDeduction);

module.exports = router;
