import httpStatus from 'http-status';
import prisma from '../client';
import ApiError from '../utils/api-error';
import { Company } from '@prisma/client';


/**
 * Create a company
 * @param {Object} companyCode
 * @returns {Promise<User>}
 */
const createCompany = async (
    organizationName: string,
    phoneNumber: string,
    companyCode: string,
    email?: string
): Promise<Company> => {

    //TODO: check if company registered 
    if(email && await getCompanyByEmail(email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    return prisma.company.create({
        data: {
            organizationName,
            phoneNumber,
            companyCode,
            email
        }
    })
}


/**
 * Get company by email
 * @param {string} email
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Company, Key> | null>}
 */
const getCompanyByEmail = async <Key extends keyof Company>(
  email: string,
  keys: Key[] = [
    'id',
    'email',
    'organizationName',
    'phoneNumber',
    'companyCode',
    'createdAt',
    'updatedAt'
  ] as Key[]
): Promise<Pick<Company, Key> | null> => {
  return prisma.company.findFirst({
    where: { email },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {})
  }) as Promise<Pick<Company, Key> | null>;
};


export default {createCompany}