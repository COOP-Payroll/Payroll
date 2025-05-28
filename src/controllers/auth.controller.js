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
const token_service_1 = __importDefault(require("../services/token.service"));
const api_error_1 = __importDefault(require("../utils/api-error"));
// const createUser = catchAsync(async (req, res) => {
//   const {
//     username,
//     password,
//     name,
//     phoneNumber,
//     departmentId,
//     positionId,
//     companyId,
//   } = req.body;
//   const user = await userService.createUser(
//     username,
//     password,
//     name,
//     phoneNumber,
//     companyId,
//     positionId,
//     departmentId
//   );
//   const userWithoutPassword = exclude(user, [
//     "password",
//     "createdAt",
//     "updatedAt",
//   ]);
//   res.status(httpStatus.CREATED).send({ data: userWithoutPassword });
// });
const login = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield user_service_1.default.loginUserWithUsernameAndPassword(username, password);
    const permissions = yield user_service_1.default.getUserPermissions(user.id);
    const tokens = yield token_service_1.default.generateAuthTokens(user);
    res.send({ user, tokens, permissions });
}));
const logout = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_service_1.default.logout(req.body.refreshToken);
    res.status(http_status_1.default.NO_CONTENT).send();
}));
const me = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user)
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Please Login");
    res.status(http_status_1.default.OK).send({ data: user });
}));
const resetPassword = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    yield user_service_1.default.resetPassword(username, password);
    res.status(http_status_1.default.NO_CONTENT).send();
}));
const forgotPassword = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    yield user_service_1.default.forgotPassword(username);
    res.status(http_status_1.default.NO_CONTENT).send();
}));
exports.default = {
    // createUser,
    login,
    logout,
    me,
    resetPassword,
    forgotPassword,
};
