"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomPassword = exports.generateUsername = void 0;
const client_1 = __importDefault(require("../client"));
const generateUsername = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const base = name
        .split(" ")
        .map((part, i) => (i === 0 ? part : part[0]))
        .join("")
        .toLowerCase();
    let username = base;
    let count = 1;
    while (yield client_1.default.user.findUnique({ where: { username } })) {
        count++;
        username = `${base}${count}`;
    }
    return username;
});
exports.generateUsername = generateUsername;
const generateRandomPassword = (length = 8) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};
exports.generateRandomPassword = generateRandomPassword;
