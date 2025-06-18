import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import userService from "../services/user.service";
import tokenService from "../services/token.service";
import { AuthUser } from "../types/express";
import ApiError from "../utils/api-error";

const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  const user = await userService.loginUserWithUsernameAndPassword(
    username,
    password
  );
  const permissions = await userService.getUserPermissions(user.id);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens, permissions });
});

const logout = catchAsync(async (req, res) => {
  await userService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const me = catchAsync(async (req, res) => {
  const user = req.user as AuthUser;
  if (!user) throw new ApiError(httpStatus.BAD_REQUEST, "Please Login");
  res.status(httpStatus.OK).send({ data: user });
});

const resetPassword = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  await userService.resetPassword(username, password);
  res.status(httpStatus.NO_CONTENT).send();
});

const forgotPassword = catchAsync(async (req, res) => {
  const { username } = req.body;
  await userService.forgotPassword(username);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await userService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

export default {
  login,
  logout,
  me,
  resetPassword,
  forgotPassword,
  refreshTokens,
};
