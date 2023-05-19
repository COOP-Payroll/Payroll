const Company = require("../models/company");
const { promisify } = require("util");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

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
    // console.log(decoded.id);
    //check if user still exists
    let currentUser;

    if (decoded.role === "superAdmin") {
      currentUser = await User.findByPk(Number(decoded.id));
    } else {
      currentUser = await Company.findByPk(Number(decoded.id));
    }

    // console.log(JSON.stringify(currentUser), null, 4);
    if (!currentUser) {
      return res
        .status(401)
        .json({ error: `${currentUser.role} does not longer exists` });
    }
    //check if user change password after jwt was issued
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //   return res.status(401).json({
    //     message: "Company recently changed password! please log in again.",
    //   });
    // }
    //grant access to protected route
    req.user = currentUser;
    //console.log(currentUser);
    next();
  } catch (err) {
    // console.log("first", err);
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
    console.log("roles", roles);
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
