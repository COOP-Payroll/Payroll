import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import positionService from "../services/position.service";

const createPosition = catchAsync(async (req: Request, res: Response) => {
  const position = await positionService.createPosition(req.body);
  res
    .status(httpStatus.CREATED)
    .send({ message: "Position created", data: position });
});

const getAllPositions = catchAsync(async (_req: Request, res: Response) => {
  const positions = await positionService.getAllPositions();
  res.send({ data: positions });
});

const getPositionById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const position = await positionService.getPositionById(id);

  if (!position) {
    res.status(httpStatus.NOT_FOUND).send({ message: "Position not found" });
    return;
  }

  res.send({ data: position });
});

const updatePosition = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const position = await positionService.updatePosition(id, req.body);
  res.send({ message: "Position updated", position });
});

const deletePosition = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updated = await positionService.deletePosition(id);
  res
    .status(httpStatus.OK)
    .send({ message: "Position deactivated", data: updated });
});

export default {
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  deletePosition,
};
