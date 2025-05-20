
import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import campaignParticipantService from "../services/campaignparticipant.service";
import prisma from "../client";
import path from "path";
import mime from "mime-types";

const registerCampaignParticipant = catchAsync(
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

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
      companyId,
      detail,
    } = req.body;

    const data = await campaignParticipantService.registerCampaignParticipant({
    //   files,
      campaignId,
      numberOfDaysInUrban: Number(numberOfDaysInUrban),
      numberOfDaysInRural: Number(numberOfDaysInRural),
      fullName,
      gender,
      address,
      phoneNumber,
      accountNumber,
      paymentMethod,
      companyId,
      detail,
      
    });

    res.status(httpStatus.CREATED).json({
      message: "Campaign participant registered successfully",
      data,
    });
  }
);

// const getParticipantsByCampaignId = catchAsync(async (req: Request, res: Response) => {
//   const { campaignId } = req.params;
//   const participants = await campaignParticipantService.getParticipantsByCampaignId(campaignId);
//   res.status(httpStatus.OK).json({ data: participants });
// });

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
};
