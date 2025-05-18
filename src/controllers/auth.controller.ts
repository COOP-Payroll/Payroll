import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import userService from "../services/user.service";
import exclude from '../utils/exclude';
import tokenService from "../services/token.service";

const createUser = catchAsync(async (req, res) => {
  const { username, password, name, phoneNumber, role, departmentId, positionId, companyId } = req.body;
  const user = await userService.createUser(username, password, name, phoneNumber, role, companyId, positionId, departmentId);
  const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);
  res.status(httpStatus.CREATED).send({data: userWithoutPassword});
});


const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  const user = await userService.loginUserWithUsernameAndPassword(username, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});





export default {
    createUser,
    login
}