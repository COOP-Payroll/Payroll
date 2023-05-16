const express = require("express");
const userController = require("../controllers/userController.js");

const router = express.Router();

router.get("/", userController.getAllUser);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.put("/CompanyStatus/update", userController.updateCompanyStatus);
router.delete("/:id", userController.deleteUser);
router.put("/taxrules/:taxRuleId");

module.exports = router;
