import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import campaignParticipantService from "../services/campaignparticipant.service";
import { AuthUser } from "../types/express";

const registerCampaignParticipant = catchAsync(
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    const user = req.user as AuthUser;
    const {
      campaignId,
      numberOfDaysInUrban,
      numberOfDaysInRural,
      fullName,
      gender,
      address,
      phoneNumber,
      accountNumber,
      paymentMethod,

      detail,
    } = req.body;

    const data = await campaignParticipantService.registerCampaignParticipant({
      campaignId,
      numberOfDaysInUrban: Number(numberOfDaysInUrban),
      numberOfDaysInRural: Number(numberOfDaysInRural),
      fullName,
      gender,
      address,
      phoneNumber,
      accountNumber,
      paymentMethod,
      companyId: user.companyId,
      detail,
      files, 
    });

    res.status(httpStatus.CREATED).json({
      message: "Campaign participant registered successfully",
      data,
    });
  }
);
export const updateCampaignParticipant = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const companyId = "0dad32d2-0633-41d5-8843-c3354645e7d9"; // Replace with actual logic if needed (e.g., from auth)

    const files = req.files as Express.Multer.File[];

    const {
      numberOfDaysInUrban,
      numberOfDaysInRural,
      fullName,
      gender,
      address,
      phoneNumber,
      accountNumber,
      paymentMethod,
      detail,
    } = req.body;

    const parsedNumberOfDaysInUrban = parseInt(numberOfDaysInUrban, 10);
    const parsedNumberOfDaysInRural = parseInt(numberOfDaysInRural, 10);

    if (isNaN(parsedNumberOfDaysInUrban) || isNaN(parsedNumberOfDaysInRural)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Invalid number format for urban or rural days",
      });
    }

    const data = await campaignParticipantService.updateCampaignParticipant(
      id,
      companyId,
      {
        numberOfDaysInUrban: parsedNumberOfDaysInUrban,
        numberOfDaysInRural: parsedNumberOfDaysInRural,
        fullName,
        gender,
        address,
        phoneNumber,
        accountNumber,
        paymentMethod,
        detail,

        files,
      }
    );

    res.status(httpStatus.OK).json({
      message: "Campaign participant updated successfully",
      data,
    });
  }
);

const getParticipantsByCampaignId = catchAsync(
  async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string;

    if (!campaignId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "campaignId query parameter is required",
      });
    }

    const participants =
      await campaignParticipantService.getParticipantsByCampaignId(campaignId);
    res.status(httpStatus.OK).json({ data: participants });
  }
);

const getAllPublishedCampaigns = catchAsync(
  async (_req: Request, res: Response) => {
    const campaigns =
      await campaignParticipantService.getAllPublishedCampaigns();
    res.status(httpStatus.OK).json({ data: campaigns });
  }
);

const getAllApprovedCampaigns = catchAsync(
  async (_req: Request, res: Response) => {
    const campaigns =
      await campaignParticipantService.getAllApprovedCampaigns();
    res.status(httpStatus.OK).json({ data: campaigns });
  }
);

export default {
  registerCampaignParticipant,
  getParticipantsByCampaignId,
  getAllPublishedCampaigns,
  getAllApprovedCampaigns,
  updateCampaignParticipant,
};
