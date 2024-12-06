const express = require("express");
const middleware = require("../middleware/auth");
const router = express.Router();

const reportController = require("../controllers/reportingControllers.js");

router.get(
  "/project-salary-report",
  middleware.validateUserAgent,
  reportController.generateProjectSalaryReport
);
router.get(
  "/payroll-published-report",
  middleware.validateUserAgent,
  middleware.protectAll,
  reportController.getPayrollPublishedReport
);
router.get(
  "/payroll-published-report/pdf",
  middleware.protectAll,
  reportController.downloadExcelReport
);
router.get(
  "/payroll/monthly",
  middleware.validateUserAgent,
  reportController.getPayrollPublishedReportPerMonth
);

router.get(
  "/payroll-published-report-based-on-location",
  middleware.validateUserAgent,
  reportController.getPayrollPublishedReportBasedOnSiteLocation
);

module.exports = router;
