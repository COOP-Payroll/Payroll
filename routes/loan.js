const express = require("express");
const loanControllers = require("../controllers/loan.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),

  loanControllers.getAllLoan
);

router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),

  loanControllers.getAllowanceById
);
// router.get("/:id", allowance.getAllowanceById);
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  loanControllers.createLoan
);
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  loanControllers.updateLoan
);
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.restrictALL({ moduleName: "generalsetup", isAccessible: true }),
  loanControllers.deleteLoan
);

module.exports = router;
