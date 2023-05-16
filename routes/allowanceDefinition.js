const express = require("express");
const allowanceDefinition = require("../controllers/allowanceDefinition");

const router = express.Router();

router.get("/:companyId", allowanceDefinition.getAllAllowanceDefinition);
router.get("/:companyId/:id", allowanceDefinition.getAllowanceDefinitionById);
router.post("/:companyId", allowanceDefinition.createAllowanceDefinition);
router.put("/:companyId/:id", allowanceDefinition.updateAllowanceDefinition);
router.delete("/:companyId/:id", allowanceDefinition.deleteAllowanceDefinition);

module.exports = router;