import httpStatus from 'http-status';
import { User, UserRole, Prisma } from '@prisma/client';
import prisma from '../client';
import ApiError from '../utils/api-error';
import { encryptPassword } from '../utils/encryption';

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
  role: UserRole = UserRole.STAFF,
  companyId: number,
  positionId: number,
  departmentId: number
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
      role,
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
    'role',
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


export default {
    createUser
}