const AdditionalAllowanceDefinition = require("../models/additionalAllowanceDefinition.js");
const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition.js");
const Company = require("../models/company.js");
const CompanyAccountInfo = require("../models/companyAccountInfo.js");
const Department = require("../models/department.js");
const Package = require("../models/package.js");
const Pension = require("../models/pension.js");
const Subscription = require("../models/subscription.js");
const Taxslab = require("../models/taxslab.js");
const User = require("../models/user.js");
const { calculateNextPayment } = require("../utils/helper.js");
const moment = require("moment");

//CREATE Company
exports.createCompany = async (req, res) => {
  try {


    const { packageId, duration, accountNumber, isVerified, ...companyData } =
      req.body;

    const { file } = req;

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

    // Access the uploaded image file

    let company;

    if (file) {
      const { path } = file;
      company = await Company.create({ ...companyData, companyLogo: path });
    } else {
      company = await Company.create({ ...companyData });
    }
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

    const [
      taxslabs,
      pensions,
      additionalAllowanceDefinition,
      additionalDeductionDefinition,
    ] = await Promise.all([
      Taxslab.findAll({ where: { userId: superAdmin.id, isActive: true } }),
      Pension.findAll({ where: { userId: superAdmin.id, isActive: true } }),
      AdditionalAllowanceDefinition.findAll({ where: { CompanyId: null } }),
      AdditionalDeductionDefinition.findAll({ where: { CompanyId: null } }),
    ]);
    console.log("first", additionalAllowanceDefinition)
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


        const additionalAllowance = await Promise.all(
          additionalAllowanceDefinition.map((allowance) =>
            AdditionalAllowanceDefinition.create({
              name: allowance.name,
              isTaxable: allowance.isTaxable,
              isExempted:allowance.isExempted,
              exemptedAmount:allowance.exemptedAmount,
              startingAmount:allowance.startingAmount,
              CompanyId: company.id,
            })
          )
        );

        const additionalDeduction = await Promise.all(
          additionalDeductionDefinition.map((allowance) =>
            AdditionalDeductionDefinition.create({
              name: allowance.name,  
              CompanyId: company.id,
            })
          )
        );

    return res.status(201).json({
      message: "Created successfully",
      taxes,
      pensiones,
      companyAccountInfo,
      additionalDeduction,
      additionalAllowance
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
    include: [Subscription, Taxslab, Department],
  });

  // const baseUrl = "https://localhost:6000/";
  const baseUrl = "https://payroll-production.up.railway.app/";
  const companies = companys.map((company) => {
    if (company.companyLogo) {
      const imageUrl = `${baseUrl}${company.companyLogo.replace(/\\/g, "/")}`;
      company.companyLogo = imageUrl;
    }
    return company;
  });
  console.log("company", companies);
  return res.json({
    count:companies.length,
    
    companies});
};

// exports.getAllCompany = async (req, res) => {
//   const companys = await Company.findAll({
//     attributes: { exclude: ["password"] },
//     include: [Subscription, Taxslab, Department],
//   });
//   return res.json(companys);
// };

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
<<<<<<< HEAD

      // Validate the updated data against the model
      await company.validate();
 const updatedData=     await company.update(body);

=======
      
      const { file } = req;
      // Access the uploaded image file
let updatedData;
    
   if(file){
     const { path } = file;
     // Validate the updated data against the model
     await company.validate();
      updatedData = await company.update({ ...body, companyLogo: path });
   }else{
     // Validate the updated data against the model
     await company.validate();
      updatedData = await company.update(body);
   }
     
>>>>>>> a4d081f819f514c9a9230842e91494a824f149e8
      // Return the updated company object
      return res.json(updatedData);
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

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      // console.log("first", error);
      return res.status(500).json({ error: "Internal server error" });
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

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      // console.log("first", error);
      return res.status(500).json({ error: "Internal server error" });
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

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      // console.log("first", error);
      return res.status(500).json({ error: "Internal server error" });
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

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      // console.log("first", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};
