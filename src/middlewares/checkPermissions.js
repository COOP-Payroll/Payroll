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
exports.invalidateUserPermissionCache = exports.checkPermission = void 0;
const client_1 = __importDefault(require("../client"));
const permissionCache = new Map();
const checkPermission = (required) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return; // Just return after sending response
        }
        const userId = user.id;
        const cachedPermissions = permissionCache.get(userId);
        if (cachedPermissions === null || cachedPermissions === void 0 ? void 0 : cachedPermissions.has(required)) {
            next();
            return;
        }
        try {
            const userWithRoles = yield client_1.default.user.findUnique({
                where: { id: userId },
                include: {
                    userRoles: {
                        include: {
                            role: {
                                include: {
                                    permissions: {
                                        include: { permission: true },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!userWithRoles) {
                res.status(403).json({ message: "Access Denied: User not found" });
                return;
            }
            const allPermissions = userWithRoles.userRoles.flatMap((userRole) => userRole.role.permissions.map((rp) => rp.permission.action_subject));
            const permissionSet = new Set(allPermissions);
            permissionCache.set(userId, permissionSet);
            if (permissionSet.has(required)) {
                next();
                return;
            }
            res.status(403).json({ message: "Access Denied: Missing permission" });
        }
        catch (err) {
            console.error("Error in permission check:", err);
            res.status(400).json({ message: "Internal server error" });
        }
    });
};
exports.checkPermission = checkPermission;
const invalidateUserPermissionCache = (userId) => {
    permissionCache.delete(userId);
};
exports.invalidateUserPermissionCache = invalidateUserPermissionCache;
