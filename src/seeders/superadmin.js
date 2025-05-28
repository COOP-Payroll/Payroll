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
const client_1 = __importDefault(require("../client"));
const encryption_1 = require("../utils/encryption");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const superadminUsername = "IT-head";
        const superadminPassword = "SuperSecurePassword123";
        const company = yield client_1.default.company.create({
            data: {
                organizationName: "DIRRE DAWA REGIONAL HEALTH BUREAU",
                phoneNumber: "1234567890",
                companyCode: "DRD-001",
                level: "MOHHEAD",
            },
        });
        // 1. Create or find superadmin role
        const superadminRole = yield client_1.default.role.upsert({
            where: { name: "superadmin" },
            update: {},
            create: {
                name: "superAdmin",
                companyId: company.id,
                //   description: "Has all permissions",
            },
        });
        // 2. Fetch all permissions
        const allPermissions = yield client_1.default.permission.findMany();
        // 3. Assign all permissions to superadmin role
        for (const permission of allPermissions) {
            yield client_1.default.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: superadminRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: superadminRole.id,
                    permissionId: permission.id,
                },
            });
        }
        // 4. Create or find superadmin user
        //   const hashedPassword = await bcrypt.hash(superadminPassword, 10);
        const superadminUser = yield client_1.default.user.upsert({
            where: { username: superadminUsername },
            update: {},
            create: {
                name: "Super Admin",
                password: yield (0, encryption_1.encryptPassword)(superadminPassword),
                phoneNumber: "0931653136",
                username: superadminUsername,
                companyId: company.id,
                isSuperAdmin: true,
            },
        });
        // 5. Assign superadmin role to superadmin user
        yield client_1.default.userRole.upsert({
            where: {
                userId_roleId: {
                    userId: superadminUser.id,
                    roleId: superadminRole.id,
                },
            },
            update: {},
            create: {
                userId: superadminUser.id,
                roleId: superadminRole.id,
            },
        });
        console.log("✅ Superadmin user and role seeded successfully.");
    });
}
main()
    .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield client_1.default.$disconnect();
}));
