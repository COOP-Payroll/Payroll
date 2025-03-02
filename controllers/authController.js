const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Company = require("../models/company");
const User = require("../models/user");
const Employee = require("../models/employee");
const CustomRole = require("../models/customRole");
const Permission = require("../models/permission");
const createError = require("../utils/error");
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
// SIGNTOKEN
const signToken = (
  id,
  role,
  fullName,
  phoneNumber,
  permissions,
  organizationName,
  isSetted,
  isProjectBased,
  company
) => {
  try {
    const token = jwt.sign(
      {
        id,
        role,
        fullName,
        phoneNumber,
        permissions,
        organizationName,
        isSetted,
        isProjectBased,
        company,
      },
      accessTokenSecret,
      {
        expiresIn: "30000m",
      }
    );

    const refreshToken = jwt.sign({ id, role }, refreshTokenSecret, {
      expiresIn: "30000m",
    });
    return { token, refreshToken };
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
const signTokenSuperAdmin = (id, role, fullName, phoneNumber, email) => {
  try {
    const token = jwt.sign(
      { id, role, fullName, phoneNumber, email },
      accessTokenSecret,
      {
        expiresIn: "30000m",
      }
    );
    const refreshToken = jwt.sign(
      { id, role, fullName, phoneNumber, email },
      refreshTokenSecret,
      {
        expiresIn: "30000m", // Set your desired expiration time for refresh tokens
      }
    );

    return { token, refreshToken };
    // jwt.sign({ id, isProjectBased,isSetted, role }, "secret", {
    //   expiresIn: "90d",
    // });
  } catch (err) {
    return res.status(503).json("An error occurred, please try again later");
  }
};

//SIGNTOKEN FOR COMPANY
const signTokenCompany = (company, res) => {
  try {
    const {
      id,
      name,
      numberOfEmployees,
      status,
      organizationName,
      email,
      role,
      jobTitle,
      companyCode,
      country,
      primary_Color,
      primary_Font_Color,
      primary_Gradient_Color,
      secondary_Color,
      secondary_Font_Color,
      secondary_Gradient_Color,
      // Permissions,
      isProjectBased,
      isSetted,
      Permissions,
    } = company;

    const token = jwt.sign(
      {
        id,
        name,
        numberOfEmployees,
        status,
        organizationName,
        email,
        role,
        jobTitle,
        companyCode,
        country,
        primary_Color,
        primary_Font_Color,
        primary_Gradient_Color,
        secondary_Color,
        secondary_Font_Color,
        secondary_Gradient_Color,
        // Permissions,
        isProjectBased,
        isSetted,

        permissions: [
          {
            module: "dashboard",
            isAccessible: true,
          },
          {
            module: "systemsettings",
            isAccessible: true,
          },
          {
            module: "employeelist",
            isAccessible: true,
          },
          {
            module: "newemployee",
            isAccessible: true,
          },
          {
            module: "payrollsetups",
            isAccessible: true,
          },
          {
            module: "payrollprocess",
            isAccessible: true,
          },
          {
            module: "payrollpublished",
            isAccessible: true,
          },
          {
            module: "payrollpayment",
            isAccessible: true,
          },
          {
            module: "unprocessedsalary",
            isAccessible: true,
          },
          {
            module: "payrollpublishedreports",
            isAccessible: true,
          },
          {
            module: "ai",
            isAccessible: true,
          },
        ],
      },
      accessTokenSecret,
      {
        expiresIn: "30000m",
      }
    );
    const refreshToken = jwt.sign(
      {
        id,
        name,
        numberOfEmployees,
        status,
        organizationName,
        email,
        role,
        jobTitle,
        companyCode,
        country,
        primary_Color,
        primary_Font_Color,
        primary_Gradient_Color,
        secondary_Color,
        secondary_Font_Color,
        secondary_Gradient_Color,
        // Permissions,
        isProjectBased,
        isSetted,
        permissions: [
          {
            module: "dashboard",
            isAccessible: true,
          },
          {
            module: "systemsettings",
            isAccessible: true,
          },
          {
            module: "employeelist",
            isAccessible: true,
          },
          {
            module: "newemployee",
            isAccessible: true,
          },
          {
            module: "payrollsetups",
            isAccessible: true,
          },
          {
            module: "payrollprocess",
            isAccessible: true,
          },
          {
            module: "payrollpublished",
            isAccessible: true,
          },
          {
            module: "payrollpayment",
            isAccessible: true,
          },
          {
            module: "unprocessedsalary",
            isAccessible: true,
          },
          {
            module: "payrollpublishedreports",
            isAccessible: true,
          },
          {
            module: "ai",
            isAccessible: true,
          },
        ],
      },
      refreshTokenSecret,
      {
        expiresIn: "30000m", // Set your desired expiration time for refresh tokens
      }
    );

    return { token, refreshToken };
    // jwt.sign({ id, isProjectBased,isSetted, role }, "secret", {
    //   expiresIn: "90d",
    // });
  } catch (err) {
    // throw new Error("Internal server error");
    console.error("Error in signTokenCompany:", err); //
  }
};

//CREATESENDTOKEN FOR COMPANY
const createSendTokenCompany = async (company, statusCode, res) => {
  try {
    const { token, refreshToken } = signTokenCompany(company, res);

    company.password = undefined;
    res.status(200).json({
      // data: {
      //   company,
      // },
      token,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    console.log(error.message);

    return res
      .status(503)
      .json({ message: "An error occurred, please try again late" });
    // return next(
    //   createError.createError(503, "An error occurred, please try again later")
    // );
  }
};

const createSendTokenSuperAdmin = async (company, statusCode, res) => {
  try {
    // const company = await User.findOne({ where: { id: 1 } });
    // return res.json(company.role);

    const { token, refreshToken } = signTokenSuperAdmin(
      company.id,
      company.role,
      company.fullName,
      company.phoneNumber,
      company.email
    );

    company.password = undefined;
    res.status(statusCode).json({
      token,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({ message: "Internal server error" });
    // return next(createError.createError(503, error.message));
  }
};
// CREATESEND TOKEN
const createSendToken = async (company, statusCode, res) => {
  try {
    const permissionsList =
      company.CustomRole && Array.isArray(company.CustomRole.Permissions)
        ? company.CustomRole.Permissions.map((perm) => ({
            id: perm.id,
            module: perm.module,
            isAccessible: perm.isAccessible,
          }))
        : [];
    const company1 = await Company.findOne({
      where: { id: company?.CompanyId },
      attributes: [
        "id",
        "organizationName",
        "companyCode",
        "isProjectBased",
        "isSetted",
      ],
    });
    // return res.json(company1);

    const { token, refreshToken } = signToken(
      company.id,
      company.role,
      company.fullName,
      company.phoneNumber,
      permissionsList,
      company1.organizationName,
      company1.isSetted,
      company1.isProjectBased,
      company1
    );

    company.password = undefined;
    res.status(statusCode).json({
      token,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({ message: "Internal server error" });
    // return next(createError.createError(503, error.message));
  }
};

exports.login = async (req, res, next) => {
  try {
    // return res.json("dkjhgf");?
    let company;
    const { email, password, companyCode } = req.body;
    if (!email || !password || !companyCode) {
      return res
        .status(404)
        .json({ message: "please provide email, password or company code" });
    }

    company = await Company.findOne({
      where: { email },
      include: [
        {
          model: Permission,
          attributes: ["id", "module", "isAccessible"],
          through: {
            attributes: [],
          },
        },
      ],
    });
    // return res.json(company);
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

    if (company?.status === "pending") {
      return next(
        createError.createError(
          401,
          "your request is being processed please stay tune"
        )
      );
    }

    if (company?.role === "companyAdmin") {
      if (
        !company ||
        company?.companyCode != companyCode ||
        !(await bcrypt.compare(password, company?.password))
      ) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    if (company == null) {
      return next(createError.createError(400, "Invalid credentials"));
    }
    if (company?.role === "employee" || company?.role === "approver") {
      // return res.json(company);
      createSendToken(company, 200, res);
    } else {
      if (company?.status === "active") {
        createSendTokenCompany(company, 200, res);
      } else {
        switch (company?.status) {
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
    console.log(err);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// SUPER ADMIN LOGIN
exports.superAdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        createError.createError(400, "Please provide email or password")
      );
    }
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    } else {
      return createSendTokenSuperAdmin(user, 200, res);
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//LOGOUT
exports.logout = async (req, res, next) => {
  try {
    if (req.cookies && req.cookies.jwt) {
      const jwtCookie = req.cookies.jwt;

      res.clearCookie("jwt");

      res.status(200).json({ message: "Logout successful" });
    } else {
      res.status(401).json({ message: "User is not logged in" });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//VERIFYREFRESH TOKEN
const verifyRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, refreshTokenSecret);
    return decoded;
  } catch (err) {
    return next(createError.createError(503, "Invalid refresh token"));
    // throw new Error("Invalid refresh token");
  }
};

// REFRESHTOKEN
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(createError.createError(400, "Refresh token is missing"));
    }

    const decoded = verifyRefreshToken(refreshToken);

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      accessTokenSecret,
      {
        expiresIn: "30000m",
      }
    );

    res.status(200).json({
      token: newAccessToken,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
