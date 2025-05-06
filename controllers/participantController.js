// const { CampaignParticipant, Campaign, Employee } = require("../models");
const CampaignParticipant = require("../models/campaignParticipant");
const Campaign = require("../models/campaigns");
const ExcelJS = require("exceljs");
const fs = require("fs");
const createError = require("../utils/error");
const Company = require("../models/company");
const Region = require("../models/region");
const Participant = require("../models/participants");

exports.createParticipant = async (req, res) => {
  try {
    const {
      fullName,
      sex,
      amount,
      age,
      nationalId,
      address,
      // amount,
      email,
      phoneNumber,
      accountNumber,
      paymentMethod,
      detail,
    } = req.body;
    // return res.json("CompanyId")
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    // Fetch the company to get region/zone/woreda
    const company = await Company.findByPk(CompanyId);

    const companyRegionId = company?.regionId;
    const companyZoneId = company?.zoneId;
    const companyWoredaId = company?.woredaId;
    // Create the participant using all relevant fields
    const participant = await Participant.create({
      fullName,
      sex,
      amount,
      age,
      nationalId,
      address,
      email,
      phoneNumber,
      accountNumber,
      paymentMethod,
      detail,
      regionId: companyRegionId,
      zoneId: companyZoneId,
      woredaId: companyWoredaId,
    });

    // Return the newly created participant
    res.status(201).json({ message: "Registered Successfully" });
  } catch (error) {
    console.error("Error creating participant:", error);
    res.status(500).json({ message: "Failed to create participant" });
  }
};

