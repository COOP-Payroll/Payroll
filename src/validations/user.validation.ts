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
    // role: Joi.string().required().valid(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.SUPERADMIN),
    departmentId: Joi.string(),
    positionId: Joi.string(),
    companyId: Joi.string().required()
  })
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    // role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

export default {
    createUser,
    getUsers
}