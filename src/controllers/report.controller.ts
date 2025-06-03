import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import campaignReportService from "../services/report.service";
import pick from "../utils/pick";

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

export default {
  fetchCampaignReport,
};
