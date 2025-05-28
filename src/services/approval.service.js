"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
const client_2 = __importDefault(require("../client"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const logger_1 = __importDefault(require("../config/logger"));
const payment_1 = require("../types/payment");
const campaign_service_1 = __importDefault(require("./campaign.service"));
const queues_1 = require("../queues");
const createCampaignForApproval = (campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    const campaign = yield client_2.default.campaign.findUnique({
        where: { id: campaignId },
        include: { company: true },
    });
    if (!campaign) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Campaign not found");
    }
    // TODO: update campaign status
    const workflow = yield client_2.default.approvalWorkflow.findFirst({
        where: {
            companyId: campaign.companyId,
        },
        include: {
            stages: {
                orderBy: { order: "asc" },
            },
        },
    });
    if (!workflow || workflow.stages.length === 0) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Approval workflow or stages not found for this company");
    }
    const firstStage = workflow.stages.find((stage) => stage.order === 1);
    if (!firstStage) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "No initial approval stage found");
    }
    const approvalInstance = yield client_2.default.campaignApprovalInstance.create({
        data: {
            campaignId: campaign.id,
            workflowId: workflow.id,
            status: "PENDING",
            currentStageId: firstStage.id,
        },
    });
    console.log("----instance", approvalInstance);
    // TODO: send notification to the first approval
    const campaignStageStatus = workflow.stages.map((stage) => ({
        instanceId: approvalInstance.id,
        stageId: stage.id,
        status: stage.id === firstStage.id
            ? client_1.StageStatus["PENDING"]
            : client_1.StageStatus["WAITING"],
    }));
    yield client_2.default.campaignStageStatus.createMany({
        data: campaignStageStatus,
    });
    return;
});
// const approveOrRejectCampaignStage = async (
//   campaignId: string,
//   user: AuthUser,
//   action: StageStatus
// ) => {
//   const instance = await prisma.campaignApprovalInstance.findFirst({
//     where: {
//       campaignId,
//     },
//     include: {
//       currentStage: true,
//       campaign: true,
//       workflow: {
//         include: { stages: { orderBy: { order: "asc" } } },
//       },
//     },
//   });
//   if (!instance)
//     throw new ApiError(httpStatus.NOT_FOUND, "Approval instance not found");
//   if (!instance.currentStage || !instance.currentStageId) {
//     throw new ApiError(
//       httpStatus.NOT_FOUND,
//       "Campaign is not ready for approval"
//     );
//   }
//   // check if the user has the role to approve
//   // ✅ Step 1: Get user's roles
//   const userWithRoles = await prisma.user.findUnique({
//     where: { id: user.id },
//     include: {
//       userRoles: true,
//     },
//   });
//   const currentStageRole = await prisma.stageRole.findMany({
//     where: { stageId: instance.currentStageId },
//   });
//   if (!userWithRoles)
//     throw new ApiError(httpStatus.NOT_FOUND, "User not found");
//   const currentStageRoleIds = currentStageRole.map(
//     (currentStageRole) => currentStageRole.roleId
//   );
//   const userRoleIds = userWithRoles.userRoles.map((role) => role.roleId);
//   // const canAct = userRoleIds.includes(currentStageRoleIds);
//   const set = new Set(currentStageRoleIds);
//   const canAct = userRoleIds.some((id) => set.has(id));
//   if (!canAct) {
//     throw new ApiError(
//       httpStatus.FORBIDDEN,
//       "You are not authorized to approve this stage"
//     );
//   }
//   const approverUser = await prisma.user.findUnique({ where: { id: user.id } });
//   // const campaignCreatedUser = await prisma.campaign.findFirst({where: {createdBy: }})
//   const campaignCreatedUser = await prisma.user.findUnique({
//     where: { id: instance.campaign.createdById },
//   });
//   if (!approverUser || !campaignCreatedUser)
//     throw new ApiError(httpStatus.BAD_REQUEST, "campaign approver has no user");
//   if (instance.currentStage.order === 1) {
//     if (approverUser.departmentId !== campaignCreatedUser.departmentId) {
//       logger.info("Your department can not approve this campaign");
//       throw new ApiError(
//         httpStatus.BAD_REQUEST,
//         "Your department can not approve this campaign"
//       );
//     }
//   }
//   // ✅ Step 3: Update current stage status
//   await prisma.campaignStageStatus.updateMany({
//     where: {
//       instanceId: instance.id,
//       stageId: instance.currentStageId,
//     },
//     data: {
//       status: action,
//       approvedById: user.id,
//     },
//   });
//   // ✅ Step 4: Handle rejection or move to next stage
//   if (action === StageStatus["REJECTED"]) {
//     await prisma.campaignApprovalInstance.update({
//       where: { id: instance.id },
//       data: { status: StageStatus["REJECTED"] },
//     });
//     return "Campaign Rejected Successfully";
//   }
//   const currentStageOrder = instance.workflow.stages.find(
//     (stage) => stage.id === instance.currentStageId
//   )?.order;
//   const nextStage = instance.workflow.stages.find(
//     (stage) => stage.order === currentStageOrder! + 1
//   );
//   if (!nextStage) {
//     await prisma.campaignApprovalInstance.update({
//       where: { id: instance.id },
//       data: { status: "APPROVED" }, // Final approval
//     });
//     try {
//       const participants = await prisma.campaignParticipant.findMany({
//         where: {
//           campaignId,
//           // approvalStatus: ApprovalStatus["APPROVED"],
//           accountNumber: { not: null }, // Skip participants without accountNumber
//         },
//         select: {
//           id: true,
//           totalAmount: true,
//           accountNumber: true,
//           // phoneNumber: true,
//         },
//       });
//       if (participants.length === 0) {
//         logger.warn(
//           `No approved participants found for campaignId: ${campaignId}`
//         );
//         // return res
//         //   .status(400)
//         //   .json({ error: "No approved participants found for the campaign" });
//       }
//       // Calculate total amount
//       const totalAmount = participants.reduce(
//         (sum, p) => sum + p.totalAmount,
//         0
//       );
//       const account = await prisma.account.findFirst({
//         where: { companyId: user.companyId, isMaster: true, isActive: true },
//       });
//       if (account) {
//         const paymentJobData: PaymentJobData = {
//           debitAccount: account?.accountNumber,
//           totalAmount,
//           bulkId: uuidv4(),
//           participantId: participants[0].id,
//           creditTransactions: participants.map((p) => ({
//             orderId: uuidv4(),
//             creditAccount: p.accountNumber!,
//             amount: p.totalAmount,
//           })),
//         };
//         // Validate constructed data
//         const parsedData = paymentJobSchema.parse(paymentJobData);
//         // Add job to the queue
//         const job = await paymentQueue.add("create-payment", parsedData, {
//           attempts: 3,
//           backoff: {
//             type: "exponential",
//             delay: 1000,
//           },
//         });
//         logger.info(`Payment job queued for bulkId: ${parsedData.bulkId}`, {
//           jobId: job.id,
//           campaignId,
//         });
//       }
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         logger.error("Validation error in campaign approval", {
//           errors: error.errors,
//           // campaignId: req.body.campaignId,
//         });
//         // return res
//         //   .status(400)
//         //   .json({ error: "Invalid data", details: error.errors });
//       }
//       logger.error("Error processing campaign approval", {
//         error,
//         // campaignId: req.body.campaignId,
//       });
//       // res.status(500).json({ error: "Internal server error" });
//     }
//     // Construct payment job data
//     return "Campaign Finally Approved Successfully";
//   }
//   // Move to next stage
//   await prisma.campaignStageStatus.updateMany({
//     where: {
//       instanceId: instance.id,
//       stageId: nextStage.id,
//     },
//     data: {
//       status: "PENDING",
//     },
//   });
//   await prisma.campaignApprovalInstance.update({
//     where: { id: instance.id },
//     data: {
//       currentStageId: nextStage.id,
//     },
//   });
//   return "Campaign is Approved Successfully";
// };
/**
 * Approves or rejects a campaign stage, handling all necessary updates and payments.
 * @param campaignId - The ID of the campaign
 * @param user - The authenticated user performing the action
 * @param action - The action to take (APPROVED or REJECTED)
 * @returns A success message
 */
const approveOrRejectCampaignStage = (campaignId, user, action) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch and validate campaign approval instance
    const instance = yield getCampaignApprovalInstance(campaignId);
    // Ensure campaign is ready for approval
    yield checkCampaignReadyForApproval(instance);
    // Verify user authorization
    yield checkUserAuthorization(instance, user);
    // Update current stage status
    yield updateStageStatus(instance, user, action);
    if (action === client_1.StageStatus.REJECTED) {
        yield handleRejection(instance);
        return "Campaign Rejected Successfully";
    }
    else {
        const nextStage = getNextStage(instance);
        if (nextStage) {
            yield moveToNextStage(instance, nextStage);
            return "Campaign is Approved Successfully";
        }
        else {
            yield handleFinalApproval(instance, user, campaignId);
            return "Campaign Finally Approved Successfully";
        }
    }
});
// Helper Functions
function checkUserAuthorization(instance, user) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch user and stage roles
        const [userRoles, stageRoles] = yield Promise.all([
            client_2.default.userRole.findMany({
                where: { userId: user.id },
                select: { roleId: true },
            }),
            client_2.default.stageRole.findMany({
                where: { stageId: instance.currentStageId },
                select: { roleId: true },
            }),
        ]);
        const userRoleIds = userRoles.map((ur) => ur.roleId);
        const stageRoleIds = stageRoles.map((sr) => sr.roleId);
        const canAct = userRoleIds.some((id) => stageRoleIds.includes(id));
        if (!canAct) {
            throw new api_error_1.default(http_status_1.default.FORBIDDEN, "You are not authorized to approve this stage");
        }
        // Additional department check for first stage
        const [approverUser, campaignCreator] = yield Promise.all([
            client_2.default.user.findUnique({ where: { id: user.id } }),
            client_2.default.user.findUnique({ where: { id: instance.campaign.createdById } }),
        ]);
        if (!approverUser || !campaignCreator) {
            throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "User data is missing");
        }
        if (instance.currentStage.order === 1 &&
            approverUser.departmentId !== campaignCreator.departmentId) {
            logger_1.default.info(`Unauthorized department approval attempt by user ${user.id} for campaign ${instance.campaignId}`);
            throw new api_error_1.default(http_status_1.default.FORBIDDEN, "Your department cannot approve this campaign");
        }
    });
}
function getCampaignApprovalInstance(campaignId) {
    return __awaiter(this, void 0, void 0, function* () {
        const instance = yield client_2.default.campaignApprovalInstance.findFirst({
            where: { campaignId },
            include: {
                currentStage: { select: { id: true, order: true } },
                campaign: { select: { createdById: true } },
                workflow: {
                    include: {
                        stages: {
                            select: { id: true, order: true },
                            orderBy: { order: "asc" },
                        },
                    },
                },
            },
        });
        if (!instance) {
            throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Campaign approval instance not found");
        }
        return instance;
    });
}
function checkCampaignReadyForApproval(instance) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!instance.currentStage || !instance.currentStageId) {
            throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Campaign is not ready for approval");
        }
    });
}
function updateStageStatus(instance, user, action) {
    return __awaiter(this, void 0, void 0, function* () {
        const updatedCount = yield client_2.default.campaignStageStatus.updateMany({
            where: {
                instanceId: instance.id,
                stageId: instance.currentStageId,
            },
            data: {
                status: action,
                approvedById: user.id,
            },
        });
        if (updatedCount.count === 0) {
            throw new api_error_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to update stage status");
        }
    });
}
function handleRejection(instance) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client_2.default.campaignApprovalInstance.update({
            where: { id: instance.id },
            data: { status: client_1.StageStatus.REJECTED },
        });
    });
}
function getNextStage(instance) {
    const stages = instance.workflow.stages;
    const currentIndex = stages.findIndex((s) => s.id === instance.currentStageId);
    return currentIndex + 1 < stages.length ? stages[currentIndex + 1] : null;
}
function moveToNextStage(instance, nextStage) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client_2.default.$transaction([
            client_2.default.campaignStageStatus.upsert({
                where: {
                    instanceId_stageId: { instanceId: instance.id, stageId: nextStage.id },
                },
                update: { status: client_1.StageStatus.PENDING },
                create: {
                    instanceId: instance.id,
                    stageId: nextStage.id,
                    status: client_1.StageStatus.PENDING,
                },
            }),
            client_2.default.campaignApprovalInstance.update({
                where: { id: instance.id },
                data: { currentStageId: nextStage.id },
            }),
        ]);
    });
}
function handleFinalApproval(instance, user, campaignId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Mark instance as approved
        yield client_2.default.campaignApprovalInstance.update({
            where: { id: instance.id },
            data: { status: client_1.StageStatus.APPROVED },
        });
        // Fetch approved participants
        const participants = yield client_2.default.campaignParticipant.findMany({
            where: {
                campaignId,
                approvalStatus: client_1.ApprovalStatus.APPROVED,
                accountNumber: { not: null },
            },
            select: {
                id: true,
                totalAmount: true,
                accountNumber: true,
            },
        });
        if (!participants.length) {
            logger_1.default.warn(`No approved participants found for campaign ${campaignId}`);
            return;
        }
        // Calculate total amount
        const totalAmount = participants.reduce((sum, p) => sum + p.totalAmount, 0);
        // Fetch master account
        const account = yield client_2.default.account.findFirst({
            where: { companyId: user.companyId, isMaster: true, isActive: true },
            select: { accountNumber: true },
        });
        if (!account) {
            logger_1.default.error(`No active master account found for company ${user.companyId}`);
            throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Master account not found");
        }
        // Prepare payment job
        const paymentJobData = {
            debitAccount: account.accountNumber,
            totalAmount,
            bulkId: (0, uuid_1.v4)(),
            participantId: participants[0].id,
            creditTransactions: participants.map((p) => ({
                orderId: (0, uuid_1.v4)(),
                creditAccount: p.accountNumber,
                amount: p.totalAmount,
            })),
        };
        try {
            const parsedData = payment_1.paymentJobSchema.parse(paymentJobData);
            const job = yield queues_1.paymentQueue.add("create-payment", parsedData, {
                attempts: 3,
                backoff: { type: "exponential", delay: 1000 },
            });
            logger_1.default.info(`Payment job queued for campaign ${campaignId}`, {
                bulkId: parsedData.bulkId,
                jobId: job.id,
            });
        }
        catch (error) {
            logger_1.default.error(`Failed to queue payment job for campaign ${campaignId}`, {
                error,
            });
            throw new api_error_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Payment processing failed");
        }
    });
}
const rollbackCampaignApproval = (campaignId, user) => __awaiter(void 0, void 0, void 0, function* () {
    const instance = yield getCampaignApprovalInstance(campaignId);
    if (!instance)
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "There is no campaign approval");
    if (!instance.currentStageId) {
        yield updateStageStatus(instance, user, client_1.StageStatus.REJECTED);
        yield handleRejection(instance);
        yield campaign_service_1.default.updateCampaignStatus(campaignId, client_1.CampaignStatus["ACTIVE"]);
        return "Campaign rollback successfully";
    }
    if (instance && instance.currentStage && instance.currentStage.order !== 1)
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "You can't rollback approval");
    const campaignStageStatus = yield client_2.default.campaignStageStatus.findFirst({
        where: { id: instance.currentStageId },
    });
    if ((campaignStageStatus === null || campaignStageStatus === void 0 ? void 0 : campaignStageStatus.status) === client_1.StageStatus.APPROVED) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "You can't rollback approval");
    }
    yield updateStageStatus(instance, user, client_1.StageStatus.REJECTED);
    yield handleRejection(instance);
    yield campaign_service_1.default.updateCampaignStatus(campaignId, client_1.CampaignStatus["ACTIVE"]);
    return "Campaign rollback successfully";
});
exports.default = {
    createCampaignForApproval,
    approveOrRejectCampaignStage,
    rollbackCampaignApproval,
};
