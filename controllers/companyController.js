const { Op } = require("sequelize");
const AdditionalAllowanceDefinition = require("../models/additionalAllowanceDefinition.js");
const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition.js");
const Company = require("../models/company.js");
// const CompanyAccountInfo = require("../models/companyAccountInfo.js");
const Department = require("../models/department.js");
const Package = require("../models/package.js");
const Pension = require("../models/pension.js");
const Subscription = require("../models/subscription.js");
const Taxslab = require("../models/taxslab.js");
const User = require("../models/user.js");
const { calculateNextPayment } = require("../utils/helper.js");
const moment = require("moment");
// const sequelize = require("../database/db.js");
const sequelize = require("../database/db.js");
const IdFormat = require("../models/companyIdFormat");
const createError = require(".././utils/error.js");
const successResponse = require(".././utils/successResponse.js");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sendEmail = require(".././utils/sendEmail.js");
const AccountInfo = require("../models/accountInfo.js");
const { create } = require("domain");
const ProvidentFund = require("../models/providentFund.js");
const CustomRole = require("../models/customRole.js");
const { all } = require("axios");
const CompanyCustomRole = require("../models/companyCustomRole.js");
// const createError=require("../utils/error.js")

const Permissions = require("../models/permission.js");

// GET COMPANY PROFILES
exports.getcompanyProfiles = async (req, res, next) => {
  try {
    const company = await Company.findByPk(
      req.user.id,

      {
        attributes: {
          exclude: [
            "password",
            "resetPasswordToken",
            "resetPasswordTokenCreatedAt",
          ],
        },
      }
    );
    if (!company) {
      return next(createError.createError(404, "Company not found"));
    }
    return res.status(200).json({
      success: true,
      message: "Data found",
      data: company,
    });
  } catch (error) {
    return next(createError.createError(503, error.message));
  }
};

