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
exports.jwtStrategy = void 0;
const client_1 = __importDefault(require("../client"));
const passport_jwt_1 = require("passport-jwt");
const config_1 = __importDefault(require("./config"));
const client_2 = require("@prisma/client");
const jwtOptions = {
    secretOrKey: config_1.default.jwt.secret,
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
};
const jwtVerify = (payload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (payload.type !== client_2.TokenType.ACCESS) {
            throw new Error("Invalid token type");
        }
        // const user = await prisma.user.findUnique({
        //   where: { id: payload.sub.userId },
        //   include: {
        //     userRoles: {
        //       include: {
        //         role: {
        //           include: {
        //             permissions: {
        //               include: {
        //                 permission: true,
        //               },
        //             },
        //           },
        //         },
        //       },
        //     },
        //   },
        // });
        // if (!user) {
        //   return done(null, false);
        // }
        // // Flatten permissions from all roles
        // const permissions = new Set<string>();
        // user.userRoles.forEach((userRole) => {
        //   userRole.role.permissions.forEach((rp) => {
        //     const p = rp.permission;
        //     permissions.add(p.action_subject); // e.g. view_campaign
        //   });
        // });
        const user = yield client_1.default.user.findUnique({
            where: { id: payload.sub.userId },
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
        if (!user) {
            return done(null, false);
        }
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
        done(null, authUser);
    }
    catch (error) {
        done(error, false);
    }
});
exports.jwtStrategy = new passport_jwt_1.Strategy(jwtOptions, jwtVerify);
