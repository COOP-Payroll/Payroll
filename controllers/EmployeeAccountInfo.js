const AccountInfo = require("../models/accountInfo");

exports.createEmployeeAccountInfo = async (req, res) => {
  try {
    const { employeeId, isVerified, accountNumber } = req.body;
    const { file } = req;
    //  const { name, hireDate, username, password } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const existingAccount = await AccountInfo.findOne({
      where: {
        accountNumber: req.body.accountNumber,
      },
    });

    if (existingAccount) {
      return res.status(409).json({ error: "Account Info already exists" });
    }

    const activeAccount = await AccountInfo.findOne({
      where: {
        EmployeeId: employeeId,
        isActive: true,
      },
    });

    if (activeAccount) {
      await activeAccount.update({ isActive: false });
    }

    // Access the uploaded image file
    const { path } = file;

    const newAccountInfo = await AccountInfo.create({
      accountNumber,
      isVerified,
      EmployeeId: employeeId,
      image: path,
    });

    res.status(201).json({
      msg: "Account Info created successfully",
      accountInfo: newAccountInfo,
    });
  } catch (error) {
    console.error("Error creating company account info:", error);

    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = error.errors.reduce((acc, err) => {
        acc[err.path] = [`${err.path} is required`];
        return acc;
      }, {});
      return res.status(400).json(errors);
    } else {
      // Handle other errors
      res.status(500).json({ error: "Failed to create account info" });
    }
  }
};

exports.getAllEmployeeAccountInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeeAccountInfos = await AccountInfo.findAll({
      where: { EmployeeId: id, isActive: true },
    });
    let employeeAccountInfo = employeeeAccountInfos[0];
    const baseUrl = "https://payroll-production.up.railway.app/"; // Replace with your base URL
    const imageUrl = `${baseUrl}${employeeAccountInfo.image.replace(
      /\\/g,
      "/"
    )}`;
    employeeAccountInfo.dataValues.imageUrl = imageUrl;
    return res.status(200).json(employeeAccountInfo);
  } catch (error) {
    return res.json(error);
  }
};

exports.deleteEmployeeAccountInfo = async (req, res) => {
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
    return res.json(error);
  }
};

exports.updateEmployeeAccountInfo = async (req, res) => {
  try {
    const { isVerified, accountNumber } = req.body;
    const { id } = req.params;

    const accountInfo = await AccountInfo.findOne({
      where: { id },
    });

    if (!accountInfo) {
      return res
        .status(404)
        .json({ error: "employee Account Info does not exist" });
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
    res.json(error);
  }
};

exports.verifyAccountNumber = (req, res) => {
  try {
    const { accountNumber } = req.body;
    res.status(200).json({ fullName: "boo faz baz", accountType: "Saving" });
  } catch (error) {
    res.json(error);
  }
};
