const express = require("express");
const middleware = require("../middleware/auth");
const Sponsors=require("../controllers/sponsorContollers.js")

const Position=require("../controllers/positionControllers.js");
const router = express.Router();
//
//get all grade of the same company
router.get(
  "/",
  middleware.protectAll,
  Position.getAllpositions

);

router.get(
  "/:id",
  middleware.protectAll,
  Position.getOne

);
router.post("/", middleware.protectAll,Position.createPositions)

router.put("/:id", middleware.protectAll,Position.updatePosition);
router.delete("/:id",middleware.protectAll,Position.deletePosition)
module.exports = router;
