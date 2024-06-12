const express = require("express");
const middleware = require("../middleware/auth");
const serviceController= require("../controllers/services.js")
const router = express.Router();
//
//get all grade of the same company
router.get(
  "/",
  middleware.protectAll,
  serviceController.getAllServices

);

router.get(
  "/:id",
  middleware.protectAll,
  serviceController.getServicesById

);
router.post("/", 
middleware.protectAll,
serviceController.createServices

)

router.put("/:id", middleware.protectAll,
serviceController.updateServices
);
router.delete("/:id",middleware.protectAll,
    
serviceController.deleteServices
)
module.exports = router;
