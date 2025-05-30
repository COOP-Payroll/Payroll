import companyService from "../services/company.service";
import { AuthUser } from "../types/express";
import ApiError from "../utils/api-error";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";

const registerCompany = catchAsync(async (req, res) => {
  const { organizationName, phoneNumber, companyCode, email, notes } = req.body;
  const company = await companyService.createCompany(
    organizationName,
    phoneNumber,
    companyCode,
    email,
    notes
  );
  res
    .status(httpStatus.CREATED)
    .send({ data: company, message: "Company created successfully!" });
});

const getCompany = catchAsync(async (req, res) => {
  const user = req.user as AuthUser;

  if (!user?.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User has no company assigned");
  }

  const company = await companyService.getCompanyProfile(user.companyId);

  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  res.status(httpStatus.OK).send({
    data: company,
    message: "Company retrieved successfully",
  });
});

// export const updateCompany = catchAsync(async (req, res) => {
//   const user = req.user as AuthUser;
//   if (!user.companyId)
//     throw new ApiError(httpStatus.BAD_REQUEST, "No company assigned");
//   // const updates = req.body;

//   // Ensure req.body exists before destructuring
//   if (!req.body || typeof req.body !== "object") {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid request body");
//   }

//   const { companyCode, ...updates } = req.body;

//   const company = await companyService.updateCompanyProfile(
//     user.companyId,
//     updates
//   );
//   res.status(httpStatus.OK).json({
//     message: "Company updated successfully",
//     data: company,
//   });
// });

export const updateCompany = catchAsync(async (req, res) => {
  const user = req.user as AuthUser;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No company assigned");
  }

  // req.body will be strings (from form-data); convert if necessary
  const {
    //companyCode, // ignore this field
    organizationName,
    phoneNumber,
    email,
    notes,
    level,
  } = req.body;

  const updates: any = {};

  if (organizationName) updates.organizationName = organizationName;
  if (phoneNumber) updates.phoneNumber = phoneNumber;
  if (email) updates.email = email;
  if (notes) updates.notes = notes;
  if (level) updates.level = level;

  const company = await companyService.updateCompanyProfile(
    user.companyId,
    updates
  );

  res.status(httpStatus.OK).json({
    message: "Company updated successfully",
    data: company,
  });
});

export default {
  registerCompany,
  getCompany,
  updateCompany,
};
