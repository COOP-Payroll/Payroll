"use strict";
// import { RequestHandler } from "express";
// import { Request, Response, NextFunction } from "express-serve-static-core";
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.default = catchAsync;
