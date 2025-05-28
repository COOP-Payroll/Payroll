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
const role_service_1 = __importDefault(require("../services/role.service"));
const createRole = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    const authUser = req.user;
    const role = yield role_service_1.default.createRole(name, authUser.companyId);
    res
        .status(http_status_1.default.CREATED)
        .send({ data: role, message: "Role Created Successfully" });
}));
const getRoles = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield role_service_1.default.getRoles();
    res
        .status(http_status_1.default.OK)
        .send({ data: roles, message: "Roles retrieved successfully" });
}));
const getAllPermissions = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const permissions = yield role_service_1.default.getAllPermissions();
    res
        .status(http_status_1.default.OK)
        .send({ data: permissions, message: "Permissions retrieved successfully" });
}));
const assignPermissionToRoles = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roleId } = req.params;
    const { permissions } = req.body;
    const assignedPermission = yield role_service_1.default.assignPermissionToRoles(roleId, permissions);
    res.status(http_status_1.default.OK).send({ data: [], message: assignedPermission });
}));
const createAssignPermissionToRoles = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, permissions } = req.body;
    const authUser = req.user;
    const assignedPermissionToRole = yield role_service_1.default.createAssignPermissionToRoles(name, permissions, authUser.companyId);
    res
        .status(http_status_1.default.OK)
        .send({ data: [], message: assignedPermissionToRole });
}));
const updatePermissionFromRole = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roleId } = req.params;
    const { permissions } = req.body;
    const assignedPermission = yield role_service_1.default.updatePermissionFromRole(roleId, permissions);
    res.status(http_status_1.default.OK).send({ data: [], message: assignedPermission });
}));
const assignRoleToUser = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, roleId } = req.body;
    const assignedRoleToUser = yield role_service_1.default.assignRoleToUser(userId, roleId);
    res.status(http_status_1.default.OK).send({ data: [], message: assignedRoleToUser });
}));
const revokeRoleFromUser = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, roleId } = req.body;
    const revokeRoleFromUser = yield role_service_1.default.revokeRoleFromUser(userId, roleId);
    res.status(http_status_1.default.OK).send({ data: [], message: revokeRoleFromUser });
}));
const getRoleWithOutPermission = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authUser = req.user;
    const result = yield role_service_1.default.getRoleWithOutPermission(authUser.companyId);
    res
        .status(http_status_1.default.OK)
        .send({ data: result, message: "Role retrieved successfully" });
}));
exports.default = {
    createRole,
    getRoles,
    getAllPermissions,
    assignPermissionToRoles,
    createAssignPermissionToRoles,
    updatePermissionFromRole,
    assignRoleToUser,
    revokeRoleFromUser,
    getRoleWithOutPermission,
};
