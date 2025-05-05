const express = require("express");
const userController = require("../controllers/userController.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();

router.get(
  "/",
  // middleware.validateUserAgent,
  // middleware.protectAll,
  // middleware.restrictToAll("superAdmin"),

  userController.getAllUser
);
router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  middleware.validateUserAgent,
  userController.getUserById
);
router.post(
  "/",
  middleware.validateUserAgent,
  // middleware.protectAll,
  // middleware.restrictTo("superAdmin"),
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
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  userController.activateUser
);
router.put(
  "/verify-account/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  userController.verifyCompanyAccount
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  middleware.validateUserAgent,
  userController.updateUser
);

router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("superAdmin"),
  middleware.validateUserAgent,
  userController.deleteUser
);
router.put(
  "/taxrules/:taxRuleId",

  middleware.protectAll,
  middleware.restrictToAll("superAdmin")
);

module.exports = router;
