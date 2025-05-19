import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import participantService from "../services/participant.service";

const createParticipant = catchAsync(async (req: Request, res: Response) => {
  const participant = await participantService.createParticipant(req.body);
  res
    .status(httpStatus.CREATED)
    .send({ message: "Participant created", data: participant });
});

const getAllParticipants = catchAsync(async (_req: Request, res: Response) => {
  const participants = await participantService.getAllParticipants();
  res.send({ data: participants });
});

const getParticipantById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const participant = await participantService.getParticipantById(id);

  if (!participant) {
    res.status(httpStatus.NOT_FOUND).send({ message: "Participant not found" });
    return;
  }

  res.send({ data: participant });
  return;
});

const updateParticipant = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updated = await participantService.updateParticipant(id, req.body);
  res.send({ message: "Participant updated", data: updated });
});

const deleteParticipant = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updated = await participantService.deleteParticipant(id);
  res
    .status(httpStatus.OK)
    .send({ message: "Participant deactivated", data: updated });
});

export default {
  createParticipant,
  getAllParticipants,
  getParticipantById,
  updateParticipant,
  deleteParticipant,
};
