import companyService from "../services/company.service";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";

const registerCompany = catchAsync(async (req, res) => {
  const { organizationName, phoneNumber, companyCode, email } = req.body;
  const company = await companyService.createCompany(
    organizationName,
    phoneNumber,
    companyCode,
    email
  );
  res
    .status(httpStatus.CREATED)
    .send({ data: company, message: "Company created successfully!" });
});

// const getCompany = catchAsync(async (req, res) => {
//     const user = req.user as User;
//     const company = await companyService.getCompanyById(user.id);
//     if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
//   }
//     res.status(httpStatus.OK).send({data: company, message: "Company retrieved successfully"})
// })

// const updateCompany = catchAsync(async (req, res) => {
//   const user = await companyService.updateCompanyById(req.params.userId, req.body);
//   res.send(user);
// });

export default {
  registerCompany,
  // getCompany
};
