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
const user_service_1 = __importDefault(require("../services/user.service"));
const checkPermissions_1 = require("../middlewares/checkPermissions");
/**
 * Create role
 * @param {Object} name
 * @returns {Promise<Role>}
 */
const createRole = (name, companyId) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield getRoleByName(name)) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Role already defined");
    }
    return client_1.default.role.create({
        data: {
            name,
            companyId,
        },
    });
});
/**
 * Get all roles
 * @returns {Promise<Role[] | null>}
 */
const getRoles = () => __awaiter(void 0, void 0, void 0, function* () {
    const roles = yield client_1.default.role.findMany({
        include: {
            permissions: {
                include: { permission: true },
            },
        },
    });
    return roles;
});
/**
 * Get all permissions
 * @returns {Promise<Permission[] | null>}
 */
const getAllPermissions = () => __awaiter(void 0, void 0, void 0, function* () {
    const permissions = yield client_1.default.permission.findMany();
    return permissions;
});
/**
 * Get role by name
 * @param {string} name
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Role, Key> | null>}
 */
const getRoleByName = (name_1, ...args_1) => __awaiter(void 0, [name_1, ...args_1], void 0, function* (name, keys = ["id", "name", "createdAt", "updatedAt"]) {
    return client_1.default.role.findUnique({
        where: { name },
        select: keys.reduce((obj, k) => (Object.assign(Object.assign({}, obj), { [k]: true })), {}),
    });
});
/**
 * Get role by id
 * @param {string} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Role, Key> | null>}
 */
const getRoleById = (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, keys = ["id", "name", "createdAt", "updatedAt"]) {
    return client_1.default.role.findUnique({
        where: { id },
        select: keys.reduce((obj, k) => (Object.assign(Object.assign({}, obj), { [k]: true })), {}),
    });
});
/**
 * Assign permissions to
 * @param {string} roleId
 * @param {Array<String>} permissions
 * @returns {Promise<Pick<RolePermission, Key> | null>}
 */
const assignPermissionToRoles = (roleId, permissions) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield getRoleById(roleId))) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Role not found");
    }
    // Create new permission assignments
    const rolePermissions = permissions.map((permissionId) => ({
        roleId,
        permissionId,
    }));
    yield client_1.default.rolePermission.createMany({
        data: rolePermissions,
        skipDuplicates: true, // just in case
    });
    return "Permissions assigned to role successfully";
});
/**
 * revoke permissions from role
 * @param {string} roleId
 * @param {Array<String>} permissions
 * @returns {Promise<string | null>}
 */
const updatePermissionFromRole = (roleId, permissions) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield getRoleById(roleId))) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Role not found");
    }
    // 2. Validate all permissionIds exist
    const existingPermissions = yield client_1.default.permission.findMany({
        where: { id: { in: permissions } },
        select: { id: true },
    });
    const existingIds = new Set(existingPermissions.map((p) => p.id));
    const invalidIds = permissions.filter((id) => !existingIds.has(id));
    if (invalidIds.length > 0) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Some permissionIds do not exist");
    }
    yield client_1.default.rolePermission.deleteMany({
        where: {
            roleId,
        },
    });
    const newPermissions = permissions.map((permissionId) => ({
        roleId,
        permissionId,
    }));
    if (newPermissions.length > 0) {
        yield client_1.default.rolePermission.createMany({
            data: newPermissions,
            skipDuplicates: true,
        });
    }
    return "Permissions updated from role successfully";
});
/**
 * Assign permissions to
 * @param {string} name
 * @param {Array<String>} permissions
 * @returns {Promise<string | null>}
 */
const createAssignPermissionToRoles = (name, permissions, companyId) => __awaiter(void 0, void 0, void 0, function* () {
    // if(!(await getRoleById(roleId))) {
    //     throw new ApiError(httpStatus.BAD_REQUEST, "Role not found")
    // }
    const role = yield createRole(name, companyId);
    // Create new permission assignments
    const rolePermissions = permissions.map((permissionId) => ({
        roleId: role.id,
        permissionId,
    }));
    yield client_1.default.rolePermission.createMany({
        data: rolePermissions,
        skipDuplicates: true, // just in case
    });
    return "Permissions assigned to role successfully";
});
/**
 * Assign permissions to
 * @param {string} userId
 * @param {string} roleId
 * @returns {Promise<string | null>}
 */
const assignRoleToUser = (userId, roleId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_service_1.default.getUserById(userId);
    const role = yield getRoleById(roleId);
    if (!user || !role) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Role or User not found");
    }
    const existing = yield client_1.default.userRole.findUnique({
        where: {
            userId_roleId: { userId, roleId },
        },
    });
    if (existing) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "User already has this role.");
    }
    yield client_1.default.userRole.create({
        data: { userId, roleId },
    });
    (0, checkPermissions_1.invalidateUserPermissionCache)(userId);
    return "Role assigned to user successfully";
});
/**
 * revoke roles from user
 * @param {string} userId
 * @param {string} roleId
 * @returns {Promise<string | null>}
 */
const revokeRoleFromUser = (userId, roleId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_service_1.default.getUserById(userId);
    const role = yield getRoleById(roleId);
    if (!user || !role) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Role or User not found");
    }
    yield client_1.default.userRole.delete({
        where: {
            userId_roleId: { userId, roleId },
        },
    });
    (0, checkPermissions_1.invalidateUserPermissionCache)(userId);
    return "Role removed from user";
});
const getRoleWithOutPermission = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield client_1.default.role.findMany({
        where: { companyId },
        select: {
            id: true,
            name: true,
        },
    });
    return result;
});
exports.default = {
    getRoleByName,
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