exports.createCompany1 = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { packageId, duration, ...companyData } = req.body;
    const existingCompany = await Company.findOne({
      where: {
        [Op.or]: [
          { email: companyData.email },
          { companyCode: companyData.companyCode },
        ],
      },
      // transaction
    });

    if (existingCompany) {
      await transaction.rollback();

      return next(
        createError.createError(400, "Email or companyCode already exists")
      );
    }

    const package = await Package.findByPk(packageId, { transaction });

    if (!package) {
      return next(createError.createError(404, "Package does not exist"));
    }

    const imagePath =
      (req?.files?.companyLogo && req?.files?.companyLogo[0]?.path) || null;

    const acctImagePath =
      (req?.files?.acctImage && req?.files?.acctImage[0]?.path) || null;
    const bannerPath =
      (req?.files?.companyBanner && req?.files?.companyBanner[0]?.path) || null;
    const company = await Company.create(
      {
        ...companyData,
        companyLogo: imagePath,
        companyBanner: bannerPath,
      },
      { transaction }
    );

    // const companyAccountInfo = await CompanyAccountInfo.create(
    //   {
    //     accountNumber,
    //     image: acctImagePath,
    //     CompanyId: company.id,
    //     isActive: true,
    //   },
    //   { transaction }
    // );

    const currentDate = moment();
    const subscription = await Subscription.create(
      { duration },
      { transaction }
    );
    await subscription.setPackage(packageId, { transaction });
    await subscription.setCompany(company.id, { transaction });

    const nextPaymentDate = await calculateNextPayment({
      chargeType: package.packageType,
      duration,
      normalDate: Date.now(),
    });
    const leftPaymentDate = nextPaymentDate.diff(currentDate, "days");
    await subscription.update(
      { nextPaymentDate, leftPaymentDate },
      { transaction }
    );

    const superAdmin = await User.findOne(
      {
        where: { role: "superAdmin" },
      },
      { transaction }
    );

    const [
      taxSlabs,
      // pensions,
      additionalAllowanceDefinitions,
      additionalDeductionDefinitions,
    ] = await Promise.all([
      Taxslab.findAll(
        {
          where: { UserId: superAdmin.id, isActive: true },
        },
        { transaction }
      ),
      // Pension.findAll(
      //   {
      //     where: { UserId: superAdmin.id, isActive: true }
      //   },
      //   { transaction }
      // ),
      AdditionalAllowanceDefinition.findAll(
        {
          where: { CompanyId: null },
        },
        { transaction }
      ),
      AdditionalDeductionDefinition.findAll(
        {
          where: { CompanyId: null },
        },
        { transaction }
      ),
    ]);

    const taxes = await Promise.all(
      taxSlabs.map((taxSlab) =>
        Taxslab.create(
          {
            from_Salary: Number(taxSlab.from_Salary),
            to_Salary: Number(taxSlab.to_Salary),
            income_tax_payable: Number(taxSlab.income_tax_payable),
            deductible_Fee: Number(taxSlab.deductible_Fee),
            CompanyId: company.id,
            UserId: null,
          },
          { transaction }
        )
      )
    );

    // const pensiones = await Promise.all(
    //   pensions.map(pension =>
    //     Pension.create(
    //       {
    //         employerContribution: pension.employerContribution,
    //         employeeContribution: pension.employeeContribution,
    //         UserId: null,
    //         CompanyId: company.id
    //       },
    //       { transaction }
    //     )
    //   )
    // )

    const additionalAllowances = await Promise.all(
      additionalAllowanceDefinitions.map((allowance) =>
        AdditionalAllowanceDefinition.create(
          {
            name: allowance.name,
            isTaxable: allowance.isTaxable,
            isExempted: allowance.isExempted,
            exemptedAmount: allowance.exemptedAmount,
            startingAmount: allowance.startingAmount,
            CompanyId: company.id,
          },
          { transaction }
        )
      )
    );

    const additionalDeductions = await Promise.all(
      additionalDeductionDefinitions.map((deduction) =>
        AdditionalDeductionDefinition.create(
          {
            name: deduction.name,
            CompanyId: company.id,
          },
          { transaction }
        )
      )
    );

    await transaction.commit();

    const companyIdFormat = await IdFormat.create({
      companyCode: company.companyCode,
      year: "true",
      department: "true",
      separator: "/",
      order: "companyCode,department,year",
      digitLength: 4,
    });
    await companyIdFormat.setCompany(company.id);
    // const existingDepartment=await Department.findAll({where:companyId:company.id});
    return res.status(201).json({
      successs: true,
      message: "Created successfully",
      // companyAccountInfo,
      // taxes,
      // pensions: pensiones,

      // additionalDeduction: additionalDeductions,
      // additionalAllowance: additionalAllowances,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// CREATE COMPANY
exports.createCompany = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { packageId, duration, ...companyData } = req.body;

    // Extract required fields
    const { fullName, email, companyCode, organizationName, phoneNumber } =
      companyData;

    // Validate required fields
    if (
      !email?.trim() ||
      !companyCode?.trim() ||
      !organizationName?.trim() ||
      !phoneNumber?.trim() ||
      !packageId
    ) {
      return next(
        createError.createError(400, "Please enter all required fields")
      );
    }

    const existingCompany = await Company.findOne({
      where: {
        [Op.or]: [
          { email: companyData.email },
          { companyCode: companyData.companyCode },
        ],
      },
      // transaction
    });

    if (existingCompany) {
      // await transaction.rollback();
      return next(
        createError.createError(400, "Email or companyCode already exists")
      );
    }

    const package = await Package.findByPk(packageId);

    if (!package) {
      // await transaction.rollback();
      return next(createError.createError(404, "Package does not exist"));
    }

    const imagePath = req?.files?.companyLogo?.[0]?.path || null;
    const acctImagePath = req?.files?.acctImage?.[0]?.path || null;
    const bannerPath = req?.files?.companyBanner?.[0]?.path || null;

    const token = crypto.randomBytes(32).toString("hex");
    const firstFourDigits = companyData.companyCode.slice(0, 4);
    const company = await Company.create(
      {
        ...companyData,
        password: await bcrypt.hash(firstFourDigits + "C@#1234", 10),
        primary_Color: "#00adef",
        primary_Font_Color: "#000000",
        primary_Gradient_Color: "",
        secondary_Color: "#008000",
        secondary_Font_Color: "#ffffff",
        secondary_Gradient_Color: "",
        companyLogo: imagePath,
        companyBanner: bannerPath,
      },
      { transaction }
    );

    const currentDate = moment();
    const subscription = await Subscription.create(
      { duration: 1 },
      { transaction }
    );

    await subscription.setPackage(packageId, { transaction });
    await subscription.setCompany(company.id, { transaction });

    const nextPaymentDate = await calculateNextPayment(
      {
        chargeType: package.packageType,
        duration: 1,
        normalDate: Date.now(),
      },
      { transaction }
    );

    const leftPaymentDate = nextPaymentDate.diff(currentDate, "days");

    await subscription.update(
      { nextPaymentDate, leftPaymentDate },
      { transaction }
    );

    const superAdmin = await User.findOne({
      where: { role: "superAdmin" },
      // transaction
    });

    const [
      taxSlabs,
      // pensions,
      additionalAllowanceDefinitions,
      additionalDeductionDefinitions,
    ] = await Promise.all([
      Taxslab.findAll({ where: { UserId: superAdmin.id, isActive: true } }),
      // Pension.findAll({ where: { UserId: superAdmin.id, isActive: true } }, ),
      AdditionalAllowanceDefinition.findAll({ where: { CompanyId: null } }),
      AdditionalDeductionDefinition.findAll({ where: { CompanyId: null } }),
    ]);

    const taxes = await Promise.all(
      taxSlabs.map((taxSlab) =>
        Taxslab.create(
          {
            from_Salary: Number(taxSlab.from_Salary),
            to_Salary: Number(taxSlab.to_Salary),
            income_tax_payable: Number(taxSlab.income_tax_payable),
            deductible_Fee: Number(taxSlab.deductible_Fee),
            CompanyId: company.id,
            UserId: null,
          },
          { transaction }
        )
      )
    );

    // const pensiones = await Promise.all(
    //   pensions.map(pension =>
    //     Pension.create(
    //       {
    //         employerContribution: pension.employerContribution,
    //         employeeContribution: pension.employeeContribution,
    //         UserId: null,
    //         CompanyId: company.id
    //       },
    //       { transaction }
    //     )
    //   )
    // );

    const additionalAllowances = await Promise.all(
      additionalAllowanceDefinitions.map((allowance) =>
        AdditionalAllowanceDefinition.create(
          {
            name: allowance.name,
            isTaxable: allowance.isTaxable,
            isExempted: allowance.isExempted,
            exemptedAmount: allowance.exemptedAmount,
            startingAmount: allowance.startingAmount,
            CompanyId: company.id,
          },
          { transaction }
        )
      )
    );

    const additionalDeductions = await Promise.all(
      additionalDeductionDefinitions.map((deduction) =>
        AdditionalDeductionDefinition.create(
          {
            name: deduction.name,
            CompanyId: company.id,
          },
          { transaction }
        )
      )
    );

    const pension = await Pension.create(
      {
        employeeContribution: 0,
        employerContribution: 0,
        CompanyId: Number(company?.id),
        isActive: true,
        UserId: null,
      },
      { transaction }
    );

    const PF = await ProvidentFund.create(
      {
        employeeContribution: 0,
        employerContribution: 0,
        CompanyId: Number(company?.id),
        isActive: true,
        UserId: null,
      },
      { transaction }
    );

    // ASSIGN CUSTOM Permission TO ADMIN
    // const allRoles= await CustomRole.findAll();

    const permissions = await Permissions.findAll();

    // Assign roles to the company

    // Assign permissions to the company using the junction table
    await company.setPermissions(permissions, { transaction });

    await transaction.commit();

    const companyIdFormat = await IdFormat.create({
      companyCode: company.companyCode,
      year: "true",
      department: "true",
      separator: "/",
      order: "companyCode,department,year",
      digitLength: 4,
    });
    await companyIdFormat.setCompany(company.id);

    return res.status(201).json({
      success: true,
      message: "Created successfully.  ",
    });

    // const text =  `Click the following link to set your password: http://localhost:4400/company/set-password/${token}`
    // const subject= `Thank you for your going with us`
    // console.log("email",companyData.email)
    // const emailSent = await sendActivationEmail(companyData.email , subject,text,next);
    // await company.set({resetPasswordToken:token})
    // company.resetPasswordToken=token;

    // if (emailSent) {

    //   return res.status(201).json({
    //     success: true,
    //     message: 'Created successfully.   Email sent.'

    //   });
    //   // return res.status(200).json({
    //   //   status: "success",
    //   //   message: "Company status activated successfully. Email sent.",
    //   // });
    // } else {
    //  return next(createError.createError(503, "Error sending activation email. Company status not updated"));

    // }
  } catch (error) {
    console.log(error);
    await transaction.rollback();

    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//GET ALL COMPANY
exports.getAllCompany = async (req, res, next) => {
  try {
    const companys = await Company.findAll({
      attributes: {
        exclude: [
          "password",
          "resetPasswordTokenCreatedAt",
          "createdAt",
          "updatedAt",
          "resetPasswordToken",
        ],
      },
      include: [
        Subscription,
        Taxslab,
        Department,
        // {
        //   model: Permissions,
        //   attributes: ["id", "module", "isAccessible"],
        //   through: {
        //     attributes: [], // Ensure no attributes from the junction table are included
        //   },
        //   // attributes: []
        // },
      ],
    });

    const baseUrl = "/";

    // return res.json(baseUrl);
    const companies = companys.map((company) => {
      if (company.companyLogo) {
        const imageUrl = `${baseUrl}${company.companyLogo.replace(/\\/g, "/")}`;
        company.companyLogo = imageUrl;
      }
      if (company.companyBanner) {
        const imageUrl = `${baseUrl}${company.companyBanner.replace(
          /\\/g,
          "/"
        )}`;
        company.companyBanner = imageUrl;
      }
      if (company.footer) {
        const imageUrl = `${baseUrl}${company.footer.replace(/\\/g, "/")}`;
        company.footer = imageUrl;
      }
      if (company.header) {
        const imageUrl = `${baseUrl}${company.header.replace(/\\/g, "/")}`;
        company.header = imageUrl;
      }
      return company;
    });
    return res.json({
      // count: companies.length,
      message: "Fetched successfully",
      data: companies,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.updateLoanStatus = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { isLoanGranted } = req.body; // Expecting { isLoanGranted: true/false }

    // Ensure isLoanGranted is a boolean
    if (typeof isLoanGranted !== "boolean") {
      return res
        .status(400)
        .json({ message: "Invalid value. Expected boolean (true/false)." });
    }

    // Find company by ID
    const company = await Company.findByPk(CompanyId);
    if (!company) {
      return next(createError.createError(404, "Company not found "));
    }

    // Check if the value is already the same
    if (company.isLoanGranted === isLoanGranted) {
      return next(
        createError.createError(
          400,
          `Loan status is already set to ${isLoanGranted} `
        )
      );
    }

    // Update the loan status
    company.isLoanGranted = isLoanGranted;
    await company.save();

    return res.status(200).json({
      message: "Loan status updated successfully",
    });
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.updateProjectBased = async (req, res, next) => {
  try {
    const { isProjectBased } = req.body;

    if (typeof isProjectBased !== "boolean") {
      return next(
        createError.createError(
          400,
          "Invalid value for isProjectBased. Must be a boolean."
        )
      );
    }
    const checkProject = await Company.findByPk(Number(req.user.id));

    if (!checkProject) {
      return next(createError.createError(404, "company not found"));
    }

    if (checkProject?.isProjectBased) {
      return next(
        createError.createError(400, "company already is project based")
      );
    } else {
      const company = await Company.findByPk(Number(req.user.id));
      company.isProjectBased = isProjectBased;
      company.isSetted = true;
      await company.save();
      return res.status(200).json({
        success: true,
        message: "Project based company updated successfully",
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.getCompanyById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const company = await Company.findByPk(Number(id), {
      attributes: { exclude: ["password"] },
    });
    if (!company) {
      return next(createError.createError(404, "Company does not exist"));
    } else {
      return res.json({ message: "Fetched successfully", data: company });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

///update company deteil
exports.updateCompanyDetails = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      numberOfEmployees,
      organizationName,
      email,
      phoneNumber,
      companyLogo,
      jobTitle,
      country,
      region_or_City,
      fax,
      address_Street,
      notes,
    } = req.body; // Fields to be updated

    const company = await Company.findOne({
      where: { id: Number(req.user.id) },
    });

    if (!company) {
      return next(createError.createError(404, "Company does not exist"));
    }

    // Update the company details
    const updatedCompany = await company.update(
      {
        name,
        numberOfEmployees,
        organizationName,
        email,
        phoneNumber,
        companyLogo,
        jobTitle,
        country,
        region_or_City,
        fax,
        address_Street,
        notes,
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(200).json({
      message: "Company details updated successfully",
      data: updatedCompany,
    });
  } catch (error) {
    await transaction.rollback();
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//UPDATE COMPANY
exports.updateCompany = async (req, res, next) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const company = await Company.findByPk(Number(id));
    if (!company) {
      return next(createError.createError(404, "Company does not exist"));
    } else {
      if (body.password) {
        delete body.password;
      }

      const logoPath =
        req?.files?.companyLogo && req?.files?.companyLogo[0]?.path;
      const headerPath = req?.files?.["header"]
        ? req?.files?.["header"][0]?.path
        : company.header;
      const footerPath = req?.files?.["footer"]
        ? req?.files?.["footer"][0]?.path
        : company.footer;
      const updatedData = await company.update({
        ...body,
        companyLogo: logoPath,
        header: headerPath,
        footer: footerPath,
      });
      return res.status(200).json({
        message: "Updated successfully",
      });
      // return res.json(updatedData)
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// delete Company
exports.deleteCompany = async (req, res, next) => {
  const { id } = req.params;
  try {
    const company = await Company.findByPk(Number(id));
    if (!company) {
      return next(createError.createError(404, "Company does not exist"));
    } else {
      // await CompanyAccountInfo.destroy({
      //   where: { CompanyId: id },
      // });

      await company.destroy({ cascade: true });

      return res.status(200).json({ message: "company deleted successfully" });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getAllActiveCompany = async (req, res, next) => {
  try {
    const activeCompany = await Company.findAll({
      where: { status: "active" },
      attributes: {
        exclude: [
          "password",
          "resetPasswordTokenCreatedAt",
          "createdAt",
          "updatedAt",
          "resetPasswordToken",
        ],
      },
    });
    res.status(200).json({
      count: activeCompany.length,
      message: "Fetched successfully",
      data: activeCompany,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//ALL PENDING COMPANY
exports.getAllPendingCompany = async (req, res, next) => {
  try {
    const pendingCompany = await Company.findAll({
      where: { status: "pending" },
      attributes: {
        exclude: [
          "password",
          "resetPasswordTokenCreatedAt",
          "createdAt",
          "updatedAt",
          "resetPasswordToken",
        ],
      },
    });

    res.status(200).json({
      count: pendingCompany.length,
      message: "Fetched successfully",
      data: pendingCompany,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//ALL PENDING COMPANY
exports.getAllBlockedCompany = async (req, res, next) => {
  try {
    const blockedCompany = await Company.findAll({
      where: { status: "blocked" },
      attributes: {
        exclude: [
          "password",
          "resetPasswordTokenCreatedAt",
          "createdAt",
          "updatedAt",
          "resetPasswordToken",
        ],
      },
    });

    res.status(200).json({
      count: blockedCompany.length,
      message: "Fetched successfully",
      data: blockedCompany,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//DEACTIVATED COMPANY
exports.getDeactivatedCompany = async (req, res, next) => {
  try {
    const deactiveCompany = await Company.findAll({
      where: {
        status: {
          [Op.or]: ["reject", "denied"],
        },
        attributes: {
          exclude: [
            "password",
            "resetPasswordTokenCreatedAt",
            "createdAt",
            "updatedAt",
            "resetPasswordToken",
          ],
        },
      },
    });
    res.status(200).json({
      message: "Fetched successfully",
      data: deactiveCompany,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//ALL PENDING COMPANY
exports.getAllDeniedCompany = async (req, res, next) => {
  try {
    const deniedCompany = await Company.findAll({
      where: { status: "denied" },
      attributes: {
        exclude: [
          "password",
          "resetPasswordTokenCreatedAt",
          "createdAt",
          "updatedAt",
          "resetPasswordToken",
        ],
      },
    });

    res.status(200).json({
      count: deniedCompany.length,
      message: "Fetched successfully",
      data: deniedCompany,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//GET LEFT DATE
exports.getSubscriptionLeftDate = async (req, res, next) => {
  try {
    const companyId = Number(req.params.companyId);

    const company = await Company.findOne({
      where: {
        id: companyId,
      },
    });
    if (!company) {
      return next(createError.createError(404, "Company not found"));
    }
    const currentDate = moment();

    const subscriptionLeftDate = await Subscription.findOne({
      where: { CompanyId: companyId, isActive: true },
      include: { model: Package },
    });

    const nextPaymentDate = moment(subscriptionLeftDate.nextPaymentDate);
    const startDate = moment(subscriptionLeftDate.createdAt);
    const diff = nextPaymentDate.diff(currentDate, "days");
    return res.status(200).json({
      data: {
        Subscription_left_date: diff,
        packageType: subscriptionLeftDate?.Package?.packageType,
        packageName: subscriptionLeftDate?.Package?.packageName,
      },
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//UPDATE ACCOUNT INFO
exports.updateAccountInfo = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { accountNumber, referenceNumber, referenceLetter, image } = req.body;

    if (!accountNumber || !referenceNumber) {
      return next(
        createError.createError(400, "please insert all requiered fields")
      );
    }
    if (!req.files?.referenceLetter?.[0]?.path) {
      return next(createError.createError(400, "referenceLetter not found"));
    }
    const company = await Company.findByPk(Number(req.user.id));
    if (!company) {
      return next(createError.createError(404, "company not found"));
    }

    const accountInfo = await AccountInfo.findOne({
      where: { CompanyId: req.user.id, isActive: true },
    });
    const data = req.files?.image?.[0]?.path;
    const imagePath = data ? data : null;
    const referenceLetterData = req.files?.referenceLetter?.[0]?.path;
    const referenceLetterPath = referenceLetterData
      ? referenceLetterData
      : null;
    if (!accountInfo) {
      // await accountInfo.update({ isActive: false }, { transaction })
      await AccountInfo.create(
        {
          accountNumber: accountNumber,
          referenceLetter: referenceLetterPath,
          referenceNumber: referenceNumber,
          image: imagePath,
          CompanyId: req.user.id,
        }
        // { transaction }

        // await AccountInfo.create({
        //   accountNumber,referenceLetter,referenceNumber,image
      );
    } else {
      await accountInfo.update({ isActive: false }, { transaction });
      await AccountInfo.create(
        {
          accountNumber: accountNumber,
          referenceLetter: referenceLetterPath,
          referenceNumber: referenceNumber,
          image: imagePath,
          CompanyId: req.user.id,
          isActive: true,
        },
        { transaction }

        // await AccountInfo.create({
        //   accountNumber,referenceLetter,referenceNumber,image
      );
    }
    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: "Account info updated successfully",
    });
  } catch (error) {
    console.log(error);
    await transaction.rollback();

    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//RESET PASSWORD
exports.resetPasswordToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // return res.json("password")
    // Find the user by the toke  n
    const user = await Company.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      return next(createError.createError(404, "Invalid or expired token"));
    }

    const tokenCreationTime = user?.resetPasswordTokenCreatedAt;
    const tokenExpirationTime = new Date(
      tokenCreationTime.getTime() + 24 * 60 * 60 * 1000
    ); // 24 hours expiration
    const currentTime = new Date();

    if (currentTime > tokenExpirationTime) {
      return next(createError.createError(401, "Token has expired"));
    }

    await user.update({
      password,
      resetPasswordToken: null,
      resetPasswordTokenCreatedAt: null,
    });

    res.json({ message: "Password set successfully" });
  } catch (error) {
    // res.status(503).json({ error: "Internal server error" });
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

const sendActivationEmail = async (email, subject, text, next) => {
  try {
    await sendEmail({
      email,
      subject: subject,
      text,
    });
    return true;
  } catch (err) {
    return false;
    // return next(createError.createError(503, "Error sending activation email. Company status not updated"));
  }
};

//UPDATE COMPANY PROFILE
// exports.updateCompanyProfile = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const {
//       primary_Color,
//       primary_Font_Color,
//       primary_Gradient_Color,
//       secondary_Color,
//       secondary_Font_Color,
//       secondary_Gradient_Color,
//       social_Media_Images,
//     } = req.body;
//     const CompanyId = Number(req.user.id);
//     const logo = req.files?.logo?.[0]?.path;
//     const logoPath = logo ? logo : null;

//     const banner = req.files?.logo?.[0]?.path;

//     const bannerPath = banner ? banner : null;

//     // return res.json(req.body);
//     const company = await Company.update(
//       {
//         primary_Color,
//         primary_Font_Color,
//         primary_Gradient_Color,
//         secondary_Color,
//         secondary_Font_Color,
//         secondary_Gradient_Color,
//         social_Media_Images,
//         companyLogo: logo,
//         companyBanner: banner,
//       },
//       {
//         where: { id: Number(id) },
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Updated successfully",
//     });
//   } catch (error) {
//     console.log(error);
//     return next(
//       createError.createError(503, "An error occurred, please try again later")
//     );
//   }
// };

exports.updateCompanyProfile = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const {
      name,
      numberOfEmployees,
      organizationName,
      email,
      phoneNumber,
      jobTitle,
      country,
      region_or_City,
      fax,
      address_Street,
      notes,
      primary_Color,
      primary_Font_Color,
      primary_Gradient_Color,
      secondary_Color,
      secondary_Font_Color,
      secondary_Gradient_Color,
      social_Media_Images,
    } = req.body;

    const logo = req.files?.logo?.[0]?.path || null;
    const banner = req.files?.banner?.[0]?.path || null;

    // Update company profile
    const [updated] = await Company.update(
      {
        name,
        numberOfEmployees,
        organizationName,
        email,
        phoneNumber,
        jobTitle,
        country,
        region_or_City,
        fax,
        address_Street,
        notes,
        primary_Color,
        primary_Font_Color,
        primary_Gradient_Color,
        secondary_Color,
        secondary_Font_Color,
        secondary_Gradient_Color,
        social_Media_Images,
        companyLogo: logo,
        companyBanner: banner,
      },
      { where: { id: CompanyId } }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error) {
    console.error(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//RESET TO DEFAULT COMPANY PROFILE

exports.resetTodefauldCompanyProfiles = async (req, res, next) => {
  try {
    // const data = await Company.update(
    //   {
    //     primary_Color: "#00adef",
    //     primary_Font_Color: "#000000",
    //     primary_Gradient_Color: "",
    //     secondary_Color: "#008000",
    //     secondary_Font_Color: "#ffffff",
    //     secondary_Gradient_Color: "",
    //     social_Media_Images: true,
    //   },
    //   {
    //     where: { id: req?.user?.id },
    //   }
    // );
    // // Fetch the updated record
    // const updatedCompany = await Company.findOne({
    //   where: { id: req?.user?.id },
    // });
    const [rowsUpdated, updatedData] = await Company.update(
      {
        primary_Color: "#00adef",
        primary_Font_Color: "#000000",
        primary_Gradient_Color: "",
        secondary_Color: "#008000",
        secondary_Font_Color: "#ffffff",
        secondary_Gradient_Color: "",
        social_Media_Images: true,
      },
      {
        where: { id: req?.user?.id },
        returning: true, // Fetch updated rows
      }
    );
    // Construct the response object manually with only the updated fields
    const updatedFields = {
      primary_Color: "#00adef",
      primary_Font_Color: "#000000",
      primary_Gradient_Color: "",
      secondary_Color: "#008000",
      secondary_Font_Color: "#ffffff",
      secondary_Gradient_Color: "",
      social_Media_Images: true,
    };
    // return res.json({
    //   success: true,
    //   message: "Reset to default successfully",
    //   data: updatedFields, // This contains only the updated rows
    // });

    return res.json({
      success: true,
      message: "Reset do default successfully",
      data: updatedFields,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//CREATE PASSWORD
exports.createPassword = async (req, res, next) => {
  try {
    const password = req.body.password;
    const token = req.params.token;
    // await sendEmail({
    //   company.email,
    //   subject: subject,
    //   text,
    // });
    return res.json({ data: password });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
