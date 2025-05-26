import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import accountService, { LetterFile } from "../services/account.service";
import { AuthUser } from "../types/express";
import path from "path";
import mime from "mime-types";
import ApiError from "../utils/api-error";

// Helper to map multer files to LetterFile[]
function mapFilesToLetterFiles(
  files: Express.Multer.File[] = []
): LetterFile[] {
  return files.map((file) => ({
    fileName: file.originalname,
    filePath: path.basename(file.path),
    mimeType: file.mimetype || mime.lookup(file.originalname) || undefined,
    size: file.size,
  }));
}

const createAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const files = req.files as Express.Multer.File[]; // upload.array("documents")
  const documents = mapFilesToLetterFiles(files);

  const account = await accountService.createAccount({
    accountNumber: req.body.accountNumber,
    companyId: user.companyId,
    documents,
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
  const files = req.files as Express.Multer.File[];
  const documents = mapFilesToLetterFiles(files);

  const account = await accountService.updateAccount(
    req.params.id,
    user.companyId,
    {
      accountNumber: req.body.accountNumber,
      documents: documents.length ? documents : undefined,
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
    message: "Account deleted (soft)",
    data: deleted,
  });
});

export const assignMasterAccount = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;

    // 1) Ensure multer ran and gave you files
    // if (!req.files || !(req.files as Express.Multer.File[]).length) {
    //   throw new ApiError(
    //     httpStatus.BAD_REQUEST,
    //     "At least one document file must be uploaded"
    //   );
    // }

    const files = req.files as Express.Multer.File[];

    // 2) Map to your DTO
    const documents: LetterFile[] = files.map((file) => ({
      fileName: file.originalname,
      filePath: path.basename(file.path),
      mimeType: file.mimetype || mime.lookup(file.originalname) || undefined,
      size: file.size,
    }));

    // 3) Call service (no need to guard again—you're guaranteed docs exist)
    const account = await accountService.assignMasterAccount(
      req.params.id,
      user.companyId,
      documents
    );

    res.status(httpStatus.OK).json({
      message: "Master account assigned successfully",
      data: account,
    });
  }
);

export default {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  assignMasterAccount,
};
