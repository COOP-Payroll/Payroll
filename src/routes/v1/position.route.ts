import express from "express";
import positionController from "../../controllers/position.controller";
import validate from "../../middlewares/validate";
import positionValidation from "../../validations/position.validation";

const router = express.Router();

router
  .route("/")
  .post(
    validate(positionValidation.createPosition),
    positionController.createPosition
  )
  .get(positionController.getAllPositions);

router
  .route("/:id")
  .get(positionController.getPositionById)
  .post(
    validate(positionValidation.updatePosition),
    positionController.updatePosition
  )
  .delete(positionController.deletePosition);

export default router;
