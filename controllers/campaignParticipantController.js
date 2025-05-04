// const { CampaignParticipant, Campaign, Employee } = require("../models");
const CampaignParticipant = require("../models/campaignParticipant");
const Campaign = require("../models/campaigns");
const ExcelJS = require("exceljs");
const fs = require("fs");
const createError = require("../utils/error");
const Company = require("../models/company");
exports.createParticipant = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      accountNumber,
      paymentMethod,
      campaignId,
      //   employeeId,
    } = req.body;

    const participant = await CampaignParticipant.create({
      fullName,
      phoneNumber,
      accountNumber,
      paymentMethod,
      CampaignId: campaignId,
      //   EmployeeId: employeeId,
    });

    res.status(201).json(participant);
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
// exports.downloadExcel = async (req, res) => {
//   try {
//     // Create a new workbook and worksheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Campaign Participants");

//     // Define the header row
//     worksheet.columns = [
//       { header: "Full Name", key: "fullName", width: 30 },
//       { header: "Sex", key: "sex", width: 10 },
//       { header: "Amount", key: "amount", width: 15 },
//       { header: "Age", key: "age", width: 10 },
//       { header: "National ID", key: "nationalId", width: 20 },
//       { header: "Address", key: "address", width: 30 },
//       { header: "Email", key: "email", width: 30 },
//       { header: "Phone Number", key: "phoneNumber", width: 20 },
//       { header: "Account Number", key: "accountNumber", width: 20 },
//       { header: "Payment Method", key: "paymentMethod", width: 20 },
//       { header: "Detail", key: "detail", width: 40 },
//     ];

//     // Optionally, you can add an empty row to start with
//     worksheet.addRow({
//       fullName: "",
//       sex: "",
//       amount: "",
//       age: "",
//       nationalId: "",
//       address: "",
//       email: "",
//       phoneNumber: "",
//       accountNumber: "",
//       paymentMethod: "",
//       detail: "",
//     });

//     // Set the response header for downloading the file
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=campaign_participants_template.xlsx"
//     );

//     // Write the workbook to the response
//     await workbook.xlsx.write(res);

//     // End the response
//     res.end();
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Something went wrong while generating the Excel file.",
//     });
//   }
// };

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
      } else if (paymentMethod.toUpperCase() === "ACCCOUNTNUMBER") {
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
        CampaignId,
        regionId: companyRegionId,
        zoneId: companyZoneId,
        woredaId: companyWoredaId,
      });
    }

    await CampaignParticipant.bulkCreate(participants, { validate: true });
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
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    // Fetch the company to get region/zone/woreda
    const company = await Company.findByPk(CompanyId);

    const companyRegionId = company?.regionId;
    const companyZoneId = company?.zoneId;
    const companyWoredaId = company?.woredaId;

    const participants = await CampaignParticipant.findAll({
      include: [Campaign],

      where: {
        regionId: companyRegionId,
        zoneId: companyZoneId,
        woredaId: companyWoredaId,
      },
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

    const participant = await CampaignParticipant.findByPk(id, {
      include: [Campaign],
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
    const { id } = req.params;
    const updated = await CampaignParticipant.update(req.body, {
      where: { id },
    });

    if (updated[0] === 0)
      return res.status(404).json({ message: "Participant not found" });

    res.status(200).json({ message: "Participant updated successfully" });
  } catch (error) {
    console.error("Error updating participant:", error);
    res.status(500).json({ message: "Failed to update participant" });
  }
};

exports.deleteParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await CampaignParticipant.destroy({ where: { id } });

    if (!deleted)
      return res.status(404).json({ message: "Participant not found" });

    res.status(200).json({ message: "Participant deleted successfully" });
  } catch (error) {
    console.error("Error deleting participant:", error);
    res.status(500).json({ message: "Failed to delete participant" });
  }
};
