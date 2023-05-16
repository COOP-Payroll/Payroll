const express = require("express");
const deduction = require("../controllers/deduction");

const router = express.Router();

router.get("/", deduction.getAllDeduction);
router.get("/:id", deduction.getDeductionById);
router.post("/:gradeId/:definitionId", deduction.createDeduction);
router.put("/:id", deduction.updateDeduction);
router.delete("/:id", deduction.deleteDeduction);

module.exports = router;
