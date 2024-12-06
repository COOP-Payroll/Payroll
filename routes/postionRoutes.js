const express = require("express");
const middleware = require("../middleware/auth");
const Sponsors = require("../controllers/sponsorContollers.js");

const Position = require("../controllers/positionControllers.js");
const router = express.Router();
//
//get all grade of the same company
router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  Position.getAllpositions
);

router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  Position.getOne
);
router.post(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  Position.createPositions
);

router.put(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  Position.updatePosition
);
router.delete(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  Position.deletePosition
);
module.exports = router;
