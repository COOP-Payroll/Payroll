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


exports.assignParticipants = async (req, res) => {
  const { campaignId } = req.params;
  console.log("campaignID", campaignId)
  const {assignmentsData} = req.body;
  console.log("req", assignmentsData)

  if (!Array.isArray(assignmentsData) || assignmentsData.length === 0) {
    return res.status(400).json({ message: "Request body must be a non-empty array." });
  }

  try { 
    const campaign = Campaign.findByPk(campaignId)
    if(!campaign) return res.status(400).json({message: "Campaign not found"})
    
      const assignments = assignmentsData.map((assignment) => ({
        CampaignId: campaignId,
        ParticipantId: assignment.participantId,
        amount: assignment.amount
      }))
  
      await CampaignParticipant.bulkCreate(assignments, {
        updateOnDuplicate: ["amount", "status", "paymentStatus", "approvalStatus", "isPublished", "isActive"], // for Postgres
      });
  
      res.status(200).json({ message: "Participants assigned successfully" });
    
    // const assignments = assignmentsData.map(
    //   ({
    //     participantId,
    //     amount,
    //     // status,
    //     // paymentStatus,
    //     // approvalStatus,
    //     // isPublished,
    //     // isActive,
    //   }) => ({
    //     CampaignId: campaignId,
    //     ParticipantId: participantId,
    //     amount: amount ?? null,
    //     // status: "INVITED",
    //     // paymentStatus: "PENDING",
    //     // approvalStatus: "PENDING",
    //     // isPublished: false,
    //     // isActive: true,
    //   })
    // );

    // const chunks = chunkArray(assignments, BATCH_SIZE);

    // const results = await Promise.allSettled(
    //   chunks.map((chunk) => bulkInsertWithRetry(chunk))
    // );

    // const failedBatches = results
    // .map((r, i) => (r.status === "fulfilled" && r.value.success ? null : { batch: i + 1, error: r.value?.error?.message || r.reason }))
    // .filter(Boolean);

    // if (failedBatches.length > 0) {
    //   return res.status(207).json({
    //     message: `Partial success. ${chunks.length - failedBatches.length}/${chunks.length} batches succeeded.`,
    //     failedBatches,
    //   });
    // }

    // res.status(200).json({
    //   message: `Successfully assigned ${assignments.length} participants in ${chunks.length} batches.`,
    // });
    
  } catch (error) {
    console.error("Error assigning participants:", error);
    res.status(503).json({ message: "Failed to assign participants" });
  }
}


