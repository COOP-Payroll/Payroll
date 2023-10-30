const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Company = require("../models/company");
const User = require("../models/user");
const Employee = require("../models/employee");
const CustomRole = require("../models/customRole");
const Permission = require("../models/permission");
const cookieParser = require("cookie-parser");

const signToken = (id, role) => {
  try {
    return jwt.sign({ id, role }, "secret", {
      expiresIn: "90d",
    });
  } catch (err) {
    // res.json(err);
    return err;
  }
};

const createSendToken = async (company, statusCode, res) => {
  try {
    const token = signToken(company.id, company.role);
    const cookieOptions = {
      expires: new Date(Date.now() + 1000 * 24 * 60 * 60 * 1000),

      secure: "production" ? true : false,
      httpOnly: true,
    };
    company.password = undefined;
    res.cookie("jwt", token, cookieOptions);
    res.status(statusCode).json({
      message: "successful",

      data: {
        company,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.name });
  }
};

exports.login = async (req, res, next) => {
  try {
  
    let company;
    const { email, password, companyCode } = req.body;

    //check if email and password exist company code
    if (!email || !password || !companyCode) {
      return res
        .status(404)
        .json({ message: "please provide email, password or company code" });
    }

    //check if user exists and password is correct
    company = await Company.findOne({ where: { email } });

    if (company === null) {
     
      company = await Employee.findOne({
        where: { email },
        include: [
          {
            model: CustomRole,
            include: [Permission],
          },
        ],
      });
    }

    if (!company || !(await bcrypt.compare(password, company.password))) {
      return res.status(401).json({
        message:
          "Unauthorized access - Invalid email, password or company code",
      });
    }
    if (company.role === "employee" || company.role === "approver") {
      createSendToken(company, 200, res);
    } else {
      if (company.status === "active") {
        createSendToken(company, 200, res);
      } else {
        switch (company.status) {
          case "pending":
            return res.status(401).json({
              message: "your request is being processed please stay tune",
            });
          case "blocked":
            return res.status(401).json({
              message: "Your account has been blocked",
            });
          case "denied":
            return res.status(401).json({
              message: "Your account has been denied",
            });
          default:
            return res.status(401).json({
              message: "Unknown status",
            });
        }
      }
    }
  } catch (err) {
    //next(createError.createError(404, 'failed'));
    res.status(500).json({
      message: err.name,
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
      return res.status(401).json({ message: "Incorrect email, password" });
      //next(createError.createError(401,'Incorrect email, password or company Code'))
    } else {
      return createSendToken(user, 200, res);
    }

    //if everything is ok send token to the client
  } catch (error) {
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

exports.logout = async (req, res, next) => {
  try {
    if (req.cookies && req.cookies.jwt) {
      // Access the JWT cookie
      const jwtCookie = req.cookies.jwt;

      // Clear the JWT cookie
      res.clearCookie("jwt");

      // Send a JSON response for successful logout
      res.status(200).json({ message: "Logout successful" });
    } else {
      // Handle the case where the JWT cookie is not present
      res.status(401).json({ message: "User is not logged in" });
    }
  } catch (error) {
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
