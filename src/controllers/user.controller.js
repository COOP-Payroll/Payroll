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
const user_service_1 = __importDefault(require("../services/user.service"));
const exclude_1 = __importDefault(require("../utils/exclude"));
const pick_1 = __importDefault(require("../utils/pick"));
const createUser = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Authuser = req.user;
    const { name, phoneNumber, departmentId, positionId, roleId } = req.body;
    const companyId = Authuser.companyId;
    const user = yield user_service_1.default.createUser(roleId, name, phoneNumber, companyId, positionId, departmentId);
    const userWithoutPassword = (0, exclude_1.default)(user, [
        "password",
        "createdAt",
        "updatedAt",
    ]);
    res.status(http_status_1.default.CREATED).send({ data: userWithoutPassword });
}));
const getUsers = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const filter = { companyId: 1 };
    const authUser = req.user;
    const options = (0, pick_1.default)(req.query, ["sortBy", "limit", "page"]);
    const result = yield user_service_1.default.queryUsers(authUser.companyId, options);
    // res.send(result);
    res
        .status(http_status_1.default.CREATED)
        .send({ data: result, message: "User retrieved successfully" });
}));
const getUserById = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const result = yield user_service_1.default.getUserById(userId);
    res
        .status(http_status_1.default.OK)
        .send({ data: result, message: "User retrieved successfully" });
}));
exports.default = {
    createUser,
    getUsers,
    getUserById,
};
