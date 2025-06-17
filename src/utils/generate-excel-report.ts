import ExcelJS from "exceljs";
import { format } from "date-fns";
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

  // Add title row
  summarySheet.mergeCells("A1:B1");
  const titleCell = summarySheet.getCell("A1");
  titleCell.value = `Campaign Summary Report`;
  titleCell.font = { bold: true, size: 16 };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  // Add date row
  summarySheet.mergeCells("A2:B2");
  const dateCell = summarySheet.getCell("A2");
  dateCell.value = `Generated on: ${format(new Date(), "yyyy-MM-dd HH:mm")}`;
  dateCell.font = { italic: true };
  dateCell.alignment = { horizontal: "center" };

  // Add column headers starting from row 4
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value", key: "value", width: 20 },
  ];

  summarySheet.addRows([
    { metric: "Total Participants", value: data.totalParticipant },
    { metric: "Total Paid Amount", value: data.totalPaidAmount.toFixed(2) },
    { metric: "Total Unpaid Amount", value: data.totalUnpaidAmount.toFixed(2) },
    { metric: "Start Date", value: format(data.startDate, "yyyy-MM-dd") },
    { metric: "End Date", value: format(data.endDate, "yyyy-MM-dd") },
  ]);

  // Participants Sheet
  const participantsSheet = workbook.addWorksheet("Participants");

  // Add header
  participantsSheet.mergeCells("A1:J1");
  const pTitleCell = participantsSheet.getCell("A1");
  pTitleCell.value = `Campaign Participants`;
  pTitleCell.font = { bold: true, size: 16 };
  pTitleCell.alignment = { vertical: "middle", horizontal: "center" };

  // Add generated date
  participantsSheet.mergeCells("A2:J2");
  const pDateCell = participantsSheet.getCell("A2");
  pDateCell.value = `Generated on: ${format(new Date(), "yyyy-MM-dd HH:mm")}`;
  pDateCell.font = { italic: true };
  pDateCell.alignment = { horizontal: "center" };

  // Column headers start from row 4
  participantsSheet.columns = [
    { header: "ID", key: "id", width: 36 },
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

  // Add participant data
  data.campaignParticipants.forEach((cp) => {
    participantsSheet.addRow({
      id: cp.id,
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

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
