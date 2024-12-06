const express = require("express");
const userController = require("../controllers/userController.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();

router.get("/", middleware.validateUserAgent, 
  
  
  userController.getAllUser);
router.get("/:id", middleware.validateUserAgent, userController.getUserById);
router.post(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictTo("superAdmin"),
  userController.createUser
);

router.put(
  "/CompanyStatus/update",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),

  userController.updateCompanyStatus1
);

router.put(
  "/change-status",
  middleware.validateUserAgent,
  userController.activateUser
);
router.put(
  "/verify-account/:id",
  middleware.validateUserAgent,
  userController.verifyCompanyAccount
);
router.put("/:id", middleware.validateUserAgent, userController.updateUser);

router.delete("/:id", middleware.validateUserAgent, userController.deleteUser);
router.put("/taxrules/:taxRuleId");

module.exports = router;
