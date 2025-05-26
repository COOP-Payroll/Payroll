import httpStatus from "http-status";
import prisma from "../client";
import { CampaignApprovalFlow } from "../types/workflow.types";
import ApiError from "../utils/api-error";

const createWorkflow = async (
  name: CampaignApprovalFlow["name"],
  companyId: CampaignApprovalFlow["companyId"],
  stages: CampaignApprovalFlow["stages"]
) => {
  const existing = await prisma.company.findUnique({
    where: { id: companyId },
  });

  // 1. Flatten all roleIds from all stages
  const allRoleIds = stages.flatMap((stage) => stage.roles);

  // 2. Get roles that exist in DB
  const existingRoles = await prisma.role.findMany({
    where: { id: { in: allRoleIds } },
    select: { id: true },
  });

  const existingRoleIds = existingRoles.map((role) => role.id);

  // 3. Check if all provided roleIds are valid
  const invalidRoleIds = allRoleIds.filter(
    (id) => !existingRoleIds.includes(id)
  );

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  if (invalidRoleIds.length > 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid role IDs provided");
  }

  const workflow = await prisma.approvalWorkflow.create({
    data: {
      name,
      companyId,
      stages: {
        create: stages.map((stage, index) => ({
          name: stage.name,
          order: index + 1,
          stageRoles: {
            create: stage.roles.map((roleId) => ({
              role: { connect: { id: roleId } },
            })),
          },
        })),
      },
    },
    include: {
      stages: {
        include: {
          stageRoles: true,
        },
      },
    },
  });
  return workflow;
};

const getActiveWorkflow = async (companyId: string) => {
  const result = await prisma.approvalWorkflow.findMany({
    where: { companyId, isActive: true },
    select: {
      id: true,
      name: true,
      stages: {
        select: {
          name: true,
          stageRoles: {
            select: { role: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  return result;
};
const getWorkflowHistory = async (companyId: string) => {
  const result = await prisma.approvalWorkflow.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      stages: {
        select: {
          name: true,
          stageRoles: {
            select: { role: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  return result;
};

const getStageUserActiveWorkflow = async (workFlowId: string) => {
  const stageUsers = await prisma.approvalWorkflow.findMany({
    where: { id: workFlowId },
    select: {
      stages: {
        select: {
          name: true,
          stageRoles: {
            select: {
              role: {
                select: {
                  name: true,
                  userRoles: {
                    select: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                          username: true,
                          department: {
                            select: {
                              deptName: true,
                            },
                          },
                          position: {
                            select: {
                              positionName: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return stageUsers;
};

export default {
  createWorkflow,
  getActiveWorkflow,
  getWorkflowHistory,
  getStageUserActiveWorkflow,
};
