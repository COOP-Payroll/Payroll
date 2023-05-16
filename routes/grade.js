const express = require("express");
const grade = require("../controllers/grade");

const router = express.Router();

router.get("/:companyId", grade.getAllGrade);
router.get("/:companyId/:id", grade.getGradeById);
router.post("/:companyId", grade.createGrade);
router.put("/:companyId/:id", grade.updateGrade);
router.delete("/:companyId/:id", grade.deleteGrade);

module.exports = router;
