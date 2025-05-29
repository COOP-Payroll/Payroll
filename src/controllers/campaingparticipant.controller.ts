import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import campaignParticipantService from "../services/campaignparticipant.service";
import { AuthUser } from "../types/express";
import ExcelJS from "exceljs";
import ApiError from "../utils/api-error";

import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

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
      isVerified,

      detail,
    } = req.body;
    console.log("dafhdjsfhdhdjhd");

    if (!campaignId || typeof campaignId !== "string") {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid campaignId");
    }
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
      isVerified,
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
    const user = req.user as AuthUser;
    const companyId = user.companyId;
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
  async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string;

    if (!campaignId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "campaignId query parameter is required",
      });
    }

    const campaigns = await campaignParticipantService.getAllPublishedCampaigns(
      campaignId
    );
    res.status(httpStatus.OK).json({ data: campaigns });
  }
);

const getAllApprovedCampaigns = catchAsync(
  async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string;

    if (!campaignId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "campaignId query parameter is required",
      });
    }

    const campaigns = await campaignParticipantService.getAllApprovedCampaigns(
      campaignId
    );
    res.status(httpStatus.OK).json({ data: campaigns });
  }
);

const getUnassignedParticipants = catchAsync(
  async (req: Request, res: Response) => {
    const campaignId = req.query.campaignId as string;

    if (!campaignId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "campaignId query parameter is required",
      });
    }

    const participants =
      await campaignParticipantService.getUnassignedParticipants(campaignId);
    res.status(httpStatus.OK).json({ data: participants });
  }
);

export const downloadParticipantTemplate = async (
  req: Request,
  res: Response
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Campaign Participants");

  // Define column headers
  worksheet.columns = [
    { header: "Full Name", key: "fullName", width: 40 },
    { header: "Gender", key: "gender", width: 20 },
    { header: "Address", key: "address", width: 40 },
    { header: "Phone Number", key: "phoneNumber", width: 35 },
    { header: "Account Number", key: "accountNumber", width: 35 },
    { header: "Payment Method", key: "paymentMethod", width: 30 },
    {
      header: "Number of Days in Urban",
      key: "numberOfDaysInUrban",
      width: 35,
    },
    {
      header: "Number of Days in Rural",
      key: "numberOfDaysInRural",
      width: 35,
    },
    { header: "Detail", key: "detail", width: 40 },
  ];

  // Bold and center header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = {
    name: "Calibri",
    size: 12,
    bold: true,
    color: { argb: "FFFFFFFF" }, // white text
  };
  headerRow.alignment = { horizontal: "center" };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF305496" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Create dropdowns for Gender (B column) and PaymentMethod (F column)
  for (let i = 2; i <= 100; i++) {
    worksheet.getCell(`B${i}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"MALE,FEMALE"'],
      showErrorMessage: true,
      errorStyle: "error",
      errorTitle: "Invalid Gender",
      error: "Please select either MALE or FEMALE from the dropdown.",
    };

    worksheet.getCell(`F${i}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"PHONENUMBER,ACCOUNTNUMBER"'],
      showErrorMessage: true,
      errorStyle: "error",
      errorTitle: "Invalid Payment Method",
      error:
        "Please select either PHONENUMBER or ACCOUNTNUMBER from the dropdown.",
    };
  }

  // Set headers for download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="campaign-participants-template.xlsx"'
  );

  await workbook.xlsx.write(res);
  res.end();
};

export const registerBulkCampaignParticipants = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;

    if (!user?.companyId) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    const campaignId = req.params.id;
    if (!campaignId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Campaign ID is required");
    }

    const file = req.file;
    if (!file) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No Excel file uploaded");
    }

    const filePath = path.resolve(file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // const participants: any[] = XLSX.utils.sheet_to_json(sheet);
    const rawParticipants: any[] = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
    });
    const participants = rawParticipants.map((row, index) => ({
      fullName: row["Full Name"]?.toString().trim(),
      gender: row["Gender"]?.toString().trim().toUpperCase(),
      address: row["Address"]?.toString().trim(),
      phoneNumber: row["Phone Number"]?.toString().trim(),
      accountNumber: row["Account Number"]?.toString().trim(),
      paymentMethod: row["Payment Method"]?.toString().trim().toUpperCase(),
      numberOfDaysInUrban: row["Number of Days in Urban"],
      numberOfDaysInRural: row["Number of Days in Rural"],
      detail: row["Detail"]?.toString().trim() || "",
    }));
    if (!participants.length) {
      fs.unlinkSync(filePath);
      throw new ApiError(httpStatus.BAD_REQUEST, "Excel file is empty");
    }

    const requiredFields = [
      "fullName",
      "gender",
      "address",
      "phoneNumber",
      "accountNumber",
      "paymentMethod",
      "numberOfDaysInUrban",
      "numberOfDaysInRural",
    ];

    const result =
      await campaignParticipantService.registerBulkCampaignParticipants({
        participants: participants.map((p) => ({ ...p })),
        companyId: user.companyId,
        campaignId,
      });

    fs.unlinkSync(filePath); // Cleanup file

    res.status(httpStatus.CREATED).json({
      message: "Participants registered successfully",
      count: result.length,
      data: result,
    });
  }
);

const updateAccountVerification = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const { isVerified } = req.body;

    const account = await campaignParticipantService.updateAccountVerification(
      req.params.id,
      user.companyId,
      isVerified
    );

    res.status(httpStatus.OK).json({
      message: "Account verification status updated successfully",
      data: account,
    });
  }
);
export default {
  registerCampaignParticipant,
  downloadParticipantTemplate,
  getParticipantsByCampaignId,
  getAllPublishedCampaigns,
  getAllApprovedCampaigns,
  updateCampaignParticipant,
  registerBulkCampaignParticipants,
  updateAccountVerification,
  getUnassignedParticipants,
};
