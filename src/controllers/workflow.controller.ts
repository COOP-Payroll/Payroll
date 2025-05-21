import httpStatus from "http-status";
import { CampaignApprovalFlow } from "../types/workflow.types";
import catchAsync from "../utils/catch-async";
import workFlowService from "../services/workFlow.service";

const createWorkflow = catchAsync(async (req, res) => {
  const { name, companyId, stages } = req.body as CampaignApprovalFlow;

  const workflow = await workFlowService.createWorkflow(
    name,
    companyId,
    stages
  );

  res
    .status(httpStatus.CREATED)
    .send({ data: workflow, message: "workflow created Successfully" });
});

export default { createWorkflow };
