import httpStatus from "http-status";
import { User, TokenType, Permission } from "@prisma/client";
import prisma from "../client";
import ApiError from "../utils/api-error";
import { encryptPassword, isPasswordMatch } from "../utils/encryption";
import exclude from "../utils/exclude";
import { AuthUser } from "../types/express";
import { generateRandomPassword, generateUsername } from "../utils/helper";
import roleService from "./role.service";

/**
 * Create a user with optimized database queries
 * @param {Object} userParams
 * @returns {Promise<User>}
 */
const createUser = async (
  roleId: string,
  name: string,
  phoneNumber: string,
  companyId: string,
  positionId: string,
  departmentId: string
): Promise<User> => {
  const username = await generateUsername(name);
  // const rawPassword = generateRandomPassword();
  const rawPassword = "SuperSecurePassword123";
  const [role, company, department, position] = await Promise.all([
    prisma.role.findUnique({ where: { id: roleId } }),
    prisma.company.findUnique({ where: { id: companyId } }),
    prisma.department.findUnique({ where: { id: departmentId } }),
    prisma.position.findUnique({ where: { id: positionId } }),
  ]);

  if (!role) throw new ApiError(httpStatus.BAD_REQUEST, "Role not found");
  if (!company) throw new ApiError(httpStatus.BAD_REQUEST, "Company not found");
  if (!department)
    throw new ApiError(httpStatus.BAD_REQUEST, "Department not found");
  if (!position)
    throw new ApiError(httpStatus.BAD_REQUEST, "Position not found");

  const hashedPassword = await encryptPassword(rawPassword);

  //TODO: implement send OTP

  const user = await prisma.user.create({
    data: {
      username,
      name,
      phoneNumber,
      password: hashedPassword,
      companyId,
      positionId,
      departmentId,
    },
  });

  await roleService.assignRoleToUser(user.id, roleId);

  return user;
};

/**
 * Get user's permissions (action_subject strings)
 * @param userId
 * @returns Promise<string[]> - array of permission strings in "action_subject" format
 */
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  const userWithRoles = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userWithRoles) return [];

  // Collect all unique permissions from all roles
  const permissions = new Set<string>();

  for (const userRole of userWithRoles.userRoles) {
    for (const rolePermission of userRole.role.permissions) {
      permissions.add(rolePermission.permission.action_subject);
    }
  }

  // If user is super admin, add all permissions wildcard
  if (userWithRoles.isSuperAdmin) {
    permissions.add("*:*");
  }

  return Array.from(permissions);
};

/**
 * Get user by username
 * @param {string} username
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getUserByUsername = async <Key extends keyof User>(
  username: string,
  keys: Key[] = [
    "id",
    "phoneNumber",
    "name",
    "password",
    "username",
    "companyId",
    "createdAt",
    "updatedAt",
  ] as Key[]
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { username },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<User, Key> | null>;
};

/**
 * Get user by id
 * @param {string} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getUserById = async <Key extends keyof User>(
  id: string
  // keys: Key[] = [
  //   "id",
  //   "phoneNumber",
  //   "name",
  //   "username",
  //   "companyId",
  //   "createdAt",
  //   "updatedAt",
  // ] as Key[]
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      phoneNumber: true,
      name: true,
      username: true,
      createdAt: true,
      updatedAt: true,
      department: { select: { id: true, deptName: true } },
      position: { select: { id: true, positionName: true } },
      userRoles: { select: { role: { select: { id: true, name: true } } } },
    },
    // select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<User, Key> | null>;
};

/**
 * Login with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Omit<User, 'password'>>}
 */
const loginUserWithUsernameAndPassword = async (
  username: string,
  password: string
): Promise<Omit<User, "password">> => {
  const user = await getUserByUsername(username, [
    "id",
    "username",
    "name",
    "password",
    "phoneNumber",
    "isFirstTimeLoggedIn",
    "isSuperAdmin",
    "companyId",
    "positionId",
    "departmentId",
    "createdAt",
    "updatedAt",
  ]);
  if (!user || !(await isPasswordMatch(password, user.password as string))) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Incorrect username or password"
    );
  }
  return exclude(user, ["password"]);
};

/**
 * query users with id
 * @param {string} id
 * @returns {Promise<AuthUser>}
 */
const getUserWithRoles = async (id: string): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) throw new ApiError(httpStatus.BAD_REQUEST, "Unauthorized");

  // if (!user) {
  //   return res.status(401).json({ message: "Unauthorized: Invalid user" });
  // }

  const permissions = new Set<string>();
  user.userRoles.forEach((userRole) => {
    userRole.role.permissions.forEach((rp) => {
      permissions.add(`${rp.permission.action}_${rp.permission.subject}`);
    });
  });

  const authUser = {
    id: user.id,
    name: user.name,
    isSuperAdmin: user.isSuperAdmin,
    companyId: user.companyId,
    roles: user.userRoles.map((ur) => ur.role.name),
    permissions: Array.from(permissions),
  };

  return authUser;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenData = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: TokenType.REFRESH,
      blacklisted: false,
    },
  });
  if (!refreshTokenData) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  await prisma.token.delete({ where: { id: refreshTokenData.id } });
};

/**
 * Query for users
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (
  // filter: object,
  companyId: string,
  options: {
    limit?: string;
    page?: string;
    sortBy?: string;
    sortType?: "asc" | "desc";
  }
  // keys: Key[] = [
  //   "id",
  //   "phoneNumber",
  //   "name",
  //   "isSuperAdmin",
  //   "companyId",
  //   "departmentId",
  //   "positionId",
  //   "createdAt",
  //   "updatedAt",
  // ] as Key[]
) => {
  const page = options.page ? parseInt(options.page) : 1;
  const limit = options.limit ? parseInt(options.limit) : 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        username: true,
        phoneNumber: true,
        department: { select: { id: true, deptName: true } },
        position: { select: { id: true, positionName: true } },
        userRoles: { select: { role: { select: { id: true, name: true } } } },
      },
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortType } : undefined,
    }),
    prisma.user.count(),
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    users,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Reset password for a user
 * @param {string} username - User's username
 * @param {string} password - New password
 * @returns {Promise<Omit<User, 'password'>>}
 */
const resetPassword = async (
  username: string,
  password: string
): Promise<Omit<User, "password">> => {
  const [hashedPassword, user] = await Promise.all([
    encryptPassword(password),
    prisma.user.findUnique({
      where: { username },
      select: { id: true },
    }),
  ]);

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isFirstTimeLoggedIn: false,
      password: hashedPassword,
    },
  });

  return exclude(updatedUser, ["password"]);
};

const forgotPassword = async (username: string) => {
  // const password = generateRandomPassword();
  const password = "SuperSecurePassword123";
  const [hashedPassword, user] = await Promise.all([
    encryptPassword(password),
    prisma.user.findUnique({
      where: { username },
      select: { id: true },
    }),
  ]);

  if (!user) throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist");

  //TODO: send new password through sms
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isFirstTimeLoggedIn: true,
      password: hashedPassword,
    },
  });

  return exclude(updatedUser, ["password"]);
};

export default {
  createUser,
  queryUsers,
  loginUserWithUsernameAndPassword,
  getUserByUsername,
  getUserPermissions,
  logout,
  getUserById,
  getUserWithRoles,
  resetPassword,
  forgotPassword,
};
