import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import userService from "../services/user.service";
import exclude from "../utils/exclude";
import pick from "../utils/pick";
import { AuthUser } from "../types/express";

const createUser = catchAsync(async (req, res) => {
  const Authuser = req.user as AuthUser;
  const { name, phoneNumber, departmentId, positionId, roleId } = req.body;
  const companyId = Authuser.companyId;
  const user = await userService.createUser(
    roleId,
    name,
    phoneNumber,
    companyId,
    positionId,
    departmentId
  );
  const userWithoutPassword = exclude(user, [
    "password",
    "createdAt",
    "updatedAt",
  ]);
  res.status(httpStatus.CREATED).send({ data: userWithoutPassword });
});

const getUsers = catchAsync(async (req, res) => {
  // const filter = { companyId: 1 };
  const authUser = req.user as AuthUser;
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await userService.queryUsers(authUser.companyId, options);
  // res.send(result);
  res
    .status(httpStatus.CREATED)
    .send({ data: result, message: "User retrieved successfully" });
});

const getUserById = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const result = await userService.getUserById(userId);

  res
    .status(httpStatus.OK)
    .send({ data: result, message: "User retrieved successfully" });
});

export default {
  createUser,
  getUsers,
  getUserById,
};
