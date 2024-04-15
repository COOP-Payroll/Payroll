const User = require("../models/user.js");
const Company = require("../models/company.js");
const createError = require('.././utils/error.js');
const AccountInfo = require("../models/accountInfo.js");
const sequelize = require('../database/db')
const sendEmail = require("../utils/sendEmail.js");
const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
// create User
exports.createUser = async (req, res,next) => {
  const body = req.body;

  try {
    const existingUser = await User.findOne({ where: { email: body.email } });
    if (existingUser) {
      return next(createError.createError(409, "User with this email is already registered."));

    } else {
      const user = await User.create({ ...body });
      return res.status(200).json({
        status: 'true',
        message: "User successfully registered.",
        data:{user:{
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        }}, 
      });
    }
  } catch (error) {
    return next(createError.createError(500, "Internal server error"));
  }
};

// get AllUser
exports.getAllUser = async (req, res,next) => {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
  });
  delete users.createdAt;
  delete users.updatedAt;
  return res.status(200).json(users);
};

// get only one user
exports.getUserById = async (req, res,next) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(Number(id), {
      attributes: { exclude: ["password"] },
    });
    if (!user) return next(createError.createError(404, "User does not exist"));
   
    return res.json(user);
  }
  catch (error) {
    return next(createError.createError(500, "Internal server error"));
  }
};

// update User
exports.updateUser = async (req, res,next) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const user = await User.findByPk(Number(id));
    if (!user) return next(createError.createError(404, "User does not exist"));

    if (body.password) {
      delete body.password;
    }

    await user.validate();
    await user.update({ ...body });
    return res.json(user);
  } catch (error) {
    return next(createError.createError(500, "Internal server error"));
  }
};

// delete User
exports.deleteUser = async (req, res,next) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(Number(id));
    if (!user) return next(createError.createError(404, "User does not exist"));
    await user.destroy();
    return res.json("user deleted successfully");
  } catch (error) {
    return next(createError.createError(500, "Internal server error"));
   
  }
};

exports.updateCompanyStatus = async (req, res,next) => {

  const transaction = await sequelize.transaction();
  const { id, status } = req.body;
  try {
   
    const expirationHours=24;
    const company = await Company.findByPk(Number(id), {
      attributes: { exclude: ["password"] },
    });
    const token = crypto.randomBytes(32).toString('hex');
    console.log(`createCompany's ,token`, token);
    const passwordCreationLink = `http://10.2.125.124/setpassword?${token}`;
    if (!company){
    return next(createError.createError(404, "company does not exist"));
    }

    var text =`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${company.name}</title>
    </head>
    <body>
    <p>Dear ${company.name},</p>
    <p>Thank you for registering with <strong>on our platform.</strong>! We're excited to have you on board.</p>
    <p>To complete your account setup, please click on the link below to create your account password:</p>
    <p><a href="${passwordCreationLink}">Create Your Password</a></p>
    <p>This link will expire in <strong>${expirationHours}</strong> hours for security reasons, so be sure to create your password as soon as possible.</p>
    
    <p>Welcome again, and thank you for choosing <strong> our platform </strong>.</p>
    <p>Best regards,</p>
    <p><strong> CoopPayroll Software as a Service Team</strong></p>
    </body>
    </html>
    `;
    if(company.status  == status ){
      // return next(createError.createError(409,`Company is already ${status}`))

    }

        await company.update({ status ,
          resetPasswordTokenCreatedAt:new Date(), 
          resetPasswordToken:token},
          {transaction});
          await sendEmail({
            email: company.email,
            subject: "Create Your Account Password.",
            // text,
            html:text
          },{transaction});

          await transaction.commit();
        
    return res
      .status(200)
      .json({ message: "Company status Activated successfully" });
  } catch (error) {
    console.log(error)
    await transaction.rollback();
    return next(createError.createError(500, "Internal server error"));
  }
};


exports.verifyCompanyAccount = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  try {
    const id = req.params.id
    const accountId = req.body.accountId
    const company = await Company.findOne(
      { where: { id: id } },
      {
        attributes: { exclude: ['password'] }
      }
    )

    // console.log("id",company);
    if (!company)
      return next(createError.createError(404, 'company does not exist'))
    // await company.update({ status });

    const foundAccount = await AccountInfo.findOne({
      where: { id: accountId, isActive: true, isVerified: false, CompanyId: id }
    })
    if (!foundAccount) {
      return next(
        createError.createError(404, 'Account does not exist or verified')
      )
    }
    const data = await foundAccount.update(
      { isVerified: true },
      { transaction }
    )
    await transaction.commit()
    return res.status(200).json({ message: 'Account verified successfully' })
  } catch (error) {
    console.log(error)
    await transaction.rollback()
    return next(createError.createError(500, 'Internal server error'))
  }
}
