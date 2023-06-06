const Company = require("../models/company");
const { promisify } = require("util");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Employee = require("../models/employee");
const CustomRole = require("../models/customRole");
const Permission = require("../models/permission.js");

exports.protectAll = async (req, res, next) => {
  try {
    //getting token check if its there
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
      return res.status(401).json({
        message: "You are not logged in, please log in to get access",
      });
    }
    //verification token
    const decoded = await promisify(jwt.verify)(token, "secret");

    //check if user still exists
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

    // console.log(JSON.stringify(currentUser), null, 4);
    if (!currentUser) {
      return res
        .status(401)
        .json({ error: `${currentUser.role} does not longer exists ` });
    }
    //check if user change password after jwt was issued
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //   return res.status(401).json({
    //     message: "Company recently changed password! please log in again.",
    //   });
    // }
    //grant access to protected route
    else {
      req.user = currentUser;

      next();
    }
  } catch (err) {
    return res.status(404).json({
      status: "Error occured",
      message: err,
    });
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
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }
  };
};

//Restricted to
exports.restrictToAdmin = (role) => {
  return async (req, res, next) => {
    if (req.user.role === role) {
      next();
    } else {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }
  };
};

//Restricted to
exports.restrictToAll = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
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

      const hasPermission =
        employee.CustomRole &&
        employee.CustomRole.Permissions.some(
          (permission) =>
            permission.module === moduleName &&
            permission.isAccessible === true
        );

        console.log("haspermission", hasPermission);
      //return res.json({ hasPermission });

      if (hasPermission) {
        next();
      } else {
        return res.status(403).json({
          message: "You do not have permission to perform this action",
        });
      }
    }
  };
};
