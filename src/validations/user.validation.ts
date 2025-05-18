import { UserRole } from '@prisma/client';
import Joi from 'joi';
import { password } from './custom.validation';

const createUser = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
     phoneNumber: Joi.string() .regex(/^[0-9]{10}$/)
                .messages({
                    'string.pattern.base': 'Phone number must be 10 digits.'
                }).required(),
    role: Joi.string().required().valid(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.SUPERADMIN),
    departmentId: Joi.number(),
    positionId: Joi.number(),
    companyId: Joi.number().required()
  })
};

export default {
    createUser
}