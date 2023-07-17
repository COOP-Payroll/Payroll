const express = require("express");
const moduleController = require("../controllers/moduleControllers.js");
const middleware = require("../middleware/auth");
const router = express.Router();
//
//get all module of the same company
router.get(
  "/",
  middleware.protectAll,
  //   middleware.restrictALL({ moduleName: "module", isAccessible: true }),
  // middleware.checkPermissions({ name: 'payroll', value:'approve' }),
  moduleController.getAllModules
);

//get specific module of company
router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
moduleController.getAllowanceById
);

// //add module of company
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
 moduleController.createModules
);


// //update module of company
// router.put(
//   "/:id",
//   middleware.protectAll,
//   middleware.restrictToAll("companyAdmin"),
//   module.updatemodule
// );

// //delete module of company
// router.delete(
//   "/:id",

//   middleware.protectAll,
//   middleware.restrictToAll("companyAdmin"),

//   module.deletemodule
// );

module.exports = router;
