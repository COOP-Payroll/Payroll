const express = require("express");
const allowance = require("../controllers/allowance");

const router = express.Router();

router.get("/", allowance.getAllAllowance);
router.get("/:id", allowance.getAllowanceById);
router.post("/", allowance.createAllowance);
router.put("/:id", allowance.updateAllowance);
router.delete("/:id", allowance.deleteAllowance);

module.exports = router;