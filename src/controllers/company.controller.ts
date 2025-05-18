import companyService from "../services/company.service";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";

const registerCompany = catchAsync(async (req, res) => {
    const {organizationName, phoneNumber, companyCode, email} = req.body;
    const company = await companyService.createCompany(organizationName, phoneNumber, companyCode, email)
    res.status(httpStatus.CREATED).send({message: "Company created successfully!"})
})


export default {
    registerCompany
}