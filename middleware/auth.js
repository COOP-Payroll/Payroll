const Company = require("../models/company");
const { promisify } = require("util");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Employee = require("../models/employee");
const CustomRole = require("../models/customRole");
const Permission = require("../models/permission.js");
const createError = require(".././utils/error.js");
///
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const validator = require("validator");
const { json } = require("body-parser");
// const rateLimit = require('express-rate-limit');
// exports.sanitizeInput = (req, res, next) => {
//   try {
//     for (const key in req.body) {
//       if (req.body.hasOwnProperty(key)) {
//         // Sanitize the email field
//         if (key === "email") {
//           req.body[key] = validator.escape(
//             validator.normalizeEmail(req.body[key])
//           );
//         }
//         // Sanitize username field by escaping special characters
//         else if (key === "username") {
//           req.body[key] = validator.escape(req.body[key]);
//         }
//         // For password, we are not applying any sanitization
//         else if (key === "password") {
//           req.body[key] = req.body[key]; // No change needed for password sanitization
//         }
//         // Sanitize all other fields with escape
//         else {
//           req.body[key] = validator.escape(req.body[key]);
//         }
//       }
//     }
//     next();
//   } catch (error) {
//     console.log("Sanitization error:", error);
//     res.status(400).json({
//       status: "error",
//       message: "Invalid input data. Could not sanitize input.",
//     });
//   }
// };

// exports.sanitizeInput = (req, res, next) => {
//   try {
//     const sanitizedBody = {};

//     for (const key in req.body) {
//       if (req.body.hasOwnProperty(key)) {
//         const value = req.body[key];
//         // Ensure all values are strings before processing
//         if (typeof value === "string") {
//           if (key === "email") {
//             // Normalize and validate email
//             if (!validator.isEmail(value)) {
//               throw new Error("Invalid email format");
//             }
//             sanitizedBody[key] = validator.normalizeEmail(value);
//           } else if (key === "username") {
//             // Sanitize username by escaping special characters
//             sanitizedBody[key] = validator.escape(value);
//           } else if (key === "password") {
//             // Keep passwords untouched for hashing, but validate length
//             if (value.length < 8 || value.length > 128) {
//               throw new Error("Password must be between 8 and 128 characters");
//             }
//             sanitizedBody[key] = value;
//           } else {
//             // Escape other string fields
//             sanitizedBody[key] = validator.escape(value);
//           }
//         } else {
//           // Handle non-string fields (e.g., numbers, objects, arrays) if needed
//           sanitizedBody[key] = value;
//         }
//       }
//     }

//     // Replace req.body with sanitized data
//     req.body = sanitizedBody;
//     next();
//   } catch (error) {
//     console.error("Sanitization error:", error.message);
//     res.status(400).json({
//       status: "error",
//       message: error.message || "Invalid input data. Sanitization failed.",
//     });
//   }
// };

// User-Agent validation middleware

exports.sanitizeInput = (req, res, next) => {
  try {
    const sanitizedBody = {};

    for (const key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        const value = req.body[key];

        if (typeof value === "string") {
          if (key === "email") {
            // Sanitize email by removing HTML tags and escaping special characters
            const sanitizedEmail = value.replace(/<[^>]*>/g, ""); // Remove HTML tags
            sanitizedBody[key] = validator.escape(sanitizedEmail);
          } else if (key === "username" || key === "password") {
            // Escape special characters in the username
            sanitizedBody[key] = validator.escape(value);
          } else {
            // Escape other string fields
            sanitizedBody[key] = validator.escape(value);
          }
        } else {
          sanitizedBody[key] = value; // Retain non-string fields as-is
        }
      }
    }

    // Replace req.body with sanitized data
    req.body = sanitizedBody;
    next();
  } catch (error) {
    console.error("Sanitization error:", error.message);
    res.status(400).json({
      status: "error",
      message: "Input sanitization failed.",
    });
  }
};
exports.validateUserAgent = (req, res, next) => {
  const userAgent = req.headers["user-agent"];
  console.log("Received User-Agent:", userAgent); // Log the User-Agent

  if (!userAgent) {
    // return res.status(400).send("User-Agent header is missing");
    return next(createError.createError(400, "User-Agent header is missing"));
  }

  // Allow requests from common browsers (e.g., Chrome, Firefox, Safari, Edge, Opera)
  if (
    userAgent &&
    (userAgent.includes("Chrome") ||
      userAgent.includes("Firefox") ||
      userAgent.includes("Safari") ||
      userAgent.includes("Edge") ||
      userAgent.includes("Opera") ||
      userAgent.includes("Trident") ||
      userAgent.includes("MSIE"))
  ) {
    return next();
  }
  return next(createError.createError(400, "Invalid user-agent"));
  // return res.status(400).send("Invalid User-Agent");
};

