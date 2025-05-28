import jwt from "jsonwebtoken";
import moment, { Moment } from "moment";
import httpStatus from "http-status";
import { TokenType, Token } from "@prisma/client";
import config from "../config/config";
import userService from "./user.service";
import ApiError from "../utils/api-error";
import prisma from "../client";
import { AuthTokensResponse } from "../types/response";
import { AuthUser } from "../types/express";

/**
 * Generate token
 * @param {string} userId
 * @param {string} companyId
 * @param {boolean} isSuperAdmin
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (
  userId: string,
  companyId: string,
  isSuperAdmin: boolean,
  expires: Moment,
  type: TokenType,
  secret = config.jwt.secret
): string => {
  const payload = {
    sub: { userId, companyId, isSuperAdmin },
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {string} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (
  token: string,
  userId: string,
  expires: Moment,
  type: TokenType,
  blacklisted = false
): Promise<Token> => {
  const createdToken = prisma.token.create({
    data: {
      token,
      userId: userId,
      expires: expires.toDate(),
      type,
      blacklisted,
    },
  });
  return createdToken;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token: string, type: TokenType): Promise<Token> => {
  const payload = jwt.verify(token, config.jwt.secret);
  const userId = payload.sub as string;
  const tokenData = await prisma.token.findFirst({
    where: { token, type, userId, blacklisted: false },
  });
  if (!tokenData) {
    throw new Error("Token not found");
  }
  return tokenData;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<AuthTokensResponse>}
 */
const generateAuthTokens = async (user: {
  id: string;
  companyId: string;
  isSuperAdmin: boolean;
}): Promise<AuthTokensResponse> => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );
  const accessToken = generateToken(
    user.id,
    user.companyId,
    user.isSuperAdmin,
    accessTokenExpires,
    TokenType.ACCESS
  );

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const refreshToken = generateToken(
    user.id,
    user.companyId,
    user.isSuperAdmin,
    refreshTokenExpires,
    TokenType.REFRESH
  );
  await saveToken(
    refreshToken,
    user.id,
    refreshTokenExpires,
    TokenType.REFRESH
  );

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
// const generateResetPasswordToken = async (email: string): Promise<string> => {
//   const user = await userService.getUserByEmail(email);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
//   }
//   const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
//   const resetPasswordToken = generateToken(user.id as number, expires, TokenType.RESET_PASSWORD);
//   await saveToken(resetPasswordToken, user.id as number, expires, TokenType.RESET_PASSWORD);
//   return resetPasswordToken;
// };

export default {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  // generateResetPasswordToken,
};
