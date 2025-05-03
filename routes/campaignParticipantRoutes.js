const express = require("express");
const router = express.Router();
const campaignParticipantController = require("../controllers/campaignParticipantController");

router.post("/", campaignParticipantController.createParticipant);
router.get("/", campaignParticipantController.getAllParticipants);
router.get("/:id", campaignParticipantController.getParticipantById);
router.put("/:id", campaignParticipantController.updateParticipant);
router.delete("/:id", campaignParticipantController.deleteParticipant); // sets isActive = false

module.exports = router;
