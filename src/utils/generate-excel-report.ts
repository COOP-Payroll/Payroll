import ExcelJS from "exceljs";
import { format } from "date-fns/format";
import { DownloadCampaignReportResponse } from "../dto";

// export async function generateExcelReport(
//   data: DownloadCampaignReportResponse
// ): Promise<Buffer> {
//   const workbook = new ExcelJS.Workbook();
//   workbook.created = new Date();
//   workbook.modified = new Date();
//   workbook.creator = "Campaign Report System";

//   // Summary Sheet
//   const summarySheet = workbook.addWorksheet("Summary");

//   summarySheet.columns = [
//     { header: "Metric", key: "metric", width: 30 },
//     { header: "Value", key: "value", width: 20 },
//   ];
//   summarySheet.addRows([
//     { metric: "Total Participants", value: data.totalParticipant },
//     { metric: "Total Paid Amount", value: data.totalPaidAmount.toFixed(2) },
//     { metric: "Total Unpaid Amount", value: data.totalUnpaidAmount.toFixed(2) },
//     { metric: "Start Date", value: format(data.startDate, "yyyy-MM-dd") },
//     { metric: "End Date", value: format(data.endDate, "yyyy-MM-dd") },
//   ]);

//   // Participants Sheet
//   const participantsSheet = workbook.addWorksheet("Participants");
//   participantsSheet.columns = [
//     { header: "ID", key: "id", width: 36 },
//     { header: "Full Name", key: "fullName", width: 25 },
//     { header: "Gender", key: "Gender", width: 10 },
//     { header: "Payment Method", key: "paymentMethod", width: 15 },
//     { header: "Phone Number", key: "phoneNumber", width: 15 },
//     { header: "Account Number", key: "accountNumber", width: 20 },
//     { header: "Verified", key: "isVerified", width: 10 },
//     { header: "Urban Days", key: "urbanDays", width: 12 },
//     { header: "Rural Days", key: "ruralDays", width: 12 },
//     { header: "Total Amount", key: "totalAmount", width: 15 },
//   ];
//   data.campaignParticipants.forEach((cp) => {
//     participantsSheet.addRow({
//       id: cp.id,
//       fullName: cp.fullName,
//       Gender: cp.Gender,
//       paymentMethod: cp.paymentMethod,
//       phoneNumber: cp.phoneNumber || "N/A",
//       accountNumber: cp.accountNumber || "N/A",
//       isVerified: cp.isVerified ? "Yes" : "No",
//       urbanDays: cp.urbanDays,
//       ruralDays: cp.ruralDays,
//       totalAmount: cp.totalAmount.toFixed(2),
//     });
//   });

//   const buffer = await workbook.xlsx.writeBuffer();

//   return Buffer.from(buffer);
// }
// export async function generateExcelReport(
//   data: DownloadCampaignReportResponse
// ): Promise<Buffer> {
//   const workbook = new ExcelJS.Workbook();
//   workbook.creator = "Campaign Report System";
//   workbook.created = new Date();
//   workbook.modified = new Date();

//   // === SUMMARY SHEET ===
//   const summarySheet = workbook.addWorksheet("Summary");

//   summarySheet.columns = [
//     { header: "Metric", key: "metric", width: 30 },
//     { header: "Value", key: "value", width: 25 },
//   ];

//   const summaryRows = [
//     { metric: "Total Participants", value: data.totalParticipant },
//     { metric: "Total Paid Amount", value: data.totalPaidAmount.toFixed(2) },
//     { metric: "Total Unpaid Amount", value: data.totalUnpaidAmount.toFixed(2) },
//     { metric: "Start Date", value: format(data.startDate, "yyyy-MM-dd") },
//     { metric: "End Date", value: format(data.endDate, "yyyy-MM-dd") },
//   ];

//   summarySheet.addRows(summaryRows);

//   // Style summary header row
//   summarySheet.getRow(1).font = { bold: true };
//   summarySheet.getRow(1).fill = {
//     type: "pattern",
//     pattern: "solid",
//     fgColor: { argb: "FFCCE5FF" }, // Light blue
//   };

//   // Add borders and alignment to all cells
//   summarySheet.eachRow((row) => {
//     row.eachCell((cell) => {
//       cell.border = {
//         top: { style: "thin" },
//         left: { style: "thin" },
//         bottom: { style: "thin" },
//         right: { style: "thin" },
//       };
//       cell.alignment = { vertical: "middle", horizontal: "left" };
//     });
//   });

//   // === PARTICIPANTS SHEET ===
//   const participantsSheet = workbook.addWorksheet("Participants");

//   participantsSheet.columns = [
//     { header: "ID", key: "id", width: 36 },
//     { header: "Full Name", key: "fullName", width: 25 },
//     { header: "Gender", key: "Gender", width: 10 },
//     { header: "Payment Method", key: "paymentMethod", width: 15 },
//     { header: "Phone Number", key: "phoneNumber", width: 15 },
//     { header: "Account Number", key: "accountNumber", width: 20 },
//     { header: "Verified", key: "isVerified", width: 10 },
//     { header: "Urban Days", key: "urbanDays", width: 12 },
//     { header: "Rural Days", key: "ruralDays", width: 12 },
//     { header: "Total Amount", key: "totalAmount", width: 15 },
//   ];

//   data.campaignParticipants.forEach((cp) => {
//     participantsSheet.addRow({
//       id: cp.id,
//       fullName: cp.fullName,
//       Gender: cp.Gender,
//       paymentMethod: cp.paymentMethod,
//       phoneNumber: cp.phoneNumber || "N/A",
//       accountNumber: cp.accountNumber || "N/A",
//       isVerified: cp.isVerified ? "Yes" : "No",
//       urbanDays: cp.urbanDays,
//       ruralDays: cp.ruralDays,
//       totalAmount: cp.totalAmount.toFixed(2),
//     });
//   });

//   // Style header
//   const headerRow = participantsSheet.getRow(1);
//   headerRow.font = { bold: true };
//   headerRow.fill = {
//     type: "pattern",
//     pattern: "solid",
//     fgColor: { argb: "FFFFE599" }, // Light yellow
//   };

//   // Add auto-filter and freeze header row
//   participantsSheet.autoFilter = {
//     from: { row: 1, column: 1 },
//     to: { row: 1, column: participantsSheet.columns.length },
//   };
//   participantsSheet.views = [{ state: "frozen", ySplit: 1 }];

//   // Borders and alignment
//   participantsSheet.eachRow((row, rowNumber) => {
//     row.eachCell((cell) => {
//       cell.border = {
//         top: { style: "thin" },
//         left: { style: "thin" },
//         bottom: { style: "thin" },
//         right: { style: "thin" },
//       };
//       cell.alignment = { vertical: "middle", horizontal: "left" };

//       // Optional: Highlight unverified users
//       if (rowNumber > 1 && row.getCell("isVerified").value === "No") {
//         cell.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: "FFFFCCCC" }, // Light red
//         };
//       }
//     });
//   });

//   const buffer = await workbook.xlsx.writeBuffer();
//   return Buffer.from(buffer);
// }

import path from "path";
import fs from "fs";

export async function generateExcelReport(
  data: DownloadCampaignReportResponse
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Coopayroll Reporting System";
  workbook.created = new Date();
  workbook.modified = new Date();

  // === HEADER STYLE SETUP ===
  const headerTitle = "Cooperative Bank of Oromia S.C.";
  const subTitle = "Coopayroll";
  const campaignTitle = `Campaign Report: ${data.campaignName}`;

  // === SUMMARY SHEET ===
  const sheet = workbook.addWorksheet("Campaign Report");

  // Optional: Add logo (top-left corner)
  const logoPath = path.resolve(__dirname, "../assets/logo.png");
  if (fs.existsSync(logoPath)) {
    const imageId = workbook.addImage({
      filename: logoPath,
      extension: "png",
    });
    sheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 120, height: 80 },
    });
  }

  // Merge cells for titles
  sheet.mergeCells("C1", "H1");
  sheet.mergeCells("C2", "H2");
  sheet.mergeCells("C3", "H3");

  sheet.getCell("C1").value = headerTitle;
  sheet.getCell("C2").value = subTitle;
  sheet.getCell("C3").value = campaignTitle;

  [1, 2, 3].forEach((row) => {
    const cell = sheet.getCell(`C${row}`);
    cell.font = {
      size: row === 3 ? 14 : 16,
      bold: true,
      color: { argb: "FF0070C0" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  let currentRow = 5;

  // Summary table
  sheet.addRow([]);
  sheet.addRow(["Summary"]).font = { bold: true, size: 12 };
  currentRow += 2;

  sheet.addRow(["Metric", "Value"]);
  sheet.getRow(currentRow).font = { bold: true };
  sheet.getRow(currentRow).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFCCE5FF" },
  };
  currentRow++;

  const summaryData = [
    ["Total Participants", data.totalParticipant],
    ["Total Paid Amount", "ETB" + data.totalPaidAmount.toFixed(2)],
    ["Total Unpaid Amount", "ETB" + data.totalUnpaidAmount.toFixed(2)],
    ["Start Date", format(data.startDate, "yyyy-MM-dd")],
    ["End Date", format(data.endDate, "yyyy-MM-dd")],
  ];

  summaryData.forEach((row) => {
    sheet.addRow(row);
    currentRow++;
  });

  sheet.getColumn(1).width = 30;
  sheet.getColumn(2).width = 25;

  // Style summary rows
  for (let i = currentRow - summaryData.length; i <= currentRow; i++) {
    sheet.getRow(i).eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  }

  // Participants Table
  currentRow += 2;
  sheet.addRow(["Participants"]).font = { bold: true, size: 12 };
  currentRow++;

  const participantHeaders = [
    "No",
    "Full Name",
    "Gender",
    "Payment Method",
    "Phone Number",
    "Account Number",
    "Verified",
    "Urban Days",
    "Rural Days",
    "Total Amount",
  ];

  sheet.addRow(participantHeaders);
  const headerRow = sheet.getRow(currentRow);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0070C0" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 18;

  sheet.autoFilter = {
    from: {
      row: currentRow,
      column: 1,
    },
    to: {
      row: currentRow,
      column: participantHeaders.length,
    },
  };

  const startDataRow = currentRow + 1;

  data.campaignParticipants.forEach((cp, i) => {
    sheet.addRow([
      i + 1,
      cp.fullName,
      cp.Gender,
      cp.paymentMethod,
      cp.phoneNumber || "N/A",
      cp.accountNumber || "N/A",
      cp.isVerified ? "Yes" : "No",
      cp.urbanDays,
      cp.ruralDays,
      cp.totalAmount.toFixed(2),
    ]);
  });

  // Set column widths
  [6, 25, 10, 15, 15, 20, 10, 12, 12, 15].forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });

  // Style participant rows
  const totalParticipantRows = data.campaignParticipants.length;
  for (let i = 0; i < totalParticipantRows; i++) {
    const row = sheet.getRow(startDataRow + i);
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "left" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    if (i % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F2F2" },
      };
    }
  }

  sheet.views = [{ state: "frozen", ySplit: currentRow }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
