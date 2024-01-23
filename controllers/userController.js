const User = require("../models/user.js");
const Company = require("../models/company.js");
const createError = require('.././utils/error.js');
const AccountInfo = require("../models/accountInfo.js");
const sequelize = require('../database/db')


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
  const { id, status } = req.body;
  try {
    const company = await Company.findByPk(Number(id), {
      attributes: { exclude: ["password"] },
    });
    if (!company)
    return next(createError.createError(404, "company does not exist"));
          await company.update({ status });
    return res
      .status(200)
      .json({ message: "Company status Activated successfully" });
  } catch (error) {
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
