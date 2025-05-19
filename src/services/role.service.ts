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

/**
 * Create role
 * @param {Object} name
 * @returns {Promise<Role>}
 */
const createRole = async (name: string): Promise<Role> => {
  if (await getRoleByName(name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role already defined");
  }

  return prisma.role.create({
    data: {
      name,
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
const revokePermissionFromRole = async (
  roleId: string,
  permissions: [string]
): Promise<string> => {
  if (!(await getRoleById(roleId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role not found");
  }

  await prisma.rolePermission.deleteMany({
    where: {
      roleId,
      permissionId: { in: permissions },
    },
  });

  return "Permissions revoked from role successfully";
};

/**
 * Assign permissions to
 * @param {string} name
 * @param {Array<String>} permissions
 * @returns {Promise<string | null>}
 */
const createAssignPermissionToRoles = async (
  name: string,
  permissions: [string]
): Promise<string> => {
  // if(!(await getRoleById(roleId))) {
  //     throw new ApiError(httpStatus.BAD_REQUEST, "Role not found")
  // }
  const role = await createRole(name);
  // Create new permission assignments
  const rolePermissions = permissions.map((permissionId: string) => ({
    roleId: role.id,
    permissionId,
  }));

  await prisma.rolePermission.createMany({
    data: rolePermissions,
    skipDuplicates: true, // just in case
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

export default {
  getRoleByName,
  createRole,
  getRoles,
  getAllPermissions,
  assignPermissionToRoles,
  createAssignPermissionToRoles,
  revokePermissionFromRole,
  assignRoleToUser,
  revokeRoleFromUser,
};
