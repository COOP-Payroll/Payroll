const express = require("express");
const projects=require("../controllers/projectControllers.js");
const middleware=require("../middleware/auth.js")
const router = express.Router();
router.get(
    "/",
    middleware.protectAll,
    projects.getAllProjects
  );


  router.post(
    "/",
    middleware.protectAll,
    projects.createProjects
  );

  
  router.delete(
    "/:id",
    middleware.protectAll,
    projects.deleteProjects
  );
  router.put(
    "/:id",
    middleware.protectAll,
    projects.updateProjects
  );
module.exports=router;