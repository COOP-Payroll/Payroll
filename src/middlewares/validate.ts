import httpStatus from "http-status";
import ApiError from "../utils/api-error";
import { NextFunction, Request, Response } from "express";
import pick from "../utils/pick";
import Joi from "joi";

const validate =
  (schema: Record<string, Joi.Schema>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const validSchema = pick(schema, ["params", "query", "body"]);
    const requestData = pick(req, Object.keys(validSchema));

    if (Object.keys(validSchema).length === 0) {
      return next();
    }

    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validate(requestData);

    if (error) {
      const details = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));
      console.log("validatio", details);
      return next(
        new ApiError(httpStatus.BAD_REQUEST, "Validation Error", false, details)
      );
    }

    Object.assign(req, value);
    return next();
  };

export default validate;
