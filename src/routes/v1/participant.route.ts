import express from "express";
import participantController from "../../controllers/participant.controller";
import participantValidation from "../../validations/participant.validation";
import validate from "../../middlewares/validate";
import auth from "../../middlewares/auth";
const router = express.Router();

router.post(
  "/",
  auth(),
  validate(participantValidation.createParticipant),
  participantController.createParticipant
);

router.get("/", participantController.getAllParticipants);

router
  .route("/:id")
  .get(participantController.getParticipantById)
  .post(validate(participantValidation.updateParticipant), participantController.updateParticipant)
  .delete(participantController.deleteParticipant);

export default router;
