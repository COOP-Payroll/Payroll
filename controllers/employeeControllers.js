const Employee = require("../models/employee.js");
const EmployeeInfo = require("../models/employeInfo.js");
const EmergencyContact = require("../models/emergency_Contact.js");
const Address = require("../models/address.js");
const Department = require("../models/department.js");
const Grade = require("../models/grade.js");
const Company = require("../models/company.js");
const AccountInfo = require("../models/accountInfo.js");
const IdFormat = require("../models/companyIdFormat.js");
const CustomRole = require("../models/customRole.js");
const Allowance = require("../models/allowance.js");
const AllowanceDefinition = require("../models/allowanceDefinition.js");
const multer = require("multer");
// Define controller methods for handling User requests
exports.getAllEmployee = async (req, res) => {
  try {
    const Employees = await Employee.findAll({
      where: { companyId: req.user.id },
      include: [
        Address,
        EmployeeInfo,
        EmergencyContact,
        AccountInfo,
        Department,
        Grade,
        // Company,
        CustomRole,
      ],
    });
    res.status(200).json({
      count: Employees.length,
      Employees,
    });
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      // console.log("first", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const Employee = await Employee.findByPk(id);
    res.json({ Employee });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const {
      address,
      employeeInfo,
      emergencyInfo,
      basicInfo,
      accountInformation,
    } = req.body;

    let password = req.user.companyCode.substring(0, 4) + "0000";
    const conflicts = [];
    const createdAccountInfos = [];

    if (!basicInfo?.DepartmentId) {
      return res.status(404).json("There is no department");
    } else if (!basicInfo?.GradeId) {
      return res.status(404).json("There is no Grade");
    }

    const idFormat = await IdFormat.findOne({
      where: { companyId: Number(req.user.id), isActive: true },
    });

    if (!idFormat) {
      return res.status(400).json({ error: "Define Id Format first" });
    }

    const gradeId = await Grade.findByPk(Number(basicInfo?.GradeId));
    const departmentId = await Department.findByPk(
      Number(basicInfo?.DepartmentId)
    );

    if (!gradeId) {
      return res.status(404).json("There is no Grade with this ID");
    } else if (!departmentId) {
      return res.status(404).json("There is no Department with this ID");
    } else if (
      employeeInfo.basicSalary < gradeId.minSalary ||
      employeeInfo.basicSalary > gradeId.maxSalary
    ) {
      return res
        .status(404)
        .json(
          `Basic salary must be between ${gradeId.minSalary} and ${gradeId.maxSalary}`
        );
    }

    const address1 = await Address.create(address);
    const employeeInfo1 = await EmployeeInfo.create(employeeInfo);

    const formatElements = idFormat.order.split(",");
    const lastEmployee = await Employee.findOne({
      order: [["createdAt", "DESC"]],
    });
    let paddedEmployeeCode =
      idFormat.digitLength < 5
        ? "1".padStart(idFormat.digitLength, "0")
        : "00001";

    if (lastEmployee) {
      const lastEmployeeId = lastEmployee.employee_id_number;
      let lastEmployeeCode = lastEmployeeId.split(idFormat.separator);
      lastEmployeeCode = lastEmployeeCode[lastEmployeeCode.length - 1];
      const incrementedEmployeeCode = parseInt(lastEmployeeCode, 10) + 1;
      paddedEmployeeCode = incrementedEmployeeCode
        .toString()
        .padStart(idFormat.digitLength, "0");
    }

    let employeeId = "";
    for (let i = 0; i < formatElements.length; i++) {
      const element = formatElements[i];
      switch (element) {
        case "companyCode":
          employeeId += idFormat.companyCode;
          break;
        case "year":
          employeeId += employeeInfo.hireDate.split("-")[0];
          break;
        case "department":
          employeeId += departmentId.shorthandRepresentation;
          break;
      }

      if (i !== formatElements.length - 1) {
        employeeId += idFormat.separator;
      }
    }

    employeeId += idFormat.separator + paddedEmployeeCode;

    const basicInfo1 = await Employee.create({
      ...basicInfo,
      password,
      employee_id_number: employeeId,
      companyId: Number(req.user.id),
      DepartmentId: Number(basicInfo.DepartmentId),
      GradeId: Number(basicInfo.GradeId),
      AddressId: Number(address1.id),
      EmployeeInfoId: Number(employeeInfo1.id),
    });

    for (const accountInfo of accountInformation) {
      const { accountNumber, isVerified } = accountInfo;
      const accountExists = await AccountInfo.findOne({
        where: { accountNumber },
      });

      if (accountExists) {
        conflicts.push(accountNumber);
      } else {
        const account = await AccountInfo.create({
          accountNumber,
          isVerified,
          EmployeeId: basicInfo1.id,
        });
        createdAccountInfos.push(account);
      }
    }

    const emergencies = await Promise.all(
      emergencyInfo.map((emer) =>
        EmergencyContact.create({ ...emer, EmployeeId: basicInfo1.id })
      )
    );
    const accountinfos = await Promise.all(
      accountInformation.map((emer) =>
        AccountInfo.create({ ...emer, EmployeeId: basicInfo1.id })
      )
    );

    let message = "";
    let statusCode = 200;

    if (conflicts.length > 0) {
      statusCode = 409;
      message = "Accounts conflict. Further operations prevented.";
    } else {
      message = "Accounts created successfully.";
    }

    res.status(200).json({
      basicInfo1,
      message,
      conflicts,
    });
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });
      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });
      return res.status(400).json(errors);
    } else {
      console.log("first", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { deptName, location, shorthandRepresentation } = req.body;
    const updates = req.body;
    const { id } = req.params;

    const result = await Employee.update(updates, { where: { id: id } });

    res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const Employe = await Employee.findByPk(Number(id));
    if (Employe) {
      await Employe.destroy({ where: { id } });
      res.status(200).json({ message: "Employee deleted successfully" });
    } else {
      res.status(409).json({ message: "There is no Employee with this ID" });
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      // console.log("er", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};
///

//Import from Excel
const xlsx = require("xlsx");
const Deduction = require("../models/deduction.js");
const storage4 = multer.memoryStorage();
// create instance of multer and specify storage engine
const upload4 = multer({ storage: storage4 }).single("file");

exports.createEmployeeFile = async (req, res, next) => {
  let generalDepartment = "";

  const newDepartment = await Department.find({
    companyName: req.user.CompanyName,
    deptName: "General",
  });

  generalDepartment = mongoose.Types.ObjectId(newDepartment[0]?._id);

  upload4(req, res, async (err) => {
    if (err) {
      next(err);
    } else {
      try {
        const workbook = xlsx.read(req?.file?.buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        const numRecords = data.length;
        const emails = [];
        const employeData = data.map((row) => ({
          fullname: row["fullname"],
          nationality: row["nationality"],
          phoneNumber: row["phoneNumber"],
          email: row["email"],
          accountNumber: row["Account Number"],
          date_of_birth: row["date_of_birth"],
          sex: row["sex"],
          department: row["department"] ? row["department"] : generalDepartment,
          id_number: row["id_number"],
          basicSalary: row["basicSalary"],
          companyId: req.user.id,
          password: req.user.CompanyName.substring(0, 4) + "0000",
          emails: emails.push(row["email"]),
        }));

        const newEmp = await Employee.insertMany(
          employeData,
          async function (err) {
            if (err) {
              console.log("error");
              res.status(404).json({
                message: "please check every employee has unique email address",
              });
            } else {
              // console.log(employeData);
              console.log("Data imported successfully!");
              const text =
                "Your password is   " +
                req.user.CompanyName +
                "0000" +
                "    please change your password ";

              for (i = 0; i < employeData.length; i++) {
                // await sendEmail({
                //     email: emails[i],
                //     subject: 'You are successfully registed on CoopPayroll SAAS ',
                //     text
                // });
              }
              res.status(200).json({
                status: "success",
                message: "Employee Registered successfully",
              });
            }
          }
        );
        //  const text = 'Your password is   ' + req.user.CompanyName + '0000' + '    please change your password ';
      } catch (error) {
        res.status(404).json({
          message: "1please check every employee has unique email address",
        });
      }
    }
  });
};

exports.findByDepartment = async (req, res, next) => {
  try {
    const departmentId = req.params.departmentId;

    // const emps = await Employee.findAll({
    //   where: { DepartmentId: departmentId },
    // });
    // // console.log("first", employees);

    // const datas = await Promise.all(
    //   emps.map((employee) => {
    //     return Grade.findOne({
    //       where: { id: employee.GradeId },
    //       include: [Allowance, Deduction],
    //     });
    //   })
    // );

    const department = await Employee.findAll({
      where: { DepartmentId: departmentId },
      include: {
        model: Grade,
        include:
          {
            model: Allowance,
           /// Use the correct alias defined in the association
            include: [AllowanceDefinition],
          },

      },
    });

    res.status(200).json({
      count: department.length,
      department,
    });
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(400).json(errors);
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(400).json(errors);
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};
