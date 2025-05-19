import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import roleService from "../services/role.service";



const createRole = catchAsync(async (req, res) => {
  const { name } = req.body;
  const role = await roleService.createRole(name);
  res.status(httpStatus.CREATED).send({data: role, message: "Role Created Successfully"});
});


export default {createRole}