// exports.validateUserAgent = (req, res, next) => {
//   try {
//     const userAgent = req.headers["user-agent"];

//     return res.json(userAgent);

//     // Example: Reject if User-Agent is unusually long or malformed
//     if (
//       userAgent.length > 256 ||
//       !/^[a-zA-Z0-9\s\-\/\.\(\)\,]+$/.test(userAgent)
//     ) {
//       // return res.status(400).send("Invalid User-Agent");
//       return next(createError.createError(400, "Invalid User-Agent"));
//     }

//     // Proceed if User-Agent is valid
//     next();
//   } catch (error) {
//     console.log(err);

//     return next(createError.createError(503, "Error occor"));
//   }
// };
exports.protectAll = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token || token === "expiredtoken") {
      return next(
        createError.createError(
          401,
          "You are not logged in, please log in to get access"
        )
      );
    }
    const decoded = await promisify(jwt.verify)(token, accessTokenSecret);

    let currentUser;

    if (decoded.role === "superAdmin") {
      currentUser = await User.findByPk(Number(decoded.id));
    } else if (decoded.role === "companyAdmin") {
      currentUser = await Company.findByPk(Number(decoded.id));
    } else if (decoded.role === "employee") {
      currentUser = await Employee.findByPk(Number(decoded.id));
    } else if (decoded.role === "approver") {
      currentUser = await Employee.findByPk(Number(decoded.id));
    }
    if (!currentUser) {
      return next(
        createError.createError(401, `currentUserdoes not longer exists `)
      );
    } else {
      req.user = currentUser;

      next();
    }
  } catch (err) {
    console.log(err);

    return next(createError.createError(401, "unauthorized access"));
  }
};

exports.isLoggedIN = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // User is logged in, proceed to logout
  } else {
    return next(
      createError.createError(
        401,
        "You are not logged in, please log in to get access"
      )
    );
  }
};
//Restricted to
exports.restrictTo = (role) => {
  return async (req, res, next) => {
    if (req.user.role === role) {
      next();
      // } else {
      //   const permissions = req.user?.customRole[0]?.permissions.find(
      //     (per) => per.module === Object.keys(roles).toString()
      //   );
      //   if (permissions[Object.values(roles)]) {
      //     next();
      //
    } else {
      return next(
        createError.createError(
          401,
          "You do not have permission to perform this action"
        )
      );
    }
  };
};

//Restricted to
exports.restrictToAdmin = (role) => {
  return async (req, res, next) => {
    if (req.user.role === role) {
      next();
    } else {
      return next(
        createError.createError(
          401,
          "You do not have permission to perform this action"
        )
      );
    }
  };
};

//Restricted to
exports.restrictToAll = (...roles) => {
  return (req, res, next) => {
    // return res.json(req.user.role)
    if (!roles.includes(req.user?.role)) {
      return res.status(401).json({
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

exports.restrictALL = ({ moduleName, isAccessible }) => {
  return async (req, res, next) => {
    if (req.user.role === "companyAdmin" || req.user.role === "superAdmin") {
      next();
    } else {
      const employee = await Employee.findOne({
        where: { id: req.user.id },
        include: [
          {
            model: CustomRole,
            include: [
              {
                model: Permission,
                attributes: ["id", "module", "isAccessible"],
              },
            ],
          },
        ],
      });
      if (!employee) {
        return res.status(404).json({ message: "Employee not found." });
      }

      const hasPermission =
        employee.CustomRole &&
        employee.CustomRole.Permissions.find(
          (permission) =>
            permission.module === moduleName && permission.isAccessible === true
        );
      console.log("haspermission", hasPermission);

      if (hasPermission) {
        next();
      } else {
        return res.status(401).json({
          message: "You do not have permission to perform this action",
        });
      }
    }
  };
};

//Restricted to
exports.restrictApprover = ({ moduleName, isAccessible }) => {
  return async (req, res, next) => {
    if (
      req.user.role === "companyAdmin" ||
      req.user.role === "superAdmin" ||
      req.user.role === "approver"
    ) {
      next();
    } else {
      //const { moduleName, employeeId } = req.body;
      const employee = await Employee.findOne({
        where: { id: req.user.id },
        include: [
          {
            model: CustomRole,
            include: [{ model: Permission }],
          },
        ],
      });

      if (!employee) {
        return res.status(404).json({ message: "Employee not found." });
      }

      // console.log("first", employee.CustomRole.Permissions);
      const hasPermission =
        employee.CustomRole &&
        employee.CustomRole.Permissions.find(
          (permission) =>
            permission.module === moduleName && permission.isAccessible === true
        );

      console.log("haspermission", hasPermission);
      //return res.json({ hasPermission });

      if (hasPermission) {
        next();
      } else {
        return res.status(401).json({
          message: "You do not have permission to perform this action",
        });
      }
    }
  };
};