exports.downloadExcel = async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();

    // Main worksheet
    const worksheet = workbook.addWorksheet("Campaign Participants");

    // Define columns
    worksheet.columns = [
      { header: "Full Name", key: "fullName", width: 40 },
      { header: "SEX", key: "sex", width: 23 },
      { header: "Amount", key: "amount", width: 20 },
      { header: "Age", key: "age", width: 12 },
      { header: "Address", key: "address", width: 31 },
      { header: "Email", key: "email", width: 30 },
      { header: "Payment Method", key: "paymentMethod", width: 22 },
      { header: "Phone Number", key: "phoneNumber", width: 22 },
      { header: "Account Number", key: "accountNumber", width: 25 },
      { header: "Description", key: "description", width: 40 },
    ];

    // Create hidden sheet for dropdown options
    const optionsSheet = workbook.addWorksheet("Options", { state: "hidden" });

    // Define dropdown lists
    const SEX_LIST = ["Male", "Female"];
    const PAYMENT_METHOD_LIST = ["PHONENUMBER", "ACCOUNTNUMBER"];

    // Fill options into hidden sheet
    SEX_LIST.forEach((item, index) => {
      optionsSheet.getCell(`A${index + 1}`).value = item;
    });

    PAYMENT_METHOD_LIST.forEach((item, index) => {
      optionsSheet.getCell(`B${index + 1}`).value = item;
    });

    // Add data validation for SEX (column B)
    for (let row = 2; row <= 1000; row++) {
      worksheet.getCell(`B${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ["=Options!$A$1:$A$2"],
        showErrorMessage: true,
        errorStyle: "error",
        errorTitle: "Invalid Input",
        error: "Select Male or Female.",
      };

      // Payment Method validation (column G)
      worksheet.getCell(`G${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ["=Options!$B$1:$B$2"],
        showErrorMessage: true,
        errorStyle: "error",
        errorTitle: "Invalid Input",
        error: "Select a valid payment method.",
      };
    }

    // Set headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=campaign_participants_template.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong while generating the Excel file.",
    });
  }
};
exports.bulkRegisterFromExcel = async (req, res, next) => {
  try {
    const excelFile = req?.files?.["file"]?.[0]?.path;
    const CampaignId = req.body.CampaignId;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    // Fetch the company to get region/zone/woreda
    const company = await Company.findByPk(CompanyId);

    const companyRegionId = company?.regionId;
    const companyZoneId = company?.zoneId;
    const companyWoredaId = company?.woredaId;
    // return res.json(CampaignId);

    if (!excelFile) {
      return next(createError.createError(404, "Please upload the file"));
    }

    // const compaignData = await Campaign.findOne({ where: { id: CampaignId } });
    // // return res.json(compaignData);

    // if (!compaignData) {
    //   return next(createError.createError(404, "Campaign not found"));
    // }
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFile);

    const worksheet = workbook.getWorksheet("Campaign Participants");
    const rows = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const [
        fullName,
        sex,
        amount,
        age,
        address,
        email,
        paymentMethod,
        phoneNumber,
        accountNumber,
        description,
      ] = row.values.slice(1); // Skip first empty cell

      rows.push({
        fullName: fullName?.toString().trim(),
        sex: sex?.toString().trim(),
        amount: parseFloat(amount),
        age: parseInt(age),
        address: address?.toString().trim(),
        email: email?.toString().trim(),
        paymentMethod: paymentMethod?.toString().trim().toLowerCase(),
        phoneNumber: phoneNumber?.toString().trim(),
        accountNumber: accountNumber?.toString().trim(),
        detail: description?.toString().trim(),
      });
    });

    const participants = [];

    for (const row of rows) {
      const {
        fullName,
        sex,
        amount,
        age,
        address,
        email,
        paymentMethod,
        phoneNumber,
        accountNumber,
        detail,
      } = row;
      //   return res.json(paymentMethod.toUpperCase());
      // Required fields
      if (!fullName || !sex || !paymentMethod) {
        return next(
          createError.createError(
            400,
            "Full name, sex, and payment method are required."
          )
        );
      }

      // Validate payment method
      if (paymentMethod.toUpperCase() === "PHONENUMBER") {
        if (!phoneNumber) {
          return next(
            createError.createError(
              400,
              "Phone number is required when payment method is 'phone'."
            )
          );
        }
      } else if (paymentMethod.toUpperCase() === "ACCOUNTNUMBER") {
        if (!accountNumber) {
          return next(
            createError.createError(
              400,
              "Account number is required when payment method is 'account'."
            )
          );
        }
      } else {
        return next(
          createError.createError(
            400,
            "Invalid payment method. Must be either 'phone' or 'account'."
          )
        );
      }

      // Optional email uniqueness check (uncomment if needed)
      // const existingEmail = await CampaignParticipant.findOne({ where: { email } });
      // if (existingEmail) {
      //   return next(createError.createError(400, `Email '${email}' is already registered.`));
      // }

      participants.push({
        fullName,
        sex: sex.toUpperCase(),
        amount,
        age,
        address,
        email,
        paymentMethod: paymentMethod.toUpperCase(),
        phoneNumber,
        accountNumber: accountNumber,
        detail,
        // CampaignId,
        regionId: companyRegionId,
        zoneId: companyZoneId,
        woredaId: companyWoredaId,
      });
    }

    await Participant.bulkCreate(participants, { validate: true });
    fs.unlinkSync(excelFile);

    res.status(200).json({
      message: `${participants.length} participants registered successfully.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing the Excel file." });
  }
};

exports.getAllParticipants = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const company = await Company.findByPk(CompanyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const { regionId, zoneId, woredaId } = company;

    // Start building dynamic where clause
    const whereClause = {
      regionId,
      // CampaignId: campaignId,
      isActive: true,
    };

    // Only add zoneId if it's not null
    if (zoneId !== null) {
      whereClause.zoneId = zoneId;
    }

    // Only add woredaId if it's not null
    if (woredaId !== null) {
      whereClause.woredaId = woredaId;
    }

    const participants = await Participant.findAll({
      // include: [Campaign, Region],
      where: whereClause,
    });

    res.status(200).json({ data: participants });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ message: "Failed to fetch participants" });
  }
};

exports.getParticipantById = async (req, res) => {
  try {
    const { id } = req.params;

    const participant = await Participant.findByPk(id, {
      // include: [Campaign],
    });

    if (!participant)
      return res.status(404).json({ message: "Participant not found" });

    res.status(200).json({ data: participant });
  } catch (error) {
    console.error("Error fetching participant:", error);
    res.status(500).json({ message: "Failed to fetch participant" });
  }
};

exports.updateParticipant = async (req, res) => {
  try {
    const { participantId } = req.query;

    if (!participantId) {
      return res.status(400).json({ message: "Missing  participantId" });
    }

    // 1. Check if campaign exists
    const campaign = await Participant.findOne({
      where: { id: participantId },
    });
    if (!campaign) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // 2. Prepare fields to update
    const allowedFields = [
      "fullName",
      "sex",
      "amount",
      "age",
      "nationalId",
      "address",
      "email",
      "phoneNumber",
      "accountNumber",
      "paymentMethod",
      "detail",
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (req.body.hasOwnProperty(key)) {
        updateData[key] = req.body[key];
      }
    }

    // 3. Update the specific participant within the campaign
    const [updatedCount] = await Participant.update(updateData, {
      where: {
        id: participantId,
        // CampaignId: campaignId,
      },
    });

    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ message: "Participant not found for this campaign" });
    }

    res.status(200).json({ message: "Participant updated successfully" });
  } catch (error) {
    console.error("Error updating participant:", error);
    res.status(500).json({ message: "Failed to update participant" });
  }
};

exports.verifyParticipant = async (req, res) => {
  try {
    const { participantId } = req.query;

    if (!participantId) {
      return res.status(400).json({ message: "Missing  participantId" });
    }

    // 1. Check if campaign exists
    const campaign = await Participant.findByPk(participantId);
    if (!campaign) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // 2. Fetch the participant first to access phoneNumber and paymentMethod
    const participant = await Participant.findOne({
      where: {
        id: participantId,
        // CampaignId: campaignId,
      },
    });

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    if (participant?.isVerified) {
      return res.status(400).json({ message: "Already verified" });
    }
    // return res.json(participant);
    // 3. Validate phoneNumber if paymentMethod is PHONENUMBER
    if (
      participant.paymentMethod === "PHONENUMBER" &&
      (!participant.phoneNumber || participant.phoneNumber.length !== 10)
    ) {
      return res.status(400).json({
        message:
          "Phone number must be exactly 10 digits when using PHONENUMBER as payment method",
      });
    }

    // 4. Update isVerified to true
    const [updatedCount] = await Participant.update(
      { isVerified: true },
      {
        where: {
          id: participantId,
          // CampaignId: campaignId,
        },
      }
    );

    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ message: "Participant not found for this campaign" });
    }

    res.status(200).json({ message: "Participant verified successfully" });
  } catch (error) {
    console.error("Error verifying participant:", error);
    res.status(500).json({ message: "Failed to verify participant" });
  }
};

exports.deleteParticipant = async (req, res) => {
  try {
    const { participantId, campaignId } = req.query;

    if (!participantId || !campaignId) {
      return res
        .status(400)
        .json({ message: "Missing campaignId or participantId" });
    }

    const participant = await CampaignParticipant.findOne({
      where: { id: participantId, CampaignId: campaignId },
    });

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Soft delete by setting isActive to false
    participant.isActive = false;
    await participant.save();

    res.status(200).json({ message: "Participant deleted successfully" });
  } catch (error) {
    console.error("Error deleting participant:", error);
    res.status(500).json({ message: "Failed to delete participant" });
  }
};
