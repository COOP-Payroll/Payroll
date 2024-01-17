const express = require("express");
const router = express.Router();
const payrollApprovement = require("../controllers/payrollApprovement");
const middleware = require("../middleware/auth");


router.post(
  "/",
  middleware.protectAll,
  middleware.restrictALL({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),

  payrollApprovement.createPayrollApprovement
);

router.post(
  "/reject",
  middleware.protectAll, 
  middleware.restrictApprover({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  payrollApprovement.rejectPayrollApprovement
);

router.post(
  "/reApprove",
  middleware.protectAll,
  middleware.restrictApprover({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  payrollApprovement.reCreatePayrollApprovement
);

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictApprover({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  payrollApprovement.getAllPayrollApprovements
);

router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
  middleware.restrictALL({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  payrollApprovement.getPayrollApprovementById
);

router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
  middleware.restrictALL({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  payrollApprovement.updatePayrollApprovement
);

router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin", "approver"),
  middleware.restrictALL({
    moduleName: "payrollpublishedreport",
    isAccessible: true,
  }),
  payrollApprovement.deletePayrollApprovement
);

module.exports = router;
