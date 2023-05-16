const express = require("express");
const approvalMethod = require("../controllers/approvalMethod")

const router = express.Router();

router.get("/:CompanyId/", approvalMethod.getAllApprovalMethod);
router.post("/:CompanyId/", approvalMethod.createApprovalMethod);
router.put("/:id", approvalMethod.updateApprovalMethod)
router.delete("/:id",approvalMethod.deleteApprovalMethod)
module.exports = router;
