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

const getRateSettingByCompanyId = catchAsync(
  async (req: Request, res: Response) => {
    const { companyId } = req.params;
    const setting = await rateSettingService.getRateSettingByCompanyId(
      companyId
    );
    if (!setting) {
      res
        .status(httpStatus.NOT_FOUND)
        .send({ message: "RateSetting not found" });
      return;
    }
    res.send({ data: setting });
  }
);

const updateRateSetting = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const updated = await rateSettingService.updateRateSetting(
    user.companyId,
    req.body
  );
  res.send({ message: "RateSetting updated", data: updated });
});

export default {
  createRateSetting,
  getAllRateSettings,
  getRateSettingByCompanyId,
  updateRateSetting,
};
