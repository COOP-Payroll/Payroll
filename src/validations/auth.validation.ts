import Joi from 'joi';


const login = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
  })
};


export default {
  login
};
