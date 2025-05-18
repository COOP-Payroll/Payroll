import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import userService from "../services/user.service";
import exclude from '../utils/exclude';

const createUser = catchAsync(async (req, res) => {
  const { username, password, name, phoneNumber, role, departmentId, positionId, companyId } = req.body;
  const user = await userService.createUser(username, password, name, phoneNumber, role, companyId, positionId, departmentId);
  const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);
  res.status(httpStatus.CREATED).send({user: userWithoutPassword});
});


export default {
    createUser
}