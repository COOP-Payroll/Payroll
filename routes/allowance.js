const express = require("express");
const allowance = require("../controllers/allowance");

const router = express.Router();

router.get("/", allowance.getAllowanceById);
router.get("/:id", allowance.getAllAllowance);
router.post("/:gradeId/:deductionDefinitionId", allowance.createAllowance);
router.put("/:id", allowance.updateAllowance);
router.delete("/:id", allowance.deleteAllowance);

module.exports = router;