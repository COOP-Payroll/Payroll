import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import rateSettingService from "../services/rateSetting.service";

const createRateSetting = catchAsync(async (req: Request, res: Response) => {
  const rateSetting = await rateSettingService.createRateSetting(req.body);
  res
    .status(httpStatus.CREATED)
    .send({ message: "RateSetting created", data: rateSetting });
});

const getAllRateSettings = catchAsync(async (_req: Request, res: Response) => {
  const settings = await rateSettingService.getAllRateSettings();
  res.send({ data: settings });
});

const getRateSettingByCompanyId = catchAsync(async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const setting = await rateSettingService.getRateSettingByCompanyId(companyId);
  if (!setting) {
    res.status(httpStatus.NOT_FOUND).send({ message: "RateSetting not found" });
    return;
  }
  res.send({ data: setting });
});

const updateRateSetting = catchAsync(async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const updated = await rateSettingService.updateRateSetting(companyId, req.body);
  res.send({ message: "RateSetting updated", data: updated });
});

export default {
  createRateSetting,
  getAllRateSettings,
  getRateSettingByCompanyId,
  updateRateSetting,
};
