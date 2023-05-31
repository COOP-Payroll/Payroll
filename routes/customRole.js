const express = require("express");
const customRoleControllers = require("../controllers/customRole.js");
const middleware=require('../middleware/auth.js')

const router = express.Router();

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  customRoleControllers.getAllCustomRole
);
// router.get("/:id", CustomRole.getCustomRoleById);
 router.post(
   "/",
   middleware.protectAll,
   middleware.restrictToAll("companyAdmin"),
   customRoleControllers.createCustomRole
 );
router.put(
  "/update/:id",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  customRoleControllers.updateCustomRole
);


router.put(
  "/assignRoleToEmployee",
  middleware.protectAll,
  middleware.restrictToAll("companyAdmin"),
  customRoleControllers.assignToEmployee
);
 router.delete("/:id",
 middleware.protectAll,
 middleware.restrictToAll("companyAdmin"),
 
 customRoleControllers.deleteCustomRole)
module.exports = router;
