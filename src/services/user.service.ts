import httpStatus from 'http-status';
import { User, UserRole, Prisma, TokenType } from '@prisma/client';
import prisma from '../client';
import ApiError from '../utils/api-error';
import { encryptPassword, isPasswordMatch } from '../utils/encryption';
import exclude from '../utils/exclude';

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (
  username: string,
  password: string,
  name: string,
  phoneNumber: string,
  companyId: string,
  positionId: string,
  departmentId: string
): Promise<User> => {
  if (await getUserByUsername(username)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'username already taken');
  }
  return prisma.user.create({
    data: {
      username,
      name,
      phoneNumber,
      password: await encryptPassword(password),
      companyId,
      positionId,
      departmentId
    }
  });
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
    'id',
    'phoneNumber',
    'name',
    'password',
    'username',
    'companyId',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { username },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<User, Key> | null>;
};


/**
 * Get user by id
 * @param {string} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getUserById = async <Key extends keyof User>(
  id: string,
  keys: Key[] = [
    'id',
    'phoneNumber',
    'name',
    'password',
    'username',
    'companyId',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
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
): Promise<Omit<User, 'password'>> => {
  const user = await getUserByUsername(username, [
    'id',
    'username',
    'name',
    'password',
    'phoneNumber',
    'isSuperAdmin',
    'companyId',
    'positionId',
    'departmentId',
    'createdAt',
    'updatedAt'
  ]);
  if (!user || !(await isPasswordMatch(password, user.password as string))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect username or password');
  }
  return exclude(user, ['password']);
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
      blacklisted: false
    }
  });
  if (!refreshTokenData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
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
const queryUsers = async <Key extends keyof User>(
  filter: object,
  options: {
    limit?: string;
    page?: string;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  },
  keys: Key[] = [
    'id',
    'phoneNumber',
    'name',
    'isSuperAdmin',
    'companyId',
    'departmentId',
    'positionId',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<User, Key>[]> => {
  const page = options.page ? parseInt(options.page) : 1;
  const limit = options.limit ? parseInt(options.limit) : 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? 'desc';
  const users = await prisma.user.findMany({
    where: filter,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: page * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined
  });
  return users as Pick<User, Key>[];
};


export default {
    createUser,
    queryUsers,
    loginUserWithUsernameAndPassword,
    getUserByUsername,
    logout,
    getUserById
}