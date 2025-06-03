import ExcelJS from "exceljs";
import { format } from "date-fns/format";
import { DownloadCampaignReportResponse } from "../dto";

export async function generateExcelReport(
  data: DownloadCampaignReportResponse
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.creator = "Campaign Report System";

  // Summary Sheet
  const summarySheet = workbook.addWorksheet("Summary");
  // Add header with campaign name
  summarySheet
    .addRow([`Campaign Report: ${data.campaignName}`])
    .eachCell((cell) => {
      cell.font = {
        name: "Arial",
        size: 16,
        bold: true,
        color: { argb: "FF004080" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE6F0FA" },
      };
    });
  summarySheet.mergeCells("A1:B1");
  summarySheet.addRow([]); // Spacer

  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value", key: "value", width: 20 },
  ];
  summarySheet.getRow(3).font = { bold: true };
  summarySheet.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };
  summarySheet.addRows([
    { metric: "Total Participants", value: data.totalParticipant },
    { metric: "Total Paid Amount", value: data.totalPaidAmount.toFixed(2) },
    { metric: "Total Unpaid Amount", value: data.totalUnpaidAmount.toFixed(2) },
    { metric: "Start Date", value: format(data.startDate, "yyyy-MM-dd") },
    { metric: "End Date", value: format(data.endDate, "yyyy-MM-dd") },
  ]);

  // Documents Sheet
  //   const documentsSheet = workbook.addWorksheet("Documents");
  //   documentsSheet.columns = [
  //     { header: "ID", key: "id", width: 36 },
  //     { header: "File Name", key: "fileName", width: 30 },
  //     { header: "File Path", key: "filePath", width: 40 },
  //     { header: "MIME Type", key: "mimeType", width: 20 },
  //     { header: "Size (bytes)", key: "size", width: 15 },
  //     { header: "Uploaded At", key: "uploadedAt", width: 20 },
  //   ];
  //   data.Documents.forEach((doc) => {
  //     documentsSheet.addRow({
  //       id: doc.id,
  //       fileName: doc.fileName,
  //       filePath: doc.filePath,
  //       mimeType: doc.mimeType || "N/A",
  //       size: doc.size || "N/A",
  //       uploadedAt: format(doc.uploadedAt, "yyyy-MM-dd HH:mm:ss"),
  //     });
  //   });

  // Participants Sheet
  const participantsSheet = workbook.addWorksheet("Participants");
  participantsSheet
    .addRow([`Campaign Participants: ${data.campaignName}`])
    .eachCell((cell) => {
      cell.font = {
        name: "Arial",
        size: 16,
        bold: true,
        color: { argb: "FF004080" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE6F0FA" },
      };
    });

  participantsSheet.mergeCells("A1:J1");
  participantsSheet.addRow([]); // Spacer

  participantsSheet.columns = [
    // { header: "ID", key: "id", width: 36 },
    { header: "Full Name", key: "fullName", width: 25 },
    { header: "Gender", key: "Gender", width: 10 },
    { header: "Payment Method", key: "paymentMethod", width: 15 },
    { header: "Phone Number", key: "phoneNumber", width: 15 },
    { header: "Account Number", key: "accountNumber", width: 20 },
    { header: "Verified", key: "isVerified", width: 10 },
    { header: "Urban Days", key: "urbanDays", width: 12 },
    { header: "Rural Days", key: "ruralDays", width: 12 },
    { header: "Total Amount", key: "totalAmount", width: 15 },
  ];
  participantsSheet.getRow(3).font = { bold: true };

  data.campaignParticipants.forEach((cp) => {
    participantsSheet.addRow({
      //   id: cp.id,
      fullName: cp.fullName,
      Gender: cp.Gender,
      paymentMethod: cp.paymentMethod,
      phoneNumber: cp.phoneNumber || "N/A",
      accountNumber: cp.accountNumber || "N/A",
      isVerified: cp.isVerified ? "Yes" : "No",
      urbanDays: cp.urbanDays,
      ruralDays: cp.ruralDays,
      totalAmount: cp.totalAmount.toFixed(2),
    });
  });

  // Pagination Info Sheet
  //   const paginationSheet = workbook.addWorksheet("Pagination Info");
  //   paginationSheet.columns = [
  //     { header: "Metric", key: "metric", width: 30 },
  //     { header: "Value", key: "value", width: 20 },
  //   ];
  //   paginationSheet.addRows([
  //     { metric: "Current Page", value: data.pagination.currentPage },
  //     { metric: "Total Pages", value: data.pagination.totalPages },
  //     { metric: "Total Items", value: data.pagination.totalItems },
  //     { metric: "Items per Page", value: data.pagination.limit },
  //   ]);

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
}
