const express = require("express");
const payroll = require("../controllers/payrollController");
const middleware = require("../middleware/auth");
const router = express.Router();

router.get("/", payroll.getAllPayrollByCompanyId);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAdmin("companyAdmin"),
  payroll.createPayroll
);

module.exports = router;
