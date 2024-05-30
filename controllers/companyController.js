const { Op } = require('sequelize')
const AdditionalAllowanceDefinition = require('../models/additionalAllowanceDefinition.js')
const AdditionalDeductionDefinition = require('../models/additionlDeductionDefinition.js')
const Company = require('../models/company.js')
// const CompanyAccountInfo = require("../models/companyAccountInfo.js");
const Department = require('../models/department.js')
const Package = require('../models/package.js')
const Pension = require('../models/pension.js')
const Subscription = require('../models/subscription.js')
const Taxslab = require('../models/taxslab.js')
const User = require('../models/user.js')
const { calculateNextPayment } = require('../utils/helper.js')
const moment = require('moment')
// const sequelize = require("../database/db.js");
const sequelize = require('../database/db.js')
const IdFormat = require('../models/companyIdFormat')
const createError = require('.././utils/error.js')
const successResponse = require('.././utils/successResponse.js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const sendEmail=require('.././utils/sendEmail.js');
const AccountInfo = require('../models/accountInfo.js')
const { create } = require('domain')
const ProvidentFund = require('../models/providentFund.js')
// const createError=require("../utils/error.js")

exports.getcompanyProfiles= async (req, res, next)=>{
  try {
    const company= await Company.findByPk(req.user.id,
    
      {attributes: { exclude: ['password'] }},
  
  );
   if (!company){
      return next(createError.createError(404, "Company not found"));
    }
    return res.status(200).json({
      success:true,
      message:"Data found",
      data:company
      
    })  
    
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, error.message));
  
  }
}
exports.createCompany1 = async (req, res, next) => {
  const transaction = await sequelize.transaction()

  try {
    const { packageId, duration, ...companyData } = req.body
    const existingCompany = await Company.findOne({
      where: {
        [Op.or]: [
          { email: companyData.email },
          { companyCode: companyData.companyCode }
        ]
      },
      // transaction
    })

    console.log(companyData)
    if (existingCompany) {
      await transaction.rollback()

      return next(
        createError.createError(409, 'Email or companyCode already exists')
      )
    }

  

    const package = await Package.findByPk(packageId, { transaction })

    if (!package) {
      return next(createError.createError(404, 'Package does not exist'))
    }

    const imagePath =
      (req?.files?.companyLogo && req?.files?.companyLogo[0]?.path) || null

    const acctImagePath =
      (req?.files?.acctImage && req?.files?.acctImage[0]?.path) || null
    const bannerPath =
      (req?.files?.companyBanner && req?.files?.companyBanner[0]?.path) || null
    const company = await Company.create(
      {
        ...companyData,
        companyLogo: imagePath,
        companyBanner: bannerPath
      },
      { transaction }
    )

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
    )
    await subscription.setPackage(packageId, { transaction })
    await subscription.setCompany(company.id, { transaction })

    console.log('package type', package.packageType)
    const nextPaymentDate = await calculateNextPayment({
      chargeType: package.packageType,
      duration,
      normalDate: Date.now()
    })
    const leftPaymentDate = nextPaymentDate.diff(currentDate, 'days')
    console.log(leftPaymentDate)
    await subscription.update(
      { nextPaymentDate, leftPaymentDate },
      { transaction }
    )

    const superAdmin = await User.findOne(
      {
        where: { role: 'superAdmin' }
      },
      { transaction }
    )

    const [
      taxSlabs,
      // pensions,
      additionalAllowanceDefinitions,
      additionalDeductionDefinitions
    ] = await Promise.all([
      Taxslab.findAll(
        {
          where: { UserId: superAdmin.id, isActive: true }
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
          where: { CompanyId: null }
        },
        { transaction }
      ),
      AdditionalDeductionDefinition.findAll(
        {
          where: { CompanyId: null }
        },
        { transaction }
      )
    ])

    const taxes = await Promise.all(
      taxSlabs.map(taxSlab =>
        Taxslab.create(
          {
            from_Salary: Number(taxSlab.from_Salary),
            to_Salary: Number(taxSlab.to_Salary),
            income_tax_payable: Number(taxSlab.income_tax_payable),
            deductible_Fee: Number(taxSlab.deductible_Fee),
            CompanyId: company.id,
            UserId: null
          },
          { transaction }
        )
      )
    )

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
      additionalAllowanceDefinitions.map(allowance =>
        AdditionalAllowanceDefinition.create(
          {
            name: allowance.name,
            isTaxable: allowance.isTaxable,
            isExempted: allowance.isExempted,
            exemptedAmount: allowance.exemptedAmount,
            startingAmount: allowance.startingAmount,
            CompanyId: company.id
          },
          { transaction }
        )
      )
    )

    const additionalDeductions = await Promise.all(
      additionalDeductionDefinitions.map(deduction =>
        AdditionalDeductionDefinition.create(
          {
            name: deduction.name,
            CompanyId: company.id
          },
          { transaction }
        )
      )
    )

    await transaction.commit()

    const companyIdFormat = await IdFormat.create({
      companyCode: company.companyCode,
      year: 'true',
      department: 'true',
      separator: '/',
      order: 'companyCode,department,year',
      digitLength: 4
    })
    await companyIdFormat.setCompany(company.id)
    // const existingDepartment=await Department.findAll({where:companyId:company.id});
    return res.status(201).json({
      successs:true,
      message: 'Created successfully'
      // companyAccountInfo,
      // taxes,
      // pensions: pensiones,

      // additionalDeduction: additionalDeductions,
      // additionalAllowance: additionalAllowances,
    })
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.createCompany = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { packageId, duration, ...companyData } = req.body;
  
    const existingCompany = await Company.findOne({
      where: {
        [Op.or]: [
          { email: companyData.email },
          { companyCode: companyData.companyCode },
          
        ]

      },
      // transaction
    });
    

    if (existingCompany) {
      // await transaction.rollback();
      return next(createError.createError(409, 'Email or companyCode already exists'));
    }

    const package = await Package.findByPk(packageId);

    if (!package) {
      // await transaction.rollback();
      return next(createError.createError(404, 'Package does not exist'));
    }

    const imagePath = req?.files?.companyLogo?.[0]?.path || null;
    const acctImagePath = req?.files?.acctImage?.[0]?.path || null;
    const bannerPath = req?.files?.companyBanner?.[0]?.path || null;


    const token = crypto.randomBytes(32).toString('hex');
    console.log(`createCompany's ,token`, token);


    const company = await Company.create(
      { ...companyData, companyLogo: imagePath, 
companyBanner: bannerPath },
      { transaction }
    );

    const currentDate = moment();
    const subscription = await Subscription.create(
      { duration },
      { transaction }
    );
   
    await subscription.setPackage(packageId,{transaction});
    await subscription.setCompany(company.id,{transaction} );

    const nextPaymentDate = await calculateNextPayment({
      chargeType: package.packageType,
      duration,
      normalDate: Date.now()
    });

    const leftPaymentDate = nextPaymentDate.diff(currentDate, 'days');

    await subscription.update(
      { nextPaymentDate, leftPaymentDate },
      { transaction }
    );

    const superAdmin = await User.findOne({
      where: { role: 'superAdmin' },
      // transaction
    });

    const [
      taxSlabs,
      // pensions,
      additionalAllowanceDefinitions,
      additionalDeductionDefinitions
    ] = await Promise.all([
      Taxslab.findAll({ where: { UserId: superAdmin.id, isActive: true } }, ),
      // Pension.findAll({ where: { UserId: superAdmin.id, isActive: true } }, ),
      AdditionalAllowanceDefinition.findAll({ where: { CompanyId: null } }, ),
      AdditionalDeductionDefinition.findAll({ where: { CompanyId: null } }, )
    ]);

    const taxes = await Promise.all(
      taxSlabs.map(taxSlab =>
        Taxslab.create(
          {
            from_Salary: Number(taxSlab.from_Salary),
            to_Salary: Number(taxSlab.to_Salary),
            income_tax_payable: Number(taxSlab.income_tax_payable),
            deductible_Fee: Number(taxSlab.deductible_Fee),
            CompanyId: company.id,
            UserId: null
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
      additionalAllowanceDefinitions.map(allowance =>
        AdditionalAllowanceDefinition.create(
          {
            name: allowance.name,
            isTaxable: allowance.isTaxable,
            isExempted: allowance.isExempted,
            exemptedAmount: allowance.exemptedAmount,
            startingAmount: allowance.startingAmount,
            CompanyId: company.id
          },
          { transaction }
        )
      )
    );

    const additionalDeductions = await Promise.all(
      additionalDeductionDefinitions.map(deduction =>
        AdditionalDeductionDefinition.create(
          {
            name: deduction.name,
            CompanyId: company.id
          },
          { transaction }
        )
      )
    );

    const  pension=await  Pension.create({         
      employeeContribution: 0,
      employerContribution: 0,
      CompanyId: Number(company?.id),
      isActive:true,
      UserId: null,
    },{transaction});

    const PF=  await ProvidentFund.create({         
      employeeContribution: 0,
      employerContribution: 0,
      CompanyId: Number(company?.id),
      isActive:true,
      UserId: null,
    },{transaction});

   
    await transaction.commit();

    const companyIdFormat = await IdFormat.create({
      companyCode: company.companyCode,
      year: 'true',
      department: 'true',
      separator: '/',
      order: 'companyCode,department,year',
      digitLength: 4
    });
    await companyIdFormat.setCompany(company.id);

      return res.status(201).json({
        success: true,
        message: 'Created successfully.  '
        
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
    //  return next(createError.createError(500, "Error sending activation email. Company status not updated"));
    
    // }
   
  } catch (error) {
    await transaction.rollback();
    console.error('Error:', error);
    return next(createError.createError(500, error.message));
  }
};

exports.getAllCompany = async (req, res, next) => {
  try {
    const companys = await Company.findAll({
      attributes: { exclude: ['password'] },
      include: [Subscription, Taxslab, Department]
    })

    // const baseUrl = "https://localhost:6000/";
    // const baseUrl = 'https://payroll-production.up.railway.app/'
    const baseUrl='https://10.2.125.125:4400/';
    const companies = companys.map(company => {
      if (company.companyLogo) {
        const imageUrl = `${baseUrl}${company.companyLogo.replace(/\\/g, '/')}`
        company.companyLogo = imageUrl
      }
      if (company.companyBanner) {
        const imageUrl = `${baseUrl}${company.companyBanner.replace(
          /\\/g,
          '/'
        )}`
        company.companyBanner = imageUrl
      }
      if (company.footer) {
        const imageUrl = `${baseUrl}${company.footer.replace(/\\/g, '/')}`
        company.footer = imageUrl
      }
      if (company.header) {
        const imageUrl = `${baseUrl}${company.header.replace(/\\/g, '/')}`
        company.header = imageUrl
      }
      return company
    })
    return res.json({count: companies.length,

      companies
    })
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}


exports.updateProjectBased=async(req,res,next) => {

  try {
    const {isProjectBased}=req.body;


    if (typeof isProjectBased !== 'boolean') {
        return next(createError.createError(400, 'Invalid value for isProjectBased. Must be a boolean.'));
    }
    const checkProject= await Company.findByPk(Number(req.user.id));
   
    if(!checkProject){
     return next(createError.createError(404,"company not found"))
    }
     
    if(checkProject?.isProjectBased){
      return next(createError.createError(409,"company already is project based"))
    }
    else{
      const company = await Company.findByPk(Number(req.user.id));
      company.isProjectBased=isProjectBased;
      company.isSetted=true;
      await company.save();
      return res.status(200).json({
        success: true,
        message: 'Project based company updated successfully'
      })
    }
  } catch (error) {
    console.log(error);
    return next(createError.createError(500, 'Internal server error'));
  }
}
exports.getCompanyById = async (req, res, next) => {
  const { id } = req.params

  try {
    const company = await Company.findByPk(Number(id), {
      attributes: { exclude: ['password'] }
    })
    if (!company) {
      return next(createError.createError(404, 'Company does not exist'))
    } else {
      return res.json(company)
    }
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.updateCompany = async (req, res, next) => {
  const { id } = req.params
  const body = req.body

  try {
    const company = await Company.findByPk(Number(id))
    if (!company) {
      return next(createError.createError(404, 'Company does not exist'))
    } else {
      if (body.password) {
        delete body.password
      }

      const logoPath =
        req?.files?.companyLogo && req?.files?.companyLogo[0]?.path
      const headerPath = req?.files?.['header']
        ? req?.files?.['header'][0]?.path
        : company.header
      const footerPath = req?.files?.['footer']
        ? req?.files?.['footer'][0]?.path
        : company.footer
      const updatedData = await company.update({
        ...body,
        companyLogo: logoPath,
        header: headerPath,
        footer: footerPath
      })
      return res
        .status(200)
        .json(successResponse.createSuccess('Updated successfully'))
      // return res.json(updatedData)
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}

// delete Company
exports.deleteCompany = async (req, res, next) => {
  
  const { id } = req.params
  try {
    const company = await Company.findByPk(Number(id))
    if (!company) {
      return next(createError.createError(404, 'Company does not exist'))
    } else {
      // await CompanyAccountInfo.destroy({
      //   where: { CompanyId: id },
      // });

      await company.destroy({ cascade: true })

      return res
        .status(200)
        .json(successResponse.createSuccess('company deleted successfully'))
    }
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))

  }
}

exports.getAllActiveCompany = async (req, res, next) => {
  try {
    const activeCompany = await Company.findAll({
      where: { status: 'active' }
    })
    res.status(200).json({
      count: activeCompany.length,
      activeCompany
    })
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

//ALL PENDING COMPANY
exports.getAllPendingCompany = async (req, res, next) => {
  try {
    const pendingCompany = await Company.findAll({
      where: { status: 'pending' }
    })

    res.status(200).json({
      count: pendingCompany.length,
      pendingCompany
    })
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

//ALL PENDING COMPANY
exports.getAllBlockedCompany = async (req, res, next) => {
  try {
    const blockedCompany = await Company.findAll({
      where: { status: 'blocked' }
    })

    res.status(200).json({
      count: blockedCompany.length,
      blockedCompany
    })
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

//ALL PENDING COMPANY
exports.getAllDeniedCompany = async (req, res, next) => {
  try {
    const deniedCompany = await Company.findAll({
      where: { status: 'denied' }
    })

    res.status(200).json({
      count: deniedCompany.length,
      deniedCompany
    })
  } catch (error) {
    return next(
      createError.createError(500, 'Internal Server Error')
    )
  }
}

//GET LEFT DATE
exports.getSubscriptionLeftDate = async (req, res, next) => {
  try {
    const companyId = Number(req.params.companyId)

    const company = await Company.findOne({where:{
    id:companyId}})
    if(!company){
      return next(createError.createError(404,"Company not found"))
    }
    const currentDate = moment()

    const subscriptionLeftDate = await Subscription.findOne({
      where: { CompanyId: companyId ,isActive:true},
      include: {model:Package}
    })

    const nextPaymentDate = moment(subscriptionLeftDate.nextPaymentDate)
    const startDate = moment(subscriptionLeftDate.createdAt)
    const diff = nextPaymentDate.diff(currentDate, 'days')
    return res.status(200).json({
      Subscription_left_date: diff,
      packageType: subscriptionLeftDate?.Package?.packageType,
       packageName: subscriptionLeftDate?.Package?.packageName
    })
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.updateAccountInfo= async(req,res,next)=>{

  const transaction = await sequelize.transaction()
  try {
    
    const {accountNumber,referenceNumber,referenceLetter,image}=req.body;
    console.log(req.body)

    if(!accountNumber|| !referenceNumber){
      return next(createError.createError(400,'please insert all requiered fields'))
    }
    if(!req.files?.referenceLetter?.[0]?.path){
      return next(createError.createError(400,'referenceLetter not found'))
    }
    const company = await Company.findByPk(Number(req.user.id));
     if(!company){
      return next(createError.createError(404,'company not found'));
     }


     const accountInfo = await AccountInfo.findOne({
      where: {  CompanyId: req.user.id ,isActive: true}
    })
    const data = req.files?.image?.[0]?.path
    const imagePath = data ? data : null
    const referenceLetterData = req.files?.referenceLetter?.[0]?.path
    const referenceLetterPath = referenceLetterData ? referenceLetterData : null
    if (!accountInfo) {
   
   
  console.log("data",data)
      
        // await accountInfo.update({ isActive: false }, { transaction })
        await AccountInfo.create(
          { accountNumber: accountNumber, referenceLetter:referenceLetterPath,referenceNumber:referenceNumber,image: imagePath,CompanyId:req.user.id },
          // { transaction }
      
      // await AccountInfo.create({
      //   accountNumber,referenceLetter,referenceNumber,image
      );
  
  
    }
    else{


    await accountInfo.update({ isActive: false }, { transaction })
    await AccountInfo.create(
      { accountNumber: accountNumber, referenceLetter:referenceLetterPath,referenceNumber:referenceNumber,image: imagePath,CompanyId:req.user.id,isActive:true },
      { transaction }
  
  // await AccountInfo.create({
  //   accountNumber,referenceLetter,referenceNumber,image
  );
    }
    await transaction.commit()
  return res.status(200).json({
    success: true,
    message: 'Account info updated successfully'
  })


  } catch (error) {
    await transaction.rollback()
    console.error(error);
    return next(createError.createError(500, 'Internal server error'));
  }
}





exports.resetPasswordToken = async(req, res,next) => {
 
  try {
    
    const { token } = req.params;
    const { password } = req.body;

   
  // return res.json("password")
    // Find the user by the toke  n
    const user = await Company.findOne({ where: { resetPasswordToken: token } });

    if (!user) {

      return next(createError.createError(404,"Invalid or expired token"))
    }

 const tokenCreationTime = user?.resetPasswordTokenCreatedAt;
 const tokenExpirationTime = new Date(tokenCreationTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours expiration
 const currentTime = new Date();

 if (currentTime > tokenExpirationTime) {

  return next(createError.createError(401,'Token has expired'))
 }


 await user.update({
  password,
  resetPasswordToken :null,
  resetPasswordTokenCreatedAt:null
  
 })



    res.json({ message: 'Password set successfully' });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const sendActivationEmail = async (email, subject,text,next) => {
  try {
    await sendEmail({
      email,
      subject: subject,
      text,
    });
    return true;
  } catch (err) {
    console.log(err)
    console.error("Error sending email:");
    return false;
    // return next(createError.createError(500, "Error sending activation email. Company status not updated"));
  }
};

exports.updateCompanyProfile= async(req,res,next)=>{
  try {
    const {
    primary_Color,
    primary_Font_Color,
    primary_Gradient_Color,    
    secondary_Color,
    secondary_Font_Color,
    secondary_Gradient_Color,   
    social_Media_Images,
  } = req.body;
const CompanyId= req.user.id;
const logo = req.files?.logo?.[0]?.path
  const logoPath = logo ? logo : null

  const banner = req.files?.logo?.[0]?.path
 
  const bannerPath = banner ? banner : null

  console.log(banner)
  console.log(logo)
  const company=await Company.update({
    primary_Color,
    primary_Font_Color,
    primary_Gradient_Color,    
    secondary_Color,
    secondary_Font_Color,
    secondary_Gradient_Color,   
    social_Media_Images,
    companyLogo:logo,
    companyBanner:banner

  
  },{
    where:{id:CompanyId}
  })
  
  return res.status(200).json({
    success:true,
    message:"Updated successfully",

  })
}catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
  }
}


exports.resetTodefauldCompanyProfiles= async(req,res,next)=>{
  try {
   
    const data = await Company.update(
      {
        primary_Color: "#1234",
        primary_Font_Color: "123456", // Assuming primary_Font_Color is a string
        primary_Gradient_Color: "#fff",
        secondary_Color: "#fff",
        secondary_Font_Color: "#fff",
        secondary_Gradient_Color: "#fff",
        social_Media_Images: true
      },
      {
        where: { id: req?.user?.id }
      }
    );

    return res.json({
      success:true,
      message:"Reset do default successfully",
    })

    
  } catch (error) {
    console.log(error);
    return next(createError.createError(500,"Internal server Error"))
  }
}
exports.createPassword = async (req,res,next)=> {
  try {

const password= req.body.password;
const token= req.params.token;
    // await sendEmail({
    //   company.email,
    //   subject: subject,
    //   text,
    // });
    return res.json(password)
  } catch (error) {
console.log(error)
return next(createError.createError(500,"Internal server error"))    
  }
}