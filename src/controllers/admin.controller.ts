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

const assignPermissionToRoles = catchAsync(async (req, res) => {
    const { roleId } = req.params;
    const { permissions } = req.body;
    const assignedPermission = await roleService.assignPermissionToRoles(roleId, permissions);
    res.status(httpStatus.OK).send({data: [], message: assignedPermission})
})

const createAssignPermissionToRoles = catchAsync(async (req, res) => {
    const {name, permissions} = req.body;
    const assignedPermissionToRole = await roleService.createAssignPermissionToRoles(name, permissions);
    res.status(httpStatus.OK).send({data: [], message: assignedPermissionToRole})
})

const revokePermissionFromRole = catchAsync(async (req, res) => {
    const { roleId } = req.params;
    const { permissions } = req.body;
    const assignedPermission = await roleService.revokePermissionFromRole(roleId, permissions);
    res.status(httpStatus.OK).send({data: [], message: assignedPermission})
})

const assignRoleToUser = catchAsync(async (req, res) => {
    const { userId, roleId } = req.body;
    const assignedRoleToUser = await roleService.assignRoleToUser(userId, roleId);
    res.status(httpStatus.OK).send({data: [], message: assignedRoleToUser})
})


export default {createRole, getRoles, getAllPermissions, assignPermissionToRoles, createAssignPermissionToRoles, revokePermissionFromRole, assignRoleToUser}