const express = require("express");
const projects=require("../controllers/projectControllers.js");
const middleware=require("../middleware/auth.js")
const router = express.Router();
router.get(
    "/",
    middleware.protectAll,
    projects.getAllProjects
  );

module.exports=router;