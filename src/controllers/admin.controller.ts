import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import roleService from "../services/role.service";



const createRole = catchAsync(async (req, res) => {
  const { name } = req.body;
  const role = await roleService.createRole(name);
  res.status(httpStatus.CREATED).send({data: role, message: "Role Created Successfully"});
});

const getRoles = catchAsync(async (req, res) => {
    const roles = await roleService.getRoles();
    res.status(httpStatus.OK).send({data: roles, message: "Roles retrieved successfully"})
})

const getAllPermissions = catchAsync(async (req, res) => {
    const permissions = await roleService.getAllPermissions();
    res.status(httpStatus.OK).send({data: permissions, message: "Permissions retrieved successfully"})
})


export default {createRole, getRoles, getAllPermissions}