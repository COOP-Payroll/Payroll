import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import userService from "../services/user.service";
import exclude from "../utils/exclude";
import tokenService from "../services/token.service";
import { AuthUser } from "../types/express";
import ApiError from "../utils/api-error";

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

export default {
  // createUser,
  login,
  logout,
  me,
};
