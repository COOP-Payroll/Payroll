import httpStatus from "http-status";
import prisma from "../client";
import ApiError from "../utils/api-error";
import {
  Company,
  Level,
  Permission,
  Role,
  RolePermission,
} from "@prisma/client";
import userService from "../services/user.service";
import { invalidateUserPermissionCache } from "../middlewares/checkPermissions";
import { validatePermission } from "../utils/validate-permissions";

/**
 * Create role
 * @param {Object} name
 * @returns {Promise<Role>}
 */
const createRole = async (name: string, companyId: string): Promise<Role> => {
  if (await getRoleByName(name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role already defined");
  }

  return prisma.role.create({
    data: {
      name,
      companyId,
    },
  });
};

/**
 * Get all roles
 * @returns {Promise<Role[] | null>}
 */
const getRoles = async (): Promise<Role[] | null> => {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: { permission: true },
      },
      _count: {
        select: {
          userRoles: true,
        },
      },
    },
  });

  return roles;
};

/**
 * Get all permissions
 * @returns {Promise<Permission[] | null>}
 */
const getAllPermissions = async (): Promise<Permission[] | null> => {
  const permissions = await prisma.permission.findMany();
  return permissions;
};

/**
 * Get role by name
 * @param {string} name
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Role, Key> | null>}
 */
const getRoleByName = async <Key extends keyof Role>(
  name: string,
  keys: Key[] = ["id", "name", "createdAt", "updatedAt"] as Key[]
): Promise<Pick<Role, Key> | null> => {
  return prisma.role.findUnique({
    where: { name },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<Role, Key> | null>;
};

/**
 * Get role by id
 * @param {string} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Role, Key> | null>}
 */
const getRoleById = async <Key extends keyof Role>(
  id: string,
  keys: Key[] = ["id", "name", "createdAt", "updatedAt"] as Key[]
): Promise<Pick<Role, Key> | null> => {
  return prisma.role.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<Role, Key> | null>;
};

/**
 * Assign permissions to
 * @param {string} roleId
 * @param {Array<String>} permissions
 * @returns {Promise<Pick<RolePermission, Key> | null>}
 */
const assignPermissionToRoles = async (
  roleId: string,
  permissions: [string]
): Promise<string> => {
  if (!(await getRoleById(roleId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role not found");
  }
  await validatePermission(permissions);
  // Create new permission assignments
  const rolePermissions = permissions.map((permissionId: string) => ({
    roleId,
    permissionId,
  }));

  await prisma.rolePermission.createMany({
    data: rolePermissions,
    skipDuplicates: true, // just in case
  });
  return "Permissions assigned to role successfully";
};

/**
 * revoke permissions from role
 * @param {string} roleId
 * @param {Array<String>} permissions
 * @returns {Promise<string | null>}
 */
const updatePermissionFromRole = async (
  roleId: string,
  permissions: [string]
): Promise<string> => {
  if (!(await getRoleById(roleId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role not found");
  }

  // 2. Validate all permissionIds exist
  const existingPermissions = await prisma.permission.findMany({
    where: { id: { in: permissions } },
    select: { id: true },
  });

  const existingIds = new Set(existingPermissions.map((p) => p.id));
  const invalidIds = permissions.filter((id) => !existingIds.has(id));

  if (invalidIds.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Some permissionIds do not exist"
    );
  }

  await prisma.rolePermission.deleteMany({
    where: {
      roleId,
    },
  });

  const newPermissions = permissions.map((permissionId) => ({
    roleId,
    permissionId,
  }));

  if (newPermissions.length > 0) {
    await prisma.rolePermission.createMany({
      data: newPermissions,
      skipDuplicates: true,
    });
  }

  return "Permissions updated from role successfully";
};

/**
 * Assign permissions to
 * @param {string} name
 * @param {Array<String>} permissions
 * @returns {Promise<string | null>}
 */
const createAssignPermissionToRoles = async (
  name: string,
  permissions: [string],
  companyId: string
): Promise<string> => {
  await validatePermission(permissions);

  const role = await createRole(name, companyId);

  const rolePermissions = permissions.map((permissionId) => ({
    roleId: role.id,
    permissionId,
  }));

  await prisma.rolePermission.createMany({
    data: rolePermissions,
    skipDuplicates: true,
  });

  return "Permissions assigned to role successfully";
};

/**
 * Assign permissions to
 * @param {string} userId
 * @param {string} roleId
 * @returns {Promise<string | null>}
 */
const assignRoleToUser = async (
  userId: string,
  roleId: string
): Promise<string> => {
  const user = await userService.getUserById(userId);
  const role = await getRoleById(roleId);

  if (!user || !role) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role or User not found");
  }
  const existing = await prisma.userRole.findUnique({
    where: {
      userId_roleId: { userId, roleId },
    },
  });

  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User already has this role.");
  }

  await prisma.userRole.create({
    data: { userId, roleId },
  });

  invalidateUserPermissionCache(userId);

  return "Role assigned to user successfully";
};

/**
 * revoke roles from user
 * @param {string} userId
 * @param {string} roleId
 * @returns {Promise<string | null>}
 */
const revokeRoleFromUser = async (
  userId: string,
  roleId: string
): Promise<string> => {
  const user = await userService.getUserById(userId);
  const role = await getRoleById(roleId);

  if (!user || !role) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role or User not found");
  }

  await prisma.userRole.delete({
    where: {
      userId_roleId: { userId, roleId },
    },
  });

  invalidateUserPermissionCache(userId);

  return "Role removed from user";
};

const getRoleWithOutPermission = async (companyId: string) => {
  const result = await prisma.role.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
    },
  });

  return result;
};

export default {
  getRoleByName,
  createRole,
  getRoles,
  getAllPermissions,
  assignPermissionToRoles,
  createAssignPermissionToRoles,
  updatePermissionFromRole,
  assignRoleToUser,
  revokeRoleFromUser,
  getRoleWithOutPermission,
};
