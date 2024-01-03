const express = require("express");
const middleware = require("../middleware/auth");
const Sponsors=require("../controllers/sponsorContollers.js")
const router = express.Router();
//
//get all grade of the same company
router.get(
  "/",
  middleware.protectAll,
    Sponsors.getAllSponsors

);
router.post("/", middleware.protectAll,Sponsors.createSponsors)


module.exports = router;
