import httpStatus from "http-status";
import { CampaignApprovalFlow } from "../types/workflow.types";
import catchAsync from "../utils/catch-async";
import workFlowService from "../services/workFlow.service";
import { AuthUser } from "../types/express";

const createWorkflow = catchAsync(async (req, res) => {
  const { name, stages } = req.body as CampaignApprovalFlow;
  const user = req.user as AuthUser;
  const workflow = await workFlowService.createWorkflow(
    name,
    user.companyId,
    stages
  );

  res
    .status(httpStatus.CREATED)
    .send({ data: workflow, message: "workflow created Successfully" });
});

const getActiveWorkflow = catchAsync(async (req, res) => {
  const { companyId } = req.user as AuthUser;

  const activeWorkflow = await workFlowService.getActiveWorkflow(companyId);

  res
    .status(httpStatus.CREATED)
    .send({ data: activeWorkflow, message: "workflow retrieved Successfully" });
});

const getWorkflowHistory = catchAsync(async (req, res) => {
  const { companyId } = req.user as AuthUser;

  const activeWorkflow = await workFlowService.getWorkflowHistory(companyId);

  res.status(httpStatus.CREATED).send({
    data: activeWorkflow,
    message: "workflow history retrieved Successfully",
  });
});

const getStageUserActiveWorkflow = catchAsync(async (req, res) => {
  // const { companyId } = req.user as AuthUser;
  const { workFlowId } = req.body;
  const getStageUserActiveWorkflow =
    await workFlowService.getStageUserActiveWorkflow(workFlowId);

  res.status(httpStatus.CREATED).send({
    data: getStageUserActiveWorkflow,
    message: "stage users retrieved Successfully",
  });
});

export default {
  createWorkflow,
  getActiveWorkflow,
  getWorkflowHistory,
  getStageUserActiveWorkflow,
};
