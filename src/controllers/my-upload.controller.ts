import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";

const heydept = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  console.log("-----", files);
  res.status(httpStatus.CREATED).send({ message: "Department created" });
});

export default {
  heydept,
};
