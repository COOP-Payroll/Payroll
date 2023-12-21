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
const sequelize=require("../database/db.js");
const IdFormat = require("../models/companyIdFormat");
exports.createCompany = async (req, res,next) => {
  const transaction = await sequelize.transaction();

  try {
    const { packageId, duration,  ...companyData } = req.body;
    const existingCompany = await Company.findOne({
      where: {
        [Op.or]: [
          { email: companyData.email },
          { companyCode: companyData.companyCode },
        ],
      },
      transaction,
    });


    console.log(companyData);
    if (existingCompany) {
      await transaction.rollback();
      return res
        .status(409)
        .json({ error: "Email or companyCode already exists" });
    }

    // const existingAccount = await CompanyAccountInfo.findOne({
    //   where: { accountNumber },
    //   transaction,
    // });

    // if (existingAccount) {
    //   await transaction.rollback();
    //   return res.status(409).json({ error: "Account Info already exists" });
    // }

    const package = await Package.findByPk(packageId, { transaction });

    if (!package) {
      await transaction.rollback();
      return res.status(404).json({ error: "Package does not exist" });
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


    console.log("package type",package.packageType)
    const nextPaymentDate = await calculateNextPayment({
      chargeType: package.packageType,
      duration,
      normalDate: Date.now(),
    });
    const leftPaymentDate = nextPaymentDate.diff(currentDate, "days");
    console.log(leftPaymentDate);
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
      pensions,
      additionalAllowanceDefinitions,
      additionalDeductionDefinitions,
    ] = await Promise.all([
      Taxslab.findAll(
        {
          where: { userId: superAdmin.id, isActive: true },
        },
        { transaction }
      ),
      Pension.findAll(
        {
          where: { userId: superAdmin.id, isActive: true },
        },
        { transaction }
      ),
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

    const pensiones = await Promise.all(
      pensions.map((pension) =>
        Pension.create(
          {
            employerContribution: pension.employerContribution,
            employeeContribution: pension.employeeContribution,
            UserId: null,
            CompanyId: company.id,
          },
          { transaction }
        )
      )
    );

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
      message: "Created successfully",
      // companyAccountInfo,
      // taxes,
      // pensions: pensiones,

      // additionalDeduction: additionalDeductions,
      // additionalAllowance: additionalAllowances,
    });
  } catch (error) 
  {
    console.log(error);
    next(error);
  //   console.error(error);
  //   await transaction.rollback();

  //   if (
  //     error.name === "SequelizeValidationError" ||
  //     error.name === "SequelizeUniqueConstraintError"
  //   ) {
  //     const errors = error.errors.reduce((acc, err) => {
  //       acc[err.path] = [`${err.path} is required`];
  //       return acc;
  //     }, {});
  //     return res.status(404).json({ message: errors });
  //   }

  //   return res.status(500).json({ message: "Internal server error" });
  //
 }
};

exports.getAllCompany = async (req, res) => {
  const companys = await Company.findAll({
    attributes: { exclude: ["password"] },
    include: [Subscription, Taxslab, Department],
  });

  // const baseUrl = "https://localhost:6000/";
  const baseUrl = "https://payroll-production.up.railway.app/";
  const companies = companys.map((company) => {
    if (company.companyLogo) {
      const imageUrl = `${baseUrl}${company.companyLogo.replace(/\\/g, "/")}`;
      company.companyLogo = imageUrl;
    }
    if (company.companyBanner) {
      const imageUrl = `${baseUrl}${company.companyBanner.replace(/\\/g, "/")}`;
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
    count: companies.length,

    companies,
  });
};

exports.getCompanyById = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findByPk(Number(id), {
      attributes: { exclude: ["password"] },
    });
    if (!company) {
      return res.status(404).json({ error: "Company does not exist" });
    } else {
      return res.json(company);
    }
  } catch (error) {
    return res.json(error);
  }
};

exports.updateCompany = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const company = await Company.findByPk(Number(id));
    if (!company) {
      return res.status(404).json({ error: "Company does not exist" });
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
      return res.json(updatedData);
    }
  } catch (error) {
    console.log("error", error);
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((error) => ({
        field: error.path,
        message: error.message,
      }));
      return res.status(400).json(validationErrors);
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// delete Company
exports.deleteCompany = async (req, res) => {
  const { id } = req.params;
  try {
    const company = await Company.findByPk(Number(id));
    if (!company) {
      res.status(404).json({ error: "Company does not exist" });
    } else {
      // await CompanyAccountInfo.destroy({
      //   where: { CompanyId: id },
      // });

      await company.destroy({ cascade: true });
      return res.json({ message: "company deleted successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllActiveCompany = async (req, res, next) => {
  try {
    const activeCompany = await Company.findAll({
      where: { status: "active" },
    });
    res.status(200).json({
      count: activeCompany.length,
      activeCompany,
    });
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      // console.log("first", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

//ALL PENDING COMPANY
exports.getAllPendingCompany = async (req, res, next) => {
  try {
    const pendingCompany = await Company.findAll({
      where: { status: "pending" },
    });

    res.status(200).json({
      count: pendingCompany.length,
      pendingCompany,
    });
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      // console.log("first", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

//ALL PENDING COMPANY
exports.getAllBlockedCompany = async (req, res, next) => {
  try {
    const blockedCompany = await Company.findAll({
      where: { status: "blocked" },
    });

    res.status(200).json({
      count: blockedCompany.length,
      blockedCompany,
    });
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      // console.log("first", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

//ALL PENDING COMPANY
exports.getAllDeniedCompany = async (req, res, next) => {
  try {
    const deniedCompany = await Company.findAll({
      where: { status: "denied" },
    });

    res.status(200).json({
      count: deniedCompany.length,
      deniedCompany,
    });
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

//GET LEFT DATE
exports.getSubscriptionLeftDate = async (req, res, next) => {
  try {
    const companyId = req.params.companyId;
    const currentDate = moment();

    const subscriptionLeftDate = await Subscription.findOne({
      where: { companyId: companyId },
    });

    const nextPaymentDate = moment(subscriptionLeftDate.nextPaymentDate);
    const startDate = moment(subscriptionLeftDate.createdAt);
    const diff = nextPaymentDate.diff(currentDate, "days");
    return res.status(200).json({
      Subscription_left_date: diff,
    });
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
