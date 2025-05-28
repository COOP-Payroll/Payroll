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
exports.getUserPermissions = void 0;
const http_status_1 = __importDefault(require("http-status"));
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
const client_2 = __importDefault(require("../client"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const encryption_1 = require("../utils/encryption");
const exclude_1 = __importDefault(require("../utils/exclude"));
const helper_1 = require("../utils/helper");
const role_service_1 = __importDefault(require("./role.service"));
const logger_1 = __importDefault(require("../config/logger"));
const queues_1 = require("../queues");
const format_phone_number_1 = require("../utils/format-phone-number");
const sms_template_1 = require("../templates/sms-template");
/**
 * Create a user with optimized database queries
 * @param {Object} userParams
 * @returns {Promise<User>}
 */
const createUser = (roleId, name, phoneNumber, companyId, positionId, departmentId) => __awaiter(void 0, void 0, void 0, function* () {
    const username = yield (0, helper_1.generateUsername)(name);
    // const rawPassword = generateRandomPassword();
    const rawPassword = "SuperSecurePassword123";
    const [role, company, department, position] = yield Promise.all([
        client_2.default.role.findUnique({ where: { id: roleId } }),
        client_2.default.company.findUnique({ where: { id: companyId } }),
        client_2.default.department.findUnique({ where: { id: departmentId } }),
        client_2.default.position.findUnique({ where: { id: positionId } }),
    ]);
    if (!role)
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Role not found");
    if (!company)
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Company not found");
    if (!department)
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Department not found");
    if (!position)
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Position not found");
    const hashedPassword = yield (0, encryption_1.encryptPassword)(rawPassword);
    const user = yield client_2.default.user.create({
        data: {
            username,
            name,
            phoneNumber,
            password: hashedPassword,
            companyId,
            positionId,
            departmentId,
        },
    });
    yield role_service_1.default.assignRoleToUser(user.id, roleId);
    try {
        const message = (0, sms_template_1.accountCreatedMessage)(user.name, user.username, rawPassword);
        const data = {
            phoneNumber: (0, format_phone_number_1.formatPhoneNumberForSms)(phoneNumber),
            message,
            jobId: (0, uuid_1.v4)(),
            type: "createAccount",
        };
        const job = yield queues_1.smsQueue.add("send-sms", data, {
            attempts: 3,
            backoff: { type: "exponential", delay: 1000 },
        });
        logger_1.default.info(`SMS job queued for user ${user.id}`, {
            bulkId: data.phoneNumber,
            jobId: job.id,
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to queue send sms job for createUser ${user.id}`, {
            error,
        });
        throw new api_error_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "send create account sms processing failed");
    }
    return user;
});
/**
 * Get user's permissions (action_subject strings)
 * @param userId
 * @returns Promise<string[]> - array of permission strings in "action_subject" format
 */
const getUserPermissions = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userWithRoles = yield client_2.default.user.findUnique({
        where: { id: userId },
        include: {
            userRoles: {
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!userWithRoles)
        return [];
    // Collect all unique permissions from all roles
    const permissions = new Set();
    for (const userRole of userWithRoles.userRoles) {
        for (const rolePermission of userRole.role.permissions) {
            permissions.add(rolePermission.permission.action_subject);
        }
    }
    // If user is super admin, add all permissions wildcard
    if (userWithRoles.isSuperAdmin) {
        permissions.add("*:*");
    }
    return Array.from(permissions);
});
exports.getUserPermissions = getUserPermissions;
/**
 * Get user by username
 * @param {string} username
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getUserByUsername = (username_1, ...args_1) => __awaiter(void 0, [username_1, ...args_1], void 0, function* (username, keys = [
    "id",
    "phoneNumber",
    "name",
    "password",
    "username",
    "companyId",
    "createdAt",
    "updatedAt",
]) {
    return client_2.default.user.findUnique({
        where: { username },
        select: keys.reduce((obj, k) => (Object.assign(Object.assign({}, obj), { [k]: true })), {}),
    });
});
/**
 * Get user by id
 * @param {string} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getUserById = (id
// keys: Key[] = [
//   "id",
//   "phoneNumber",
//   "name",
//   "username",
//   "companyId",
//   "createdAt",
//   "updatedAt",
// ] as Key[]
) => __awaiter(void 0, void 0, void 0, function* () {
    return client_2.default.user.findUnique({
        where: { id },
        select: {
            id: true,
            phoneNumber: true,
            name: true,
            username: true,
            createdAt: true,
            updatedAt: true,
            department: { select: { id: true, deptName: true } },
            position: { select: { id: true, positionName: true } },
            userRoles: { select: { role: { select: { id: true, name: true } } } },
        },
        // select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    });
});
/**
 * Login with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Omit<User, 'password'>>}
 */
const loginUserWithUsernameAndPassword = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield getUserByUsername(username, [
        "id",
        "username",
        "name",
        "password",
        "phoneNumber",
        "isFirstTimeLoggedIn",
        "isSuperAdmin",
        "companyId",
        "positionId",
        "departmentId",
        "createdAt",
        "updatedAt",
    ]);
    if (!user || !(yield (0, encryption_1.isPasswordMatch)(password, user.password))) {
        throw new api_error_1.default(http_status_1.default.UNAUTHORIZED, "Incorrect username or password");
    }
    return (0, exclude_1.default)(user, ["password"]);
});
/**
 * query users with id
 * @param {string} id
 * @returns {Promise<AuthUser>}
 */
const getUserWithRoles = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield client_2.default.user.findUnique({
        where: { id },
        include: {
            userRoles: {
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!user)
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Unauthorized");
    // if (!user) {
    //   return res.status(401).json({ message: "Unauthorized: Invalid user" });
    // }
    const permissions = new Set();
    user.userRoles.forEach((userRole) => {
        userRole.role.permissions.forEach((rp) => {
            permissions.add(`${rp.permission.action}_${rp.permission.subject}`);
        });
    });
    const authUser = {
        id: user.id,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin,
        companyId: user.companyId,
        roles: user.userRoles.map((ur) => ur.role.name),
        permissions: Array.from(permissions),
    };
    return authUser;
});
/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
const logout = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshTokenData = yield client_2.default.token.findFirst({
        where: {
            token: refreshToken,
            type: client_1.TokenType.REFRESH,
            blacklisted: false,
        },
    });
    if (!refreshTokenData) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Not found");
    }
    yield client_2.default.token.delete({ where: { id: refreshTokenData.id } });
});
/**
 * Query for users
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = (
// filter: object,
companyId, options
// keys: Key[] = [
//   "id",
//   "phoneNumber",
//   "name",
//   "isSuperAdmin",
//   "companyId",
//   "departmentId",
//   "positionId",
//   "createdAt",
//   "updatedAt",
// ] as Key[]
) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const page = options.page ? parseInt(options.page) : 1;
    const limit = options.limit ? parseInt(options.limit) : 10;
    const skip = (page - 1) * limit;
    const sortBy = options.sortBy;
    const sortType = (_a = options.sortType) !== null && _a !== void 0 ? _a : "desc";
    const [users, total] = yield Promise.all([
        client_2.default.user.findMany({
            where: { companyId },
            select: {
                id: true,
                name: true,
                username: true,
                phoneNumber: true,
                department: { select: { id: true, deptName: true } },
                position: { select: { id: true, positionName: true } },
                userRoles: { select: { role: { select: { id: true, name: true } } } },
            },
            skip,
            take: limit,
            orderBy: sortBy ? { [sortBy]: sortType } : undefined,
        }),
        client_2.default.user.count(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        users,
        meta: {
            total,
            page,
            limit,
            totalPages,
        },
    };
});
/**
 * Reset password for a user
 * @param {string} username - User's username
 * @param {string} password - New password
 * @returns {Promise<Omit<User, 'password'>>}
 */
const resetPassword = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    const [hashedPassword, user] = yield Promise.all([
        (0, encryption_1.encryptPassword)(password),
        client_2.default.user.findUnique({
            where: { username },
            select: { id: true },
        }),
    ]);
    if (!user) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "User does not exist");
    }
    const updatedUser = yield client_2.default.user.update({
        where: { id: user.id },
        data: {
            isFirstTimeLoggedIn: false,
            password: hashedPassword,
        },
    });
    return (0, exclude_1.default)(updatedUser, ["password"]);
});
const forgotPassword = (username) => __awaiter(void 0, void 0, void 0, function* () {
    // const password = generateRandomPassword();
    const password = "SuperSecurePassword123";
    const [hashedPassword, user] = yield Promise.all([
        (0, encryption_1.encryptPassword)(password),
        client_2.default.user.findUnique({
            where: { username },
            select: { id: true },
        }),
    ]);
    if (!user)
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "User does not exist");
    const updatedUser = yield client_2.default.user.update({
        where: { id: user.id },
        data: {
            isFirstTimeLoggedIn: true,
            password: hashedPassword,
        },
    });
    try {
        const message = (0, sms_template_1.forgotPasswordMessage)(updatedUser.name, updatedUser.username, password);
        const data = {
            phoneNumber: (0, format_phone_number_1.formatPhoneNumberForSms)(updatedUser.phoneNumber),
            message,
            jobId: (0, uuid_1.v4)(),
            type: "forgotPassword",
        };
        const job = yield queues_1.smsQueue.add("send-sms", data, {
            attempts: 3,
            backoff: { type: "exponential", delay: 1000 },
        });
        logger_1.default.info(`SMS job queued for user ${user.id}`, {
            bulkId: data.phoneNumber,
            jobId: job.id,
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to queue send sms job for forgotPassword ${user.id}`, {
            error,
        });
        throw new api_error_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "send forgot SMS processing failed");
    }
    return (0, exclude_1.default)(updatedUser, ["password"]);
});
exports.default = {
    createUser,
    queryUsers,
    loginUserWithUsernameAndPassword,
    getUserByUsername,
    getUserPermissions: exports.getUserPermissions,
    logout,
    getUserById,
    getUserWithRoles,
    resetPassword,
    forgotPassword,
};
