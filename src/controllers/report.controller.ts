import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import campaignReportService from "../services/report.service";
import pick from "../utils/pick";
import { generateExcelReport } from "../utils/generate-excel-report";

import generatePDFReport from "../utils/generatePDFReport";
import { AuthUser } from "../types/express";

const fetchCampaignReport = catchAsync(async (req, res) => {
  const { campaignId } = req.params;
  const options = pick(req.query, ["limit", "page"]);

  const result = await campaignReportService.fetchCampaignReport(
    campaignId,
    options
  );

  res
    .status(httpStatus.OK)
    .send({ data: result, message: "campaign report retrieved successfully" });
});

const downloadCampaignReport = catchAsync(async (req, res) => {
  const { campaignId } = req.params;
  const options = pick(req.query, ["limit", "page", "format"]);

  const reportData = await campaignReportService.downloadCampaignReport(
    campaignId
  );

  console.log("kdjjddjdjdjddjdjjddjjdjjd", reportData);

  if (options.format === "excel") {
    const buffer = await generateExcelReport(reportData);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=campaign-report-${campaignId}.xlsx`
    );
    return res.send(buffer);
  } else if (options.format === "downloadpdf") {
    const buffer = await generatePDFReport.generatePDFReport(reportData);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=campaign-report-${campaignId}.pdf`
    );
    return res.send(buffer);
  }
});

const downloadpayslip = catchAsync(async (req, res) => {
  const { id } = req.params;
  const options = pick(req.query, ["limit", "page", "format"]);

  console.log("dkjflsfdjfjahdfuadsuofhdufhadshf", id);

  const reportData = await campaignReportService.paysipReport(id);

  console.log("jdfdshfddddddddddddddddddddsf", reportData);

  // const reportData = await paysipReport(companyId, id);
  // const buffer = await generateSinglePayslipPDF(reportData);
  if (options.format === "excel") {
    // const buffer = await generateExcelReport(reportData);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=campaign-report-${id}.xlsx`
    );
    // return res.send(buffer);
  } else if (options.format === "downloadpdf") {
    const buffer = await generatePDFReport.generateSinglePayslipPDF(reportData);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=campaign-report-${id}.pdf`
    );
    return res.send(buffer);
  }
});

const fetchPublishedCampaign = catchAsync(async (req, res) => {
  const { campaignId } = req.params;
  const options = pick(req.query, ["limit", "page"]);

  const result = await campaignReportService.fetchPublishedCampaign(
    campaignId,
    options
  );

  res.status(httpStatus.OK).send({
    data: result,
    message: "Published Campaign retrieved successfully",
  });
});

const fetchCampaignPaymentHistory = catchAsync(async (req, res) => {
  const { campaignId } = req.params;
  const options = pick(req.query, ["limit", "page"]);

  const result = await campaignReportService.fetchCampaignPaymentHistory(
    campaignId,
    options
  );

  res.status(httpStatus.OK).send({
    data: result,
    message: "Published Campaign retrieved successfully",
  });
});

const fetchCampaignSummaryReport = catchAsync(async (req, res) => {
  const user = req.user as AuthUser;
  //fetch by department
  const campaigns = await campaignReportService.fetchCampaignSummaryReport(
    user.companyId
  );
  res.status(httpStatus.OK).json({ data: campaigns });
});

const fetchCampaignparticipantsSummary = catchAsync(async (req, res) => {
  const user = req.user as AuthUser;

  //fetch by department
  const campaigns = await campaignReportService.fetchCampaignParticipantSummary(
    user.companyId
  );
  res.status(httpStatus.OK).json({ data: campaigns });
});

const fetchPaidCampaigns = catchAsync(async (req, res) => {
  const user = req.user as AuthUser;

  const campaigns = await campaignReportService.fetchPaidCampaigns(
    user.companyId
  );

  res
    .status(httpStatus.OK)
    .json({ data: campaigns, message: "Paid campaign retrieved successfully" });
});

const paysipReport = catchAsync(async (req, res) => {
  const user = req.user as AuthUser;
  const { id } = req.params;
  const campaigns = await campaignReportService.paysipReport(
    // user.companyId,
    id
  );

  res
    .status(httpStatus.OK)
    .json({ data: campaigns, message: "Paid campaign retrieved successfully" });
});

export default {
  fetchCampaignReport,
  downloadCampaignReport,
  fetchPublishedCampaign,
  fetchCampaignPaymentHistory,
  fetchCampaignSummaryReport,
  fetchCampaignparticipantsSummary,
  fetchPaidCampaigns,
  paysipReport,
  downloadpayslip,
};
