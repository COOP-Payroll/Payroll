const Company = require("../models/company.js");
const CompanyAccountInfo = require("../models/companyAccountInfo.js");
const Package = require("../models/package.js");
const Pension = require("../models/pension.js");
const Subscription = require("../models/subscription.js");
const Taxslab = require("../models/taxslab.js");
const User = require("../models/user.js");
const { calculateNextPayment } = require("../utils/helper.js");
const moment = require("moment");

// create Company
// exports.createCompany = async (req, res) => {
//   const data = Object.keys(req.body)
//     .filter((key) => key !== "duration" && key !== "packageId")
//     .reduce((acc, key) => {
//       acc[key] = req.body[key];
//       return acc;
//     }, {});

//   const packageId = Number(req.body.packageId);
//   const duration = Number(req.body.duration);
//   try {
//     const company = await Company.create(data);

//     const package = await Package.findByPk(Number(packageId));
//     if (!package) {
//       return res.status(404).json({ error: "package does not exist!" });
//     } else {
//       const currentDate = moment();
//       const subscription = await Subscription.create({ duration });
//       await subscription.setPackage(packageId);
//       await subscription.setCompany(company.id);
//       const nextPaymentDate = await calculateNextPayment({
//         chargeType: package.packageName,
//         duration,
//         normalDate: Date.now(),
//       });
//       const leftPaymentDate = nextPaymentDate.diff(currentDate, "days");
//       await subscription.update({ nextPaymentDate, leftPaymentDate });
//       const superAdmin = await User.findOne({ where: { role: "superAdmin" } });
//       const taxslabs = await Taxslab.findAll({
//         where: { userId: Number(superAdmin.id), isActive: true },
//       });
//       const pensions = await Pension.findAll({
//         where: { userId: Number(superAdmin.id), isActive: true },
//       });

//       const tax = await Promise.all(
//         taxslabs.map((taxslab) => {
//           Taxslab.create({
//             from_Salary: Number(taxslab.from_Salary),
//             to_Salary: Number(taxslab.to_Salary),
//             income_tax_payable: Number(taxslab.income_tax_payable),
//             deductible_Fee: Number(taxslab.deductible_Fee),
//             CompanyId: Number(company.id),
//             UserId: null,
//           });
//         })
//       );

//       await Promise.all(
//         pensions.map((pension) => {
//           Pension.create({
//             employerContribution: Number(pension.employerContribution),
//             employeeContribution: Number(pension.employeeContribution),
//             CompanyId: Number(company.id),
//             UserId: null,
//           });
//         })
//       );

//       return res.status(201).json(subscription);
//     }
//   } catch (error) {
//     let errors = {};
//     if (error.name === "SequelizeValidationError") {
//       error.errors.forEach((err) => {
//         errors[err.path] = [`${err.path} is required`];
//       });
//       return res.status(400).json(errors);
//     } else if (error.name === "SequelizeUniqueConstraintError") {
//       error?.errors?.forEach((err) => {
//         errors[err.path] = [err.message];
//       });
//       return res.status(400).json(errors);
//     } else {
//       return res.status(500).json(error);
//     }
//   }
// };

// get AllCompany

exports.createCompany = async (req, res) => {
  try {
    const { packageId, duration, accountNumber, isVerified, ...companyData } =
      req.body;

    const getCompany = await Company.findOne({
      where: { email: companyData.email },
    });

    if (getCompany)
      return res.status(409).json({ error: "email already exist" });

    const existingAccount = await CompanyAccountInfo.findOne({
      where: {
        accountNumber,
      },
    });

    if (existingAccount) {
      return res.status(409).json({ error: "Account Info already exists" });
    }

    const package = await Package.findByPk(packageId);
    if (!package) {
      return res.status(404).json({ error: "Package does not exist!" });
    }

    const company = await Company.create(companyData);
    const companyAccountInfo = await CompanyAccountInfo.create({
      accountNumber,
      isVerified,
      CompanyId: company.id,
    });

    const currentDate = moment();
    const subscription = await Subscription.create({ duration });
    await subscription.setPackage(packageId);
    await subscription.setCompany(company.id);

    const nextPaymentDate = await calculateNextPayment({
      chargeType: package.packageName,
      duration,
      normalDate: Date.now(),
    });
    const leftPaymentDate = nextPaymentDate.diff(currentDate, "days");
    await subscription.update({ nextPaymentDate, leftPaymentDate });

    const superAdmin = await User.findOne({ where: { role: "superAdmin" } });
    // console.log("superAdmin", superAdmin);
    const [taxslabs, pensions] = await Promise.all([
      Taxslab.findAll({ where: { userId: superAdmin.id, isActive: true } }),
      Pension.findAll({ where: { userId: superAdmin.id, isActive: true } }),
    ]);

    // console.log("first", taxslabs);
    // console.log("taxslabs", taxslabs[0].from_Salary);

    // const tax = await Promise.all(
    const taxes = await Promise.all(
      taxslabs.map((taxslab) =>
        Taxslab.create({
          from_Salary: Number(taxslab.from_Salary),
          to_Salary: Number(taxslab.to_Salary),
          income_tax_payable: Number(taxslab.income_tax_payable),
          deductible_Fee: Number(taxslab.deductible_Fee),
          CompanyId: company.id,
          UserId: null,
        })
      )
    );

    const pensiones = await Promise.all(
      pensions.map((pension) =>
        Pension.create({
          employerContribution: pension.employerContribution,
          employeeContribution: pension.employeeContribution,
          UserId: null,
          CompanyId: company.id,
        })
      )
    );

    return res.status(201).json({
      message: "Restored to default",
      tax,
    });
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = error.errors.reduce((acc, err) => {
        acc[err.path] = [`${err.path} is required`];
        return acc;
      }, {});
      return res.status(400).json(errors);
    } else {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.getAllCompany = async (req, res) => {
  const companys = await Company.findAll({
    attributes: { exclude: ["password"] },
    include: [Subscription, Taxslab],
  });
  return res.json(companys);
};

// get only one company
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

// update Company
exports.updateCompany = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const company = await Company.findByPk(Number(id));
    if (!company) {
      return res.status(404).json({ error: "Company does not exist" });
    } else {
      // Disallow updating password field
      if (body.password) {
        delete body.password;
      }

      // Validate the updated data against the model
      await company.validate();
      await company.update(body);

      // Return the updated company object
      return res.json(company);
    }
  } catch (error) {
    // Handle validation errors
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((error) => ({
        field: error.path,
        message: error.message,
      }));
      return res.status(400).json(validationErrors);
    }

    // Handle other errors
    return res.status(500).json({ error: "Internal server error" });
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
      await company.destroy();
      return res.json("company deleted successfully");
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
