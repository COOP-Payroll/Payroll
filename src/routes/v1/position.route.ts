import express from 'express';
import positionController from '../../controllers/position.controller';

const router = express.Router();

router
  .route('/')
  .post(positionController.createPosition)
  .get(positionController.getAllPositions);

router
  .route('/:id')
  .get(positionController.getPositionById)
  .post(positionController.updatePosition)
  .delete(positionController.deletePosition);

export default router;
