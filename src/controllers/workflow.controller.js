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
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const workFlow_service_1 = __importDefault(require("../services/workFlow.service"));
const createWorkflow = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, stages } = req.body;
    const user = req.user;
    const workflow = yield workFlow_service_1.default.createWorkflow(name, user.companyId, stages);
    res
        .status(http_status_1.default.CREATED)
        .send({ data: workflow, message: "workflow created Successfully" });
}));
const getActiveWorkflow = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId } = req.user;
    const activeWorkflow = yield workFlow_service_1.default.getActiveWorkflow(companyId);
    res
        .status(http_status_1.default.CREATED)
        .send({ data: activeWorkflow, message: "workflow retrieved Successfully" });
}));
const getWorkflowHistory = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyId } = req.user;
    const activeWorkflow = yield workFlow_service_1.default.getWorkflowHistory(companyId);
    res.status(http_status_1.default.CREATED).send({
        data: activeWorkflow,
        message: "workflow history retrieved Successfully",
    });
}));
const getStageUserActiveWorkflow = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { companyId } = req.user as AuthUser;
    const { workFlowId } = req.params;
    const getStageUserActiveWorkflow = yield workFlow_service_1.default.getStageUserActiveWorkflow(workFlowId);
    res.status(http_status_1.default.CREATED).send({
        data: getStageUserActiveWorkflow,
        message: "stage users retrieved Successfully",
    });
}));
exports.default = {
    createWorkflow,
    getActiveWorkflow,
    getWorkflowHistory,
    getStageUserActiveWorkflow,
};
