const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Company = require("../models/company");
const User = require("../models/user");
const Employee = require("../models/employee");
const CustomRole = require("../models/customRole");
const Permission = require("../models/permission");
const  createError  = require("../utils/error");


// SIGNTOKEN
const signToken = (id, role,fullName,phoneNumber) => {
  try {

    const token = jwt.sign({ id, role ,fullName,phoneNumber}, 'secret', {
      expiresIn: '7d'
    })

    const refreshToken = jwt.sign({ id, role }, 'refreshSecret', {
      expiresIn: '90d' 
    })
    return  { token, refreshToken }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }
};

//SIGNTOKEN FOR COMPANY
const signTokenCompany = (company) => {
  try {
  

    console.log("data1")



    const { id, name, numberOfEmployees, status, organizationName, email, role, jobTitle, companyCode, country,
      primary_Color, primary_Font_Color, primary_Gradient_Color, secondary_Color, secondary_Font_Color, secondary_Gradient_Color,
      Permissions ,isProjectBased,isSetted} = company;


    const token = jwt.sign({  id, name, numberOfEmployees, status, organizationName, email, role, jobTitle, companyCode, country,
      primary_Color, primary_Font_Color, primary_Gradient_Color, secondary_Color, secondary_Font_Color, secondary_Gradient_Color,
      Permissions,isProjectBased,isSetted},'secret', {
      expiresIn: '7d'
    })
    const refreshToken = jwt.sign({  id, name, numberOfEmployees, status, organizationName, email, role, jobTitle, companyCode, country,
      primary_Color, primary_Font_Color, primary_Gradient_Color, secondary_Color, secondary_Font_Color, secondary_Gradient_Color,
      Permissions,isProjectBased,isSetted},'refreshSecret', {
      expiresIn: '90d' // Set your desired expiration time for refresh tokens
    })
   
    return { token, refreshToken };
    // jwt.sign({ id, isProjectBased,isSetted, role }, "secret", {
    //   expiresIn: "90d",
    // });
  } catch (err) {
    // res.json(err);
    return err;
  }
};

//CREATESENDTOKEN FOR COMPANY
const createSendTokenCompany = async (company, statusCode, res) => {
  try {
  

     const {token,refreshToken} = signTokenCompany(company);
     console.log("refreshToken")

    const cookieOptions = {
      expires: new Date(Date.now() + 1000 * 24 * 60 * 60 * 1000),

      secure: "production" ? true : false,
      httpOnly: true,
    };
    company.password = undefined;
    res.cookie("jwt", token, cookieOptions);
    res.status(statusCode).json({

      data: {
        company,
      },
      token,
      refreshToken
    });
  } catch (error) {

    console.log(error)
    return res.status(500).json({ message: error.name });
  }
};

// CREATESEND TOKEN
const createSendToken = async (company, statusCode, res) => {
  try {

    
    const {token,refreshToken} = signToken(company.id, company.role,company.fullName,company.phoneNumber);
    const cookieOptions = {
      expires: new Date(Date.now() + 1000 * 24 * 60 * 60 * 1000),

      secure: "production" ? true : false,
      httpOnly: true,
    };
    company.password = undefined
    res.cookie('jwt', token, cookieOptions)
    res.status(statusCode).json({
  
      token,
      refreshToken  
    })
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,error.message))
  }
};

exports.login = async (req, res, next) => {
  try {
  
    let company;
    const { email, password, companyCode } = req.body;

    if (!email || !password || !companyCode) {
      return res
        .status(404)
        .json({ message: "please provide email, password or company code" });
    }

    company = await Company.findOne({ where: { email } ,
      include:[
    
      {model: Permission,
        attributes:['id', 'module','isAccessible'],
        through: {
          attributes: [] 
        }
      }
      ]
    });

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

    if(company?.status === 'pending'){
      return next(createError.createError(401,"your request is being processed please stay tune"))
    }


   
    if (!company ||   company.companyCode != companyCode|| !(await bcrypt.compare(password, company.password))) {
      return res.status(401).json({
        message:
          "Unauthorized access - Invalid email, password or company code",
      });
    }
    if (company.role === "employee" || company.role === "approver") {
      createSendToken(company, 200, res);
    } else {
      if (company.status === "active") {

        createSendTokenCompany(company, 200, res);
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
   

    return next(createError.createError(500, err.message));
 
  }
};

// SUPER ADMIN LOGIN
exports.superAdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

       if (!email || !password) {

        return next(createError.createError(400,"Please provide email or password"))
      return res.status(404).json({ error: "please provide email, password" });
    }
    const user = await User.findOne({ where: { email } });
    if (
      !user ||
     
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({ message: "Incorrect email, password" });
    } else {
      return createSendToken(user, 200, res);
    }

  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
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
   console.log(error)
   return next(createError.createError(500,"Internal server error"))
  }
};

//VERIFYREFRESH TOKEN
const verifyRefreshToken = refreshToken => {
  try {
    const decoded = jwt.verify(refreshToken, 'refreshSecret')
    return decoded
  } catch (err) {
    // return next(createError.createError(500,"Invalid refresh token"));
    throw new Error('Invalid refresh token')
  }
}

// REFRESHTOKEN
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return next(createError.createError(400, 'Refresh token is missing'))
    }

    const decoded = verifyRefreshToken(refreshToken)

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      'secret',
      {
        expiresIn: '90d'
      }
    )

    res.status(200).json({
      token: newAccessToken
    })
  } catch (error) {
   return  next(createError.createError(500, error.message))
  }
}



