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
    "/total-percent-assigned/:id",
    middleware.protectAll,
    projects.getTotalAssignedForEmployee
  );

  router.get(
    "/available-projects/:positionId/:employeeId",
    middleware.protectAll,
    projects.getAllUnassignedProjectForEmployee
    //getUnassignedProjects
  );

  router.get(
    "/getprojects/:employeeId",
    middleware.protectAll,
    projects.getAllProjectUnderTheEmployee
  );
  router.get(
    "/:id",
    middleware.protectAll,
    projects.getOneProject
  );

  router.get(
    "/employee-previous-projects/:projectId/:employeeId",
    middleware.protectAll,
    projects.getPreviousProject
  );


  router.get(
    "/employee/:projectId",
    middleware.protectAll,
    projects.getAllEmployeeUnderTheSameProject
  )
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

  router.put("/unassign-employee",
  middleware.protectAll,
  projects.deSelectEmployeeFromProject)
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
  router.put("/update-employee-association",
  
  middleware.protectAll,
  projects.updateProjectEmployeeAssocitation
  )

  router.put(
    "/:id",
    middleware.protectAll,
    projects.updateProjects
  );


  
module.exports=router;