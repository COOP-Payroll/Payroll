// const Company = require("../models/company");
// const CompanyAccountInfo = require("../models/companyAccountInfo");

const CompanyAccountInfo = require("../models/companyAccountInfo");
const createError= require("../utils/error")

exports.createCompanyAccountInfo = async (req, res,next) => {
  try {
    const CompanyId = Number(req.user.id);

    const { file } = req;
    //  const { name, hireDate, username, password } = req.body;

    if (!file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const existingAccount = await CompanyAccountInfo.findOne({
      where: {
        CompanyId,
        accountNumber: req.body.accountNumber,
      },
    });

    if (existingAccount) {
      return res.status(409).json({ message: "Account Info already exists" });
    }

    const activeAccount = await CompanyAccountInfo.findOne({
      where: {
        CompanyId,
        isActive: true,
      },
    });

    if (activeAccount) {
      await activeAccount.update({ isActive: false });
    }

    // Access the uploaded image file
    const { path } = file;

    const newAccountInfo = await CompanyAccountInfo.create({
      ...req.body,
      CompanyId: CompanyId,
      image: path,
    });

    res.status(201).json({
      msg: "Account Info created successfully",
      accountInfo: newAccountInfo,
    });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }
};

exports.getAllCompanyAccountInfo = async (req, res,next) => {
  try {
    const CompanyId = Number(req.user.id);
    const companyAccountInfo = await CompanyAccountInfo.findOne({
      where: { CompanyId: CompanyId, isActive: true },
    });

    // const baseUrl = "https://payroll-production.up.railway.app/"; // Replace with your base URL
    const baseUrl = "https://localhost:6000/";
    if (companyAccountInfo.image) {
      const imageUrl = `${baseUrl}${companyAccountInfo.image.replace(
        /\\/g,
        "/"
      )}`;
      companyAccountInfo.dataValues.imageUrl = imageUrl;
    }

    return res.status(200).json(companyAccountInfo);
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }
};

exports.deleteCompanyAccountInfo = async (req, res,next) => {
  try {
    const CompanyId = Number(req.user.id);
    const { id } = req.params;
    const companyAccountInfos = await CompanyAccountInfo.findOne({
      where: { CompanyId: CompanyId, id },
    });
    if (!companyAccountInfos) {
      res.status(404).json({ error: "company Account Info does not exist" });
    } else {
      await companyAccountInfos.destroy();
      return res.json("company Account Info deleted successfully");
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }
};

exports.updateCompanyAccountInfo = async (req, res,next) => {
  try {
    const CompanyId = Number(req.user.id);
    const { isVerified, accountNumber } = req.body;
    const { id } = req.params;

    const accountInfo = await CompanyAccountInfo.findOne({
      where: { CompanyId: CompanyId, id },
    });

    if (!accountInfo) {
      return res
        .status(404)
        .json({ error: "company Account Info does not exist" });
    } else {
      const updatedAccountInfo = await accountInfo.update({
        isVerified,
        accountNumber,
      });
      res.status(201).json({
        msg: "Account Info updated successfully",
        accountInfo: updatedAccountInfo,
      });
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }
};

exports.verifyAccountNumber = (req, res,next) => {
  try {
    const { accountNumber } = req.body;
    res.status(200).json({ fullName: "boo faz baz", accountType: "Saving" });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'));
  }
};
