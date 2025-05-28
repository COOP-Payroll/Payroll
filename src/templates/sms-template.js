"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountCreatedMessage = accountCreatedMessage;
exports.forgotPasswordMessage = forgotPasswordMessage;
/**
 * Generates an SMS message for new account creation.
 *
 * @param name - Full name of the user
 * @param username - Username of the user
 * @param password - Raw password
 * @returns Personalized SMS message
 */
function accountCreatedMessage(name, username, password) {
    return `Dear ${name}, your account has been created successfully.\nUsername: ${username}\nPassword: ${password}\nThank you for using CoopPayroll.`;
}
/**
 * Generates an SMS message for forgot password.
 *
 * @param name - Full name of the user
 * @param username - Username of the user
 * @param password - Raw password
 * @returns Personalized SMS message
 */
function forgotPasswordMessage(name, username, password) {
    return `Dear ${name}, your password has been resetted successfully.\nUsername: ${username}\nPassword: ${password}\nThank you for using CoopPayroll.`;
}
