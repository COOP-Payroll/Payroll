"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const createWorkFlowSchema = {
    body: joi_1.default.object({
        name: joi_1.default.string()
            .required()
            .min(3)
            .max(100)
            .description("Name of the approval flow")
            .example("Campaign Approval Flow"),
        // companyId: Joi.string()
        //   .required()
        //   .description("Company ID associated with the flow"),
        stages: joi_1.default.array()
            .min(1)
            .required()
            .items(joi_1.default.object({
            name: joi_1.default.string()
                .required()
                .min(3)
                .max(50)
                .description("Name of the approval stage")
                .example("Manager Approval"),
            roles: joi_1.default.array()
                .min(1)
                .required()
                .items(joi_1.default.string()
                .description("Role required for approval at this stage")
                .example("role_manager"))
                .description("List of roles that can approve at this stage")
                .unique(), // ensures no duplicate roles in the array
        }))
            .description("Sequence of approval stages")
            .unique("name"), // ensures stage names are unique
    }),
};
const getStageUserActiveWorkflowSchema = {
    params: joi_1.default.object({
        workFlowId: joi_1.default.string().required(),
    }),
};
exports.default = { createWorkFlowSchema, getStageUserActiveWorkflowSchema };
