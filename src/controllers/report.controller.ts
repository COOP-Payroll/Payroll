import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import campaignReportService from "../services/report.service";
import pick from "../utils/pick";
import { generateExcelReport } from "../utils/generate-excel-report";

import generatePDFReport from "../utils/generatePDFReport";

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
  } else {
    const buffer = await generatePDFReport(reportData);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=campaign-report-${campaignId}.pdf`
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

export default {
  fetchCampaignReport,
  downloadCampaignReport,
  fetchPublishedCampaign,
  fetchCampaignPaymentHistory,
};
