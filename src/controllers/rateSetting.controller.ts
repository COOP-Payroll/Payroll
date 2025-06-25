import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import rateSettingService from "../services/rateSetting.service";
import { AuthUser } from "../types/express";

const createRateSetting = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const rateSetting = await rateSettingService.createRateSetting(
    req.body,
    user.companyId
  );
  res
    .status(httpStatus.CREATED)
    .send({ message: "RateSetting created", data: rateSetting });
});

const getAllRateSettings = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const settings = await rateSettingService.getAllRateSettings(user.companyId);
  res.send({ data: settings });
});
  
const updateRateSetting = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const { id } = req.params;

  const updated = await rateSettingService.updateRateSetting(
    user.companyId,
    id,
    req.body
  );

  res.send({ message: "RateSetting updated", data: updated });
});


const deleteRateSetting = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const { id } = req.params;

  const updated = await rateSettingService.deleteRateSetting(
    user.companyId,
    id,
  
  );

  res.send({ message: "RateSetting updated", data: updated });
});
export default {
  createRateSetting,
  getAllRateSettings,
  updateRateSetting,
  deleteRateSetting,
};
