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
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_CODE);
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
    // console.log(currentUser);
    next();
  } catch (err) {
    // console.log("first", err);
    res.status(404).json({
      status: "Error occured",
      message: err,
    });
  }
};

//Restricted to
exports.restrictToA = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
