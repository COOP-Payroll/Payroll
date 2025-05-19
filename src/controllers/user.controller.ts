import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import userService from "../services/user.service";
import exclude from "../utils/exclude";
import pick from "../utils/pick";

const createUser = catchAsync(async (req, res) => {
  const {
    username,
    password,
    name,
    phoneNumber,
    departmentId,
    positionId,
    companyId,
  } = req.body;
  const user = await userService.createUser(
    username,
    password,
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
  const filter = { companyId: 1 };
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

export default {
  createUser,
  getUsers,
};
