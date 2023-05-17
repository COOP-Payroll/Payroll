const express = require("express");
const grade = require("../controllers/grade");
const middleware=require('../middleware/auth')

const router = express.Router();
//
//get all grade of the same company 
router.get("/", 
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
grade.getAllGrade);

//get specific grade of company
router.get("/:id", grade.getGradeById);

//add grade of company  
router.post("/",
middleware.protectAll,
middleware.restrictTo('companyAdmin'),
grade.createGrade);

//update grade of company 
router.put("/:id", 
grade.updateGrade);

//delete grade of company 
router.delete("/:id", grade.deleteGrade);

module.exports = router;
