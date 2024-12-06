const express = require("express");
const projects = require("../controllers/projectControllers.js");
const middleware = require("../middleware/auth.js");
const upload = require("../middleware/multer");
const router = express.Router();
router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  projects.getAllProjects
);

router.get(
  "/total-percent-assigned/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  projects.getTotalAssignedForEmployee
);

router.get(
  "/available-projects/:positionId/:employeeId",
  middleware.validateUserAgent,
  middleware.protectAll,
  projects.getAllUnassignedProjectForEmployee
  //getUnassignedProjects
);

router.get(
  "/getprojects/:employeeId",
  middleware.validateUserAgent,
  middleware.protectAll,
  projects.getAllProjectUnderTheEmployee
);
router.get(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  projects.getOneProject
);

router.get(
  "/employee-previous-projects/:projectId/:employeeId",
  middleware.protectAll,
  middleware.validateUserAgent,
  projects.getPreviousProject
);

router.get(
  "/employee/:projectId",
  middleware.validateUserAgent,
  middleware.protectAll,
  projects.getAllEmployeeUnderTheSameProject
);
router.post(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,

  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "referenceLetter", maxCount: 1 },
  ]),
  projects.createProjects
);

router.delete("/:id", middleware.protectAll, projects.deleteProjects);

router.put(
  "/unassign-employee",
  middleware.protectAll,
  projects.deSelectEmployeeFromProject
);
router.put(
  "/unassign",
  middleware.protectAll,
  projects.deassignPositionFromProject
);
router.put(
  "/assign-to-employee",
  middleware.protectAll,
  projects.assignProjectToEmployee
);
router.put(
  "/assign-position",
  middleware.protectAll,
  projects.assignPositionToProject
);
router.put(
  "/update-employee-association",

  middleware.protectAll,
  projects.updateProjectEmployeeAssocitation
);

router.put("/:id", middleware.protectAll, projects.updateProjects);

module.exports = router;
