import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/api-error';
import { Company, Level, Role } from '@prisma/client';


/**
 * Create role
 * @param {Object} name
 * @returns {Promise<Role>}
 */
const createRole = async (
    name: string
): Promise<Role> => {

    if(await getRoleByName(name)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Role already defined');
    }

    return prisma.role.create({
        data: {
            name
        }
    })
}


/**
 * Get role by name
 * @param {string} name
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Role, Key> | null>}
 */
const getRoleByName = async <Key extends keyof Role>(
  name: string,
  keys: Key[] = [
    'id',
    'name',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Role, Key> | null> => {
  return prisma.role.findUnique({
    where: { name },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Role, Key> | null>;
};


export default {getRoleByName, createRole}