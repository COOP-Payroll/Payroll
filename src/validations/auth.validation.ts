import Joi from "joi";

const passwordPolicy =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&#^()_+])[A-Za-z\d@$!%?&#^()_+]{8,}$/;

const login = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    // password: Joi.string().pattern(passwordPolicy).required().messages({
    //   "string.pattern.base":
    //     "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    // }),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    username: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export default {
  login,
  logout,
  forgotPassword,
  refreshTokens,
};
