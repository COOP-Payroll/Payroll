const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Company = require("../models/company");
const User = require("../models/user");

const signToken = (id, role) => {
  try {
    return jwt.sign({ id, role }, "secret", {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

const createSendToken = (company, statusCode, res) => {
  const token = signToken(company.id, company.role);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: true,
  };
  company.password = undefined;
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    message: "successful",
    token,

    data: {
      company,
    },
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, companyCode } = req.body;

    //check if email and password exist company code
    if (!email || !password || !companyCode) {
      return res
        .status(404)
        .json({ error: "please provide email, password or company code" });
    }

    //check if user exists and password is correct
    const company = await Company.findOne({ where: { email } });
    if (
      !company ||
      company.companyCode != companyCode ||
      !(await bcrypt.compare(password, company.password))
    ) {
      return res
        .status(401)
        .json({ message: "Incorrect email, password or company Code" });
    } else if (company.status === "active") {
      createSendToken(company, 200, res);
    } else {
      switch (company.status) {
        case "pending":
          return res.status(401).json({
            error: "your request is being processed please stay tune",
          });
        case "blocked":
          return res.status(401).json({
            error: "Your account has been blocked",
          });
        case "denied":
          return res.status(401).json({
            error: "Your account has been denied",
          });
        default:
          return res.status(401).json({
            error: "Unknown status",
          });
      }
    }
  } catch (err) {
    //next(createError.createError(404, 'failed'));
    res.status(404).json({
      status: "fail123",
      message: err,
    });
  }
};

///super admin login
exports.superAdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //check if email and password exist company code
    if (!email || !password) {
      return res.status(404).json({ error: "please provide email, password" });
    }
    //check if user exists and password is correct
    const user = await User.findOne({ where: { email } });
    if (
      !user ||
      user.role != "superAdmin" ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ error: "Incorrect email, password" });
      //next(createError.createError(401,'Incorrect email, password or company Code'))
    }

    //if everything is ok send token to the client
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(404).json({
      status: "error occour",
      message: err,
    });
  }
};
