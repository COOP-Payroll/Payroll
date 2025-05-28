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
const client_1 = __importDefault(require("../client"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const createWorkflow = (name, companyId, stages) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield client_1.default.company.findUnique({
        where: { id: companyId },
    });
    // 1. Flatten all roleIds from all stages
    const allRoleIds = stages.flatMap((stage) => stage.roles);
    // 2. Get roles that exist in DB
    const existingRoles = yield client_1.default.role.findMany({
        where: { id: { in: allRoleIds } },
        select: { id: true },
    });
    const existingRoleIds = existingRoles.map((role) => role.id);
    // 3. Check if all provided roleIds are valid
    const invalidRoleIds = allRoleIds.filter((id) => !existingRoleIds.includes(id));
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Company not found");
    }
    if (invalidRoleIds.length > 0) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Invalid role IDs provided");
    }
    // const oldWorkflows = await prisma.approvalWorkflow.findMany({
    //   where: {companyId, isActive: true}
    // })
    // oldWorkflows.map(oldWorkflow => {
    // })
    const [deactivatedWorkflows, newWorkflow] = yield client_1.default.$transaction([
        client_1.default.approvalWorkflow.updateMany({
            where: {
                companyId,
                isActive: true,
            },
            data: {
                isActive: false,
            },
        }),
        client_1.default.approvalWorkflow.create({
            data: {
                companyId,
                isActive: true,
                name,
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
        }),
    ]);
    return newWorkflow;
    // const workflow = await prisma.approvalWorkflow.create({
    //   data: {
    //     name,
    //     companyId,
    //     stages: {
    //       create: stages.map((stage, index) => ({
    //         name: stage.name,
    //         order: index + 1,
    //         stageRoles: {
    //           create: stage.roles.map((roleId) => ({
    //             role: { connect: { id: roleId } },
    //           })),
    //         },
    //       })),
    //     },
    //   },
    //   include: {
    //     stages: {
    //       include: {
    //         stageRoles: true,
    //       },
    //     },
    //   },
    // });
    // return workflow;
});
const getActiveWorkflow = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield client_1.default.approvalWorkflow.findMany({
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
});
const getWorkflowHistory = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield client_1.default.approvalWorkflow.findMany({
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
});
const getStageUserActiveWorkflow = (workFlowId) => __awaiter(void 0, void 0, void 0, function* () {
    const stageUsers = yield client_1.default.approvalWorkflow.findMany({
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
});
exports.default = {
    createWorkflow,
    getActiveWorkflow,
    getWorkflowHistory,
    getStageUserActiveWorkflow,
};
