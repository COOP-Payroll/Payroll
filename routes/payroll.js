const express = require("express");
const payroll = require("../controllers/payrollController");

const router = express.Router();

router.get("/", payroll.getAllPayrollByCompanyId);
router.post("/", payroll.createPayroll);

module.exports = router;
