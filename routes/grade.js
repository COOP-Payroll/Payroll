const express = require("express");
const grade = require("../controllers/grade");
const middleware = require("../middleware/auth");

const router = express.Router();
//
//get all grade of the same company
router.get(
  "/",
  middleware.protectAll,
  middleware.restrictALL({ moduleName:"deduction", permissionType:"read" }),
  // middleware.checkPermissions({ name: 'payroll', value:'approve' }),
  grade.getAllGrade
);

//get specific grade of company
router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  grade.getGradeById
);

//add grade of company
router.post(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  grade.createGrade
);

//update grade of company
router.put(
  "/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  grade.updateGrade
);

//delete grade of company
router.delete(
  "/:id",

  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),

  grade.deleteGrade
);

module.exports = router;
