import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import accountService from "../services/account.service";
import { AuthUser } from "../types/express";
import path from "path";
import mime from "mime-types";
import ApiError from "../utils/api-error";

const createAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const file = req.file;

  const account = await accountService.createAccount({
    ...req.body,
    companyId: user.companyId,
    letter: file && {
      fileName: file.originalname,
      filePath: path.basename(file.path),
      mimeType: file.mimetype || mime.lookup(file.originalname) || undefined,
      size: file.size,
    },
  });

  res.status(httpStatus.CREATED).json({
    message: "Account created",
    data: account,
  });
});

const getAllAccounts = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const accounts = await accountService.getAllAccounts(user.companyId);
  res.status(httpStatus.OK).json({ data: accounts });
});

const getAccountById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const account = await accountService.getAccountById(
    req.params.id,
    user.companyId
  );
  res.status(httpStatus.OK).json({ data: account });
});

const updateAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const file = req.file;

  const account = await accountService.updateAccount(
    req.params.id,
    user.companyId,
    {
      ...req.body,
      letter: file && {
        fileName: file.originalname,
        filePath: path.basename(file.path),
        mimeType: file.mimetype || mime.lookup(file.originalname) || undefined,
        size: file.size,
      },
    }
  );

  res.status(httpStatus.OK).json({
    message: "Account updated successfully",
    data: account,
  });
});

const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const deleted = await accountService.deleteAccount(
    req.params.id,
    user.companyId
  );
  res.status(httpStatus.OK).json({
    message: "Account deleted successfully",
    data: deleted,
  });
});

const assignMasterAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const files = req.files as Express.Multer.File[]; // since upload.array() returns a flat array
  const file = files?.[0]; // First (and only) file from the "letter" field

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Letter file is required");
  }

  const account = await accountService.assignMasterAccount(
    req.params.id,
    user.companyId,
    file && {
      fileName: file.originalname,
      filePath: path.basename(file.path),
      mimeType: file.mimetype || mime.lookup(file.originalname) || undefined,
      size: file.size,
    }
  );
  res.status(httpStatus.OK).json({
    message: "Master account assigned successfully",
    data: account,
  });
});

export default {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  assignMasterAccount,
};
