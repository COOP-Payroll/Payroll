const User = require("../models/user.js");
const Company = require("../models/company.js");
const createError = require('../utils/error.js');
const AccountInfo = require("../models/accountInfo.js");
const sequelize = require('../database/db')
const sendEmail = require("../utils/sendEmail.js");
const axios = require('axios');
const crypto = require('crypto');

// const jwt = require('jsonwebtoken');
// create User
exports.createUser = async (req, res,next) => {
  // const body = req.body;

  try {

    const {fullName, email,password,AccountNumber,phoneNumber,role}= req.body;

    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return next(createError.createError(409, "User with this email is already registered."));

    } else {
      const user = await User.create({ 
       fullName,
       email,
       phoneNumber:phoneNumber,
       AccountNumber:AccountNumber,
       password:'pass',
       role: role?? 'superAdmin'

       });
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
    console.log(error)
    return next(createError.createError(500, "Internal server error"));
  }
};

// get AllUser
exports.getAllUser = async (req, res,next) => {

  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    delete users.createdAt;
    delete users.updatedAt;
    return res.status(200).json(users);
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }

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

exports.updateCompanyStatus1 = async (req, res,next) => {

  const transaction = await sequelize.transaction();
  const { id, status } = req.body;
  try {
   
    const expirationHours=24;
    const company = await Company.findByPk(Number(id), {
      attributes: { exclude: ["password"] },
    });
    const token = crypto.randomBytes(32).toString('hex');
    console.log(`createCompany's ,token`, token);
    const passwordCreationLink = `http://10.101.200.91:4400/api/company/setpassword/${token}`;
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
    <form action="${passwordCreationLink}" method="POST">
    <input type="hidden" name="token" value="${token}" />
    <button type="submit">Create Your Password</button>
  </form>
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

        await company.update({ 
          status ,
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

exports.updateCompanyStatus = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  const { id, status } = req.body;
  
  try {
    const expirationHours = 24;
    const company = await Company.findByPk(Number(id), {
      attributes: { exclude: ["password"] },
    });

    if (!company) {
      return next(createError(404, "Company does not exist"));
    }

    const token = crypto.randomBytes(32).toString('hex');

    const passwordCreationLink = `http://10.101.200.91:4400/api/company/setpassword`;
    // axios.post(apiUrl, requestData, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   }
    // })
    // .then(response => {
    //   // Handle response
    //   console.log(response.data);
    // })
    // .catch(error => {
    //   // Handle error
    //   console.error(error);
    // });


    var text = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${company.name}</title>
      </head>
      <body>
        <p>Dear ${company.name},</p>
        <p>Thank you for registering with <strong>our platform</strong>! We're excited to have you on board.</p>
        <p>To complete your account setup, please click on the link below to create your account password:</p>
        <p><a href="#" id="passwordLink" onclick="setAuthorizationHeader('${passwordCreationLink}', '${token}')">Create Your Password</a></p>
        <p>This link will expire in <strong>${expirationHours}</strong> hours for security reasons, so be sure to create your password as soon as possible.</p>
        <p>Welcome again, and thank you for choosing <strong>our platform</strong>.</p>
        <p>Best regards,</p>
        <p><strong>CoopPayroll Software as a Service Team</strong></p>
      </body>
      </html>
    `;

    // if (company.status === status) {
    //   return next(createError.createError(409, `Company is already ${status}`));
    // }

    await company.update({ 
      status,
      resetPasswordTokenCreatedAt: new Date(), 
      resetPasswordToken: token 
    }, { transaction });

    await sendEmail({
      email: company.email,
      subject: "Create Your Account Password.",
      html: text
    }, { transaction });

    await transaction.commit();

    return res.status(200).json({ message: "Company status activated successfully" });
  } catch (error) {
    console.error(error);
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


//Activate and deactivate user


//ACTIVATE || DEACTIVATE USER
exports.activateUser = async (req, res, next) => {
  try {
    //insert required field
    const updates = {};

    const { id, action } = req.body;

    const validActions = ["activate", "deactivate"];

    // Check if the action is valid
    if (!validActions.includes(action)) {
      return next(createError.createError(400, "Invalid action specified."));
    }

    if (!id || !action) {
      return next(createError.createError(400, "Provide required fields"));
    }

    const user = await User.findOne({
      where: { id: Number(id) },
    });
    if (!user) {
      return next(createError.createError(404, "User not found"));
    }
    if (action === "activate") {
      if (user.isActive) {
        return next(
          createError.createError(400, "The user  is already active")
        );
      } else {
        const result = await user.update({ isActive: true });
        res.status(200).json({
          message: "User Activated successfully",
        });
      }
    } else if (action === "deactivate") {
    
      if (!user.isActive) {
        return next(
          createError.createError(
            400,
            "The user  is already deactiveted"
          )
        );
      } else {
        const result = await user.update({ isActive: false });
        res.status(200).json({
          message: "User deactivated successfully.",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return next(createError.createError(500, "Internal server Error"));
  }
};