exports.getAssignedParticipants = async (req, res) => {
  const {campaignId} = req.params;
  
  try {
    if(!campaignId) return res.status(400).json({message: "provide compaign id"})
    // const campaigns = await CampaignParticipant.findAll({where: {CampaignId: campaignId
  
    // },include:{model:Participant,
    //   through
    // }})

    const compaiggns= await Participant.findAll({include:{
      model:CampaignParticipant,where:{
        CampaignId:campaignId
      }
    }})
    return res.status(200).json({data: campaigns})
  } catch (error) {
    console.error("Error fetching assigned Participants:", error);
    res.status(503).json({ message: "Failed to fetch assigned Participants" });
  }
}

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

    const participant = await Participant.findOne({
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

exports.publishParticipants = async (req, res) => {
  try {
    const { campaignId, participantIds } = req.body;

    if (
      !campaignId ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid campaignId or participantIds" });
    }

    // Get company info
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const company = await Company.findByPk(CompanyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const {
      regionId: companyRegionId,
      zoneId: companyZoneId,
      woredaId: companyWoredaId,
    } = company;

    // Validate campaign exists
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Fetch participants
    const participants = await CampaignParticipant.findAll({
      where: {
        id: participantIds,
        CampaignId: campaignId,
        regionId: companyRegionId,
        zoneId: companyZoneId,
        woredaId: companyWoredaId,
      },
    });

    if (participants.length === 0) {
      return res.status(404).json({
        message: "No matching participants found for your region/zone/woreda",
      });
    }

    const alreadyPublished = [];
    const newlyPublished = [];

    for (const participant of participants) {
      if (participant.isPublished) {
        alreadyPublished.push(participant.id);
      } else {
        participant.isPublished = true;
        await participant.save();
        newlyPublished.push(participant.id);
      }
    }

    res.status(200).json({
      message: "Published Successfully",
      //   published: newlyPublished,
      //   alreadyPublished,
    });
  } catch (error) {
    console.error("Error in bulk publish:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateApprovalStatus = async (req, res) => {
  try {
    const { campaignId, participantIds, newStatus } = req.body;

    // Validate input
    if (
      !campaignId ||
      !Array.isArray(participantIds) ||
      participantIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid campaignId or participantIds" });
    }

    // Validate the status input
    const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Get company info
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const company = await Company.findByPk(CompanyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const {
      regionId: companyRegionId,
      zoneId: companyZoneId,
      woredaId: companyWoredaId,
    } = company;

    // Validate campaign exists
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // If the company has zoneId or woredaId, restrict the operation
    if (companyZoneId !== null || companyWoredaId !== null) {
      return res.status(403).json({
        message:
          "You do not have permission to approve participants in this region/zone/woreda",
      });
    }

    // If zoneId and woredaId are null, proceed with updating the approval status
    const participants = await CampaignParticipant.findAll({
      where: {
        id: participantIds,
        CampaignId: campaignId,
        regionId: companyRegionId, // Ensure the participants are from the correct region
      },
    });

    if (participants.length === 0) {
      return res.status(404).json({
        message: "No matching participants found for your region",
      });
    }

    // Update approvalStatus for each participant
    const updatedParticipants = [];
    const notUpdatedParticipants = [];
    for (const participant of participants) {
      if (participantIds.includes(participant.id)) {
        participant.approvalStatus = newStatus; // Set the new approval status
        await participant.save();
        updatedParticipants.push(participant.id); // Store the updated participant id
      } else {
        notUpdatedParticipants.push(participant.id); // Store participants that could not be updated
      }
    }

    if (updatedParticipants.length === 0) {
      return res.status(404).json({
        message:
          "No participants were updated. Please check the participant IDs.",
      });
    }

    res.status(200).json({
      message: `Participants' approval status updated to ${newStatus} successfully.`,
      // updatedParticipants,
      // notUpdatedParticipants,
    });
  } catch (error) {
    console.error("Error updating approval status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// exports.getAllParticipantsPublished = async (req, res) => {
//   try {
//     const { campaignId } = req.query;
//     // return res.json(campaignId);

//     const CompanyId =
//       req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

//     const company = await Company.findByPk(CompanyId);

//     if (!company) {
//       return res.status(404).json({ message: "Company not found" });
//     }

//     const { regionId, zoneId, woredaId } = company;

//     // Start building dynamic where clause
//     const whereClause = {
//       regionId,
//       CampaignId: campaignId,
//       isActive: true,
//       isPublished: true,
//     };

//     // Only add zoneId if it's not null
//     if (zoneId !== null) {
//       whereClause.zoneId = zoneId;
//     }

//     // Only add woredaId if it's not null
//     if (woredaId !== null) {
//       whereClause.woredaId = woredaId;
//     }

//     const participants = await CampaignParticipant.findAll({
//       include: [Campaign, Region],
//       where: whereClause,
//     });

//     res.status(200).json({ data: participants });
//   } catch (error) {
//     console.error("Error fetching participants:", error);
//     res.status(500).json({ message: "Failed to fetch participants" });
//   }
// };

// exports.getAllParticipantsApproved = async (req, res) => {
//   try {
//     const { campaignId } = req.query;

//     const CompanyId =
//       req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

//     const company = await Company.findByPk(CompanyId);

//     if (!company) {
//       return res.status(404).json({ message: "Company not found" });
//     }

//     const { regionId, zoneId, woredaId } = company;

//     // Start building dynamic where clause
//     const whereClause = {
//       regionId,
//       CampaignId: campaignId,
//       isActive: true,
//       approvalStatus: "APPROVED",
//     };

//     // Only add zoneId if it's not null
//     if (zoneId !== null) {
//       whereClause.zoneId = zoneId;
//     }

//     // Only add woredaId if it's not null
//     if (woredaId !== null) {
//       whereClause.woredaId = woredaId;
//     }

//     const participants = await CampaignParticipant.findAll({
//       include: [Campaign, Region],
//       where: whereClause,
//     });

//     res.status(200).json({ data: participants });
//   } catch (error) {
//     console.error("Error fetching participants:", error);
//     res.status(500).json({ message: "Failed to fetch participants" });
//   }
// };

exports.getAllParticipantsApproved = async (req, res) => {
  try {
    const {
      campaignId,
      zoneId: queryZoneId,
      woredaId: queryWoredaId,
    } = req.query;

    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const company = await Company.findByPk(CompanyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const {
      regionId,
      zoneId: companyZoneId,
      woredaId: companyWoredaId,
    } = company;

    // Validate campaignId
    if (!campaignId) {
      return res.status(400).json({ message: "campaignId is required" });
    }

    // If company is scoped to a zone/woreda, they shouldn't be able to query others
    if (
      (companyZoneId &&
        queryZoneId &&
        parseInt(queryZoneId) !== companyZoneId) ||
      (companyWoredaId &&
        queryWoredaId &&
        parseInt(queryWoredaId) !== companyWoredaId)
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view participants outside your assigned zone or woreda",
      });
    }

    // Build dynamic where clause
    const whereClause = {
      regionId,
      CampaignId: campaignId,
      isActive: true,
      approvalStatus: "APPROVED",
    };

    // Apply zoneId from company or query if available
    if (companyZoneId) {
      whereClause.zoneId = companyZoneId;
    } else if (queryZoneId) {
      whereClause.zoneId = queryZoneId;
    }

    // Apply woredaId from company or query if available
    if (companyWoredaId) {
      whereClause.woredaId = companyWoredaId;
    } else if (queryWoredaId) {
      whereClause.woredaId = queryWoredaId;
    }

    const participants = await CampaignParticipant.findAll({
      include: [Campaign, Region],
      where: whereClause,
    });

    res.status(200).json({ data: participants });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ message: "Failed to fetch participants" });
  }
};

exports.getAllParticipantsPublished = async (req, res) => {
  try {
    const {
      campaignId,
      regionId: queryRegionId,
      zoneId: queryZoneId,
      woredaId: queryWoredaId,
    } = req.query;

    if (!campaignId) {
      return res
        .status(400)
        .json({ message: "Missing campaignId query parameter" });
    }

    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const company = await Company.findByPk(CompanyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Use company region/zone/woreda unless overridden by query params
    const regionId = queryRegionId || company.regionId;
    const zoneId = queryZoneId || company.zoneId;
    const woredaId = queryWoredaId || company.woredaId;

    const whereClause = {
      CampaignId: campaignId,
      regionId,
      isActive: true,
      isPublished: true,
    };

    if (zoneId !== null) {
      whereClause.zoneId = zoneId;
    }

    if (woredaId !== null) {
      whereClause.woredaId = woredaId;
    }

    const participants = await CampaignParticipant.findAll({
      where: whereClause,
      include: [Campaign, Region],
    });

    res.status(200).json({ data: participants });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ message: "Failed to fetch participants" });
  }
};
