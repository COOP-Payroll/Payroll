const express = require("express");
const deductionDefinition = require("../controllers/deductionDefintion");

const router = express.Router();

router.get("/:companyId", deductionDefinition.getAllDeductionDefinition);
router.get("/:companyId/:id", deductionDefinition.getDeductionDefinitionById);
router.post("/:companyId", deductionDefinition.createDeductionDefinition);
router.put("/:companyId/:id", deductionDefinition.updateDeductionDefinition);
router.delete("/:companyId/:id", deductionDefinition.deleteDeductionDefinition);

module.exports = router;