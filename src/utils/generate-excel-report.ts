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
