const express = require("express");
const projects=require("../controllers/projectControllers.js");
const middleware=require("../middleware/auth.js")
const router = express.Router();
router.get(
    "/",
    middleware.protectAll,
    projects.getAllProjects
  );

  router.get(
    "/:id",
    middleware.protectAll,
    projects.getOneProject
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
  router.put("/unassign",
  middleware.protectAll,
  projects.deassignPositionFromProject)
  router.put("/assign-to-employee",
  middleware.protectAll,
  projects.assignProjectToEmployee
  )
  router.put(
    "/assign-position",
    middleware.protectAll,
    projects.assignPositionToProject
  );
  router.put(
    "/:id",
    middleware.protectAll,
    projects.updateProjects
  );

  
module.exports=router;