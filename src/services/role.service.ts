import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/api-error';
import { Company, Level, Permission, Role } from '@prisma/client';


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
 * Get all roles
 * @returns {Promise<Role[] | null>}
 */
const getRoles = async(): Promise<Role[] | null> => {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });

  return roles
};


/**
 * Get all permissions
 * @returns {Promise<Permission[] | null>}
 */
const getAllPermissions = async(): Promise<Permission[] | null> => {
  const permissions = await prisma.permission.findMany();
  return permissions
};


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


export default {getRoleByName, createRole, getRoles, getAllPermissions}