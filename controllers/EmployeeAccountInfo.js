const AccountInfo = require("../models/accountInfo");
const Employee = require("../models/employee");
const createError= require("../utils/error")

exports.createEmployeeAccountInfo = async (req, res,next) => {
  try {
    const { employeeId, accountNumber } = req.body;
    const [employee, account] = await Promise.all([
      Employee.findByPk(Number(employeeId)),
      AccountInfo.findOne({ where: { accountNumber } }),
    ]);
    if (!employee) {
      return res.status(404).json({ error: "employee not found" });
    }
    if (account) {
      return res.status(409).json({ error: "account exist" });
    }

    const imagePath = req?.files?.image[0].path || null;
    const newAccount = await AccountInfo.create({
      accountNumber,
      image: imagePath,
      EmployeeId: Number(employeeId),
    });
    return res.status(201).json({
      msg: "Account Info created successfully",
      accountInfo: newAccount,
    });
  } catch (error) {
    console.error("Error creating company account info:", error);
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
  }
};

exports.getAllEmployeeAccountInfo = async (req, res,next) => {
  try {
    const { id } = req.params;
    const employeeeAccountInfos = await AccountInfo.findAll({
      where: { EmployeeId: id, isActive: true },
    });
    let employeeAccountInfo = employeeeAccountInfos[0];
    const baseUrl = "https://payroll-production.up.railway.app/";
    const imageUrl = `${baseUrl}${employeeAccountInfo.image.replace(
      /\\/g,
      "/"
    )}`;
    employeeAccountInfo.dataValues.imageUrl = imageUrl;
    return res.status(200).json(employeeAccountInfo);
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
  }
};

exports.deleteEmployeeAccountInfo = async (req, res,next) => {
  try {
    const { id } = req.params;
    const companyAccountInfos = await AccountInfo.findOne({
      where: { id },
    });
    if (!companyAccountInfos) {
      res.status(404).json({ error: "employee Account Info does not exist" });
    } else {
      await companyAccountInfos.destroy();
      return res.json("employee Account Info deleted successfully");
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
  }
};

exports.updateEmployeeAccountInfo = async (req, res,next) => {
  try {
    const account = await AccountInfo.findByPk(Number(req.params.id));
    if (!account) return res.status(404).json({ error: "Account not found" });
    const { accountNumber } = req.body;
    const imagePath = req?.files?.path || account.image;
    await account.update({ isActive: false });
    const updatedAccount = await AccountInfo.create({
      accountNumber: accountNumber || account.accountNumber,
      image: imagePath || account.image,
      isActive: false,
      isVerified: false,
      EmployeeId: account.EmployeeId,
    });
    return res
      .status(200)
      .json({ message: "account updated successfully", data: updatedAccount });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
  }
};

exports.verifyAccountNumber = (req, res,next) => {
  try {
    const { accountNumber } = req.body;
    res.status(200).json({ fullName: "boo faz baz", accountType: "Saving" });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
  }
};
