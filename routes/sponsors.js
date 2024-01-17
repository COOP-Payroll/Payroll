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

router.get(
  "/:id",
  middleware.protectAll,
    Sponsors.getOneSponsors

);
router.post("/", middleware.protectAll,Sponsors.createSponsors)

router.put("/:id", middleware.protectAll,Sponsors.updateSponsor);
router.delete("/:id",middleware.protectAll,Sponsors.deleteSponsor)
module.exports = router;
