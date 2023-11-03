const Employee = require("../models/employee.js");
const EmployeeInfo = require("../models/employeInfo.js");
const EmergencyContact = require("../models/emergency_Contact.js");
const Address = require("../models/address.js");
const Department = require("../models/department.js");
const Grade = require("../models/grade.js");
const Company = require("../models/company.js");
const AccountInfo = require("../models/accountInfo.js");
const IdFormat = require("../models/companyIdFormat.js");
const Allowance = require("../models/allowance.js");
const AllowanceDefinition = require("../models/allowanceDefinition.js");
const DeductionDefinition = require("../models/deductionDefinition.js");
const AdditionalPayDefinition=require("../models/additionalPayDefinition.js");
const AdditionalPay=require("../models/additionalPay.js")
const Deduction = require("../models/deduction.js");
const CustomRole = require("../models/customRole.js");
const Permission = require("../models/permission.js");
const Loan = require("../models/loan.js");
const nodemailer = require("nodemailer");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail.js");
// Define controller methods for handling User requests

exports.getAllEmployee = async (req, res,next) => {
  try {
    const Employees = await Employee.findAll({
      where: { companyId: req.user.id },
      include: [
        {
          model: Address,
          required: false,
        },
        {
          model: Company,
          required: false,
        },

        {
          model: EmployeeInfo,
          required: false,
        },
        {
          model: Department,
          required: false,
          through: {
            model: EmployeeDepartment,
            where: {
              active: true,
            },
          },
        },
        {
          model: AccountInfo,
          required: false,
        },
        {
          model: CustomRole,
          required: false,
        },
        {
          model: Loan,
          required: false,
        },
        {
          model: Grade,

          through: {
            model: EmployeeGrade,
            where: {
              active: true,
            },
          },

          include: [
            {
              model: Allowance, // Use the correct alias defined in the association
              include: [AllowanceDefinition],
            },
            {
              model: Deduction, // Use the correct alias defined in the association
              include: [DeductionDefinition],
            },
            // { model: EmployeeGrade, where: { active: true } },
          ],
        },
        // {
        //   model: EmployeeGrade,
        //   where: { active: true },
        // },
        {
          model: EmergencyContact,
          required: false,
        },
        {
          model: CustomRole,
          include: [Permission],
        },
        {
          model: AdditionalAllowance,
          include: [AdditionalAllowanceDefinition],
        },
        {
          model: AdditionalDeduction,
          include: [AdditionalDeductionDefinition],
        },
        {
          model: AdditionalPay,
          include: [AdditionalPayDefinition],
        },
        //Address,
        // EmployeeInfo,
        // EmergencyContact,
        // AccountInfo,
        // Department,
        // Grade,

        // // Company,
        // CustomRole,
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

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      // console.log("first", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employees = await Employee.findOne({
      where: { id: id },
      include: [
        {
          model: Address,
          required: false,
        },
        {
          model: Company,
          required: false,
        },
        {
          model: EmployeeInfo,
          required: false,
        },
        {
          model: Department,
          required: false,
        },
        {
          model: CustomRole,
          required: false,
        },
        {
          model: Loan,
          required: false,
        },
        {
          model: Grade,
          include: [
            {
              model: Allowance, // Use the correct alias defined in the association
              include: [AllowanceDefinition],
            },
            {
              model: Deduction, // Use the correct alias defined in the association
              include: [DeductionDefinition],
            },
          ],
        },
        {
          model: EmergencyContact,
          required: false,
        },
        {
          model: CustomRole,
          include: [Permission],
        },
        {
          model: AdditionalAllowance,
          include: [AdditionalAllowanceDefinition],
        },
        {
          model: AdditionalDeduction,
          include: [AdditionalDeductionDefinition],
        },
        //Address,
        // EmployeeInfo,
        // EmergencyContact,
        // AccountInfo,
        // Department,
        // Grade,

        // // Company,
        // CustomRole,
      ],
    });

    res.json({ employees });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    console.log("first", req.body.employeeinfo);
    const {
      address,
      employeeInfo,
      emergencyInfo,
      basicInfo,
      accountInformation,
    } = req.body;
    console.log("basic INfo", basicInfo);
    const { file } = req;

    let password = req.user.companyCode.substring(0, 4) + "0000";
    const conflicts = [];
    const createdAccountInfos = [];

    const existingEmail = await Employee.findOne({
      where: {
        email: basicInfo.email,
      },
    });

    const accountData = [];

    for (const ai of accountInformation) {
      accountData.push(ai);
    }

    for (const account of accountData) {
      const existingAccount = await AccountInfo.findOne({
        where: { accountNumber: account.accountNumber },
      });
      if (!existingAccount) {
      } else {
        return res.status(400).json({
          error: `Account number already exists: ${account.accountNumber}`,
        });
      }
    }

    // if (existingAccount) {
    //   return res.status(409).json({ error: "Account Info already exists" });
    // }

    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists" });
    }

    //  if (existingAccount) {
    //    return res.status(409).json({ error: "Account Number already exists" });
    //  }

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
    console.log("basic info");

    console.log("basic info", basicInfo);
    employeeId += idFormat.separator + paddedEmployeeCode;
    let basicInfo1;
    if (file) {
      const { path } = file;
      //  company = await Company.create({ ...companyData, companyLogo: path });

      basicInfo1 = await Employee.create({
        ...basicInfo,
        password,
        images: path,
        employee_id_number: employeeId,
        CompanyId: Number(req.user.id),
        DepartmentId: Number(basicInfo.DepartmentId),
        GradeId: Number(basicInfo.GradeId),
        AddressId: Number(address1.id),
        EmployeeInfoId: Number(employeeInfo1.id),
      });
    } else {
      basicInfo1 = await Employee.create({
        ...basicInfo,
        password,
        employee_id_number: employeeId,
        CompanyId: Number(req.user.id),
        DepartmentId: Number(basicInfo.DepartmentId),
        GradeId: Number(basicInfo.GradeId),
        AddressId: Number(address1.id),
        EmployeeInfoId: Number(employeeInfo1.id),
      });
    }
    const URL = "https://payroll-production.up.railway.app/";
    const message1 = {
      from: "your-email@gmail.com",
      to: basicInfo1.email,
      subject: "Employee Registration Confirmation",
      html: `<p>Dear ${basicInfo1.firstName},</p>
  <p>Thank you for registering as an employee.</p>
  <p>Your registration is valid until {formattedExpirationDate}.</p>
  <p>Please click the following link to confirm your registration:</p>
  <p><a href="${URL}/confirm/{token}">${URL}/confirm/{token}</a></p>`,
    };
    console.log("email", message1);
    await sendEmail({ message1 });

    //

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
      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });
      return res.status(404).json({ message: errors });
    } else {
      console.log("first", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { deptName, location, shorthandRepresentation } = req.body;
    const updates = req.body;
    const { id } = req.params;

    const result = await Employee.update(updates, {
      where: { id: id },
      returning: true,
    });

    res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
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

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      // console.log("er", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

//GET EMPLOYEE BY DEPARTMENT ID
exports.findByDepartment = async (req, res, next) => {
  try {
    const departmentId = req.params.departmentId;
    if (departmentId != 0) {
      const Employees = await Employee.findAll({
        include: [
          {
            model: Department,
            through: {
              where: {
                active: true,
              },
            },
            where: {
              id: departmentId,
            },
          },
          {
            model: Grade,

            through: {
              model: EmployeeGrade,
              where: {
                active: true,
              },
            },

            include: [
              {
                model: Allowance, // Use the correct alias defined in the association
                include: [AllowanceDefinition],
              },
              {
                model: Deduction, // Use the correct alias defined in the association
                include: [DeductionDefinition],
              },
              // { model: EmployeeGrade, where: { active: true } },
            ],
          },
          {
            model: Loan,
            required: false,
          },
          {
            model: EmployeeInfo,
            required: false,
            attributes: ["basicSalary"],
          },
          {
            model: AdditionalAllowance,
            include: [AdditionalAllowanceDefinition],
            required: false,
          },
          {
            model: AdditionalDeduction,
            include: [AdditionalDeductionDefinition],
            required: false,
          },
        ],
      });

      // console.log("not zero", 0);
      // const Employees = await Employee.findAll({
      //   // where: { companyId: req.user.id, DepartmentId: departmentId },
      //   include: [
      //     {
      //       model: Department,
      //       through: {
      //         EmployeeDepartment,
      //         where: {
      //           DepartmentId: departmentId,
      //         },
      //       },
      //     },

      //     {
      //       model: Address,
      //       required: false,
      //     },
      //     {
      //       model: Company,
      //       required: false,
      //     },
      //     {
      //       model: EmployeeInfo,
      //       required: false,
      //     },
      //     {
      //       model: Department,
      //       required: false,
      //       through: {
      //         model: EmployeeDepartment,
      //         where: {
      //           active: true,
      //         },
      //       },
      //     },
      //     {
      //       model: CustomRole,
      //       required: false,
      //     },
      //     {
      //       model: Loan,
      //       required: false,
      //     },
      //     {
      //       model: Grade,

      //       through: {
      //         model: EmployeeGrade,
      //         where: {
      //           active: true,
      //         },
      //       },

      //       include: [
      //         {
      //           model: Allowance, // Use the correct alias defined in the association
      //           include: [AllowanceDefinition],
      //         },
      //         {
      //           model: Deduction, // Use the correct alias defined in the association
      //           include: [DeductionDefinition],
      //         },
      //         // { model: EmployeeGrade, where: { active: true } },
      //       ],
      //     },
      //   ],
      // });

      res.status(200).json({
        count: dept.length,
        dept,
      });
    } else if (departmentId == 0) {
      console.log("first", 0);
      const Employees = await Employee.findAll({
        include: [
          {
            model: Department,
            through: {
              where: {
                active: true,
              },
            },
          },
          {
            model: Grade,

            through: {
              model: EmployeeGrade,
              where: {
                active: true,
              },
            },

            include: [
              {
                model: Allowance, // Use the correct alias defined in the association
                include: [AllowanceDefinition],
              },
              {
                model: Deduction, // Use the correct alias defined in the association
                include: [DeductionDefinition],
              },
              // { model: EmployeeGrade, where: { active: true } },
            ],
          },
          {
            model: Loan,
            required: false,
          },
          {
            model: EmployeeInfo,
            required: false,
            attributes: ["basicSalary"],
          },
          {
            model: AdditionalAllowance,
            include: [AdditionalAllowanceDefinition],
            required: false,
          },
          {
            model: AdditionalDeduction,
            include: [AdditionalDeductionDefinition],
            required: false,
          },
        ],
      });
      res.status(200).json({
        count: Employees.length,
        Employees,
      });
    }
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

//Import from Excel
const xlsx = require("xlsx");
const AdditionalAllowance = require("../models/additionalAllowance.js");
const AdditionalAllowanceDefinition = require("../models/additionalAllowanceDefinition.js");
const AdditionalDeduction = require("../models/additionalDeduction.js");
const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition.js");
const EmployeeGrade = require("../models/EmployeeGrade.js");
const EmployeeDepartment = require("../models/EmployeeDepartment.js");

const storage4 = multer.memoryStorage();
// create instance of multer and specify storage engine
const upload4 = multer({ storage: storage4 }).single("file");

exports.createEmployeeFile = async (req, res, next) => {
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
        let password = req.user.companyCode.substring(0, 4) + "0000";
        console.log("numRecords", numRecords);
        const employeeRecords = data.map((row) => {
          const address = {
            country: row["country"],
            state: row["state"],
            zone_or_city: row["zone_or_city"],
            woreda: row["woreda"],
            kebele: row["kebele"],
            houseNumber: row["houseNumber"],
          };

          const emergencyInfo = {
            relation: row["emergency-relation"],
            phoneNumber: row["emergency-phoneNumber"],
            fullname: row["emergency-fullname"],
          };
          const employeeInfo = {
            employeeTIN: row["employeeTIN"],
            hireDate: row["hireDate"],
            employee_Code: row["employee_code"],
            basicSalary: row["basicSalry"],
            position: row["position"],
          };

          const basicInfo = {
            fullname: row["fullname"],
            images: row["images"],
            sex: row["sex"],
            date_of_birth: row["date_of_birth"],
            DepartmentId: row["DepartmentId"],
            GradeId: row["GradeId"],
            marriageStatus: row["marriageStatus"],
            isActive: row["isActive"],
            nationality: row["nationality"],
            password: row["password"],
            email: row["email"],
            phoneNumber: row["phoneNumber"],
            optionalPhoneNumber: row["optionalPhoneNumber"],
            id_type: row["id_type"],
            id_Number: row["id_Number"],
          };

          const accountInformation = {
            accountNumber: row["accountNumber"],
            isVerified: row["isVerified"],
          };

          return {
            address,
            emergencyInfo,
            basicInfo,
            employeeInfo,
            accountInformation,
          };
        });
        console.log("address", employeeRecords[0].address);
        for (const record of employeeRecords) {
          const {
            address,
            emergencyInfo,
            basicInfo,
            employeeInfo,
            accountInformation,
          } = record;
          console.log("address", employeeInfo);
          let password = req.user.companyCode.substring(0, 4) + "0000";
          const conflicts = [];
          const createdAccountInfos = [];

          console.log("first", basicInfo.GradeId);
          // if (!basicInfo?.DepartmentId) {
          //   return res.status(404).json("There is no department");
          // } else
          if (!basicInfo?.GradeId) {
            return res.status(404).json("There is no Grade");
          }

          const idFormat = await IdFormat.findOne({
            where: { companyId: Number(req.user.id), isActive: true },
          });

          if (!idFormat) {
            return res.status(400).json({ error: "Define Id Format first" });
          }

          const gradeId = await Grade.findByPk(
            Math.floor(Number(basicInfo?.GradeId))
          );
          const departmentId = await Department.findByPk(
            Math.floor(Number(basicInfo?.DepartmentId))
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

          console.log("Employee created:", createdEmployee);
        }
      } catch (error) {
        console.log("first", error);
        if (error.name === "SequelizeValidationError") {
          const errors = {};
          error.errors.forEach((err) => {
            errors[err.path] = [`${err.path} is required`];
          });

          return res.status(404).json({ message: errors });
        } else if (error.name === "SequelizeUniqueConstraintError") {
          const errors = {};
          error.errors.forEach((err) => {
            errors[err.path] = [`${err.path} must be unique`];
          });

          return res.status(404).json({ message: errors });
        } else {
          return res.status(500).json({ message: "Internal server error" });
        }
      }
    }
  });
};

// const signToken = (id) => {
//   try {
//     console.log("signToken",id)
//     return jwt.sign({ id }, "secret", {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };
const signToken = (id, role) => {
  try {
    return jwt.sign({ id, role }, "secret", {
      expiresIn: "90d",
    });
  } catch (err) {
    // res.json(err);
    return err;
  }
};

// const createSendToken = (user, statusCode, res) => {
//   console.log("user id", user.id);
//   const token = signToken(user.id, user.role);
//   console.log("first");

//   // const patientID = patient._id;
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//     ),

//     secure: process.env.NODE_ENV === "production" ? true : false,
//     httpOnly: true,
//   };

//   //remove password from the output
//   user.password = undefined;
//   res.cookie("jwt", token, cookieOptions);
//   res.status(statusCode).json({
//     message: "successful",
//     token,

//     data: {
//       user,
//     },
//   });
// };

const createSendToken = async (user, statusCode, res) => {
  try {
    const token = signToken(user.id, user.role);
    const cookieOptions = {
      expires: new Date(Date.now() + 1000 * 24 * 60 * 60 * 1000),

      secure: "production" ? true : false,
      httpOnly: true,
    };
    user.password = undefined;
    res.cookie("jwt", token, cookieOptions);
    res.status(statusCode).json({
      message: "successful",
      token,

      data: {
        user,
      },
    });
  } catch (error) {
    return res.json(error);
  }
};
///super admin login
exports.login = async (req, res, next) => {
  try {
    let company;
    const { email, password, companyCode } = req.body;

    //check if email and password exist company code
    if (!email || !password || !companyCode) {
      return res
        .status(404)
        .json({ message: "please provide email, password or company code" });
    }

    //check if user exists and password is correct
    company = await Employee.findOne({ where: { email } });
    // console.log("company", company);
    // console.log("company", company)
    //console.log("company", company === null);
    // if (company === null) {

    //   company = await Employee.findOne({
    //     where: { email },
    //     include: [
    //       {
    //         model: CustomRole,
    //         include: [Permission],
    //       },
    //     ],
    //   });
    // }

    console.log("company.passord", company.password);
    console.log("company", !company),
      //const c="$2b$10$.mOen.LsSbhGgG/FTI4iG.9CZkfTLMFhHCSH8x6wttZuMLfn3wEGC";
      console.log("first", await bcrypt.compare(password, company.password));

    // if (!company || !(await bcrypt.compare(password, company.password))) {
    //   return res.status(401).json({
    //     message:
    //       "Unauthorized access - Invalid email, password or company code",
    //   });
    // }

    const passwordMatch = await bcrypt.compare(password, company.password);

    if (passwordMatch) {
      res.status(200).json({ message: "Authentication successful" });
    } else {
      res.status(401).json({ error: "Authentication failed" });
    }
  } catch (error) {
    console.log("Error", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res
        .status(500)
        .json({ message: "Internal server error", user: user });
    }
  }
};
exports.addAddionalPay = async (req, res, next) => {
  try {
    const updates = req.body;
    const { id } = req.params.id;
    console.log("first", updates);

    const employee = await Employee.findAll({
      where: { id: req.params.id, companyId: req.user.id },
    });

    //  console.log("first", employee);
    if (employee) {
      const result = await employee.update({ acting: 100 });

      res.status(200).json({
        message: "updated successfully",
        // result,
      });
    } else {
      res.status(404).json({
        error: "there is no such Employee",
      });
    }
  } catch (error) {}
};

// Send confirmation email function
const sendConfirmationEmail = async (employee) => {
  console.log(employee);
  console.log(employee);

  // return new Promise(async (resolve, reject) => {
  //   try {
  //     // Create a nodemailer transporter
  //     const transporter = nodemailer.createTransport({
  //       // Configure your email provider's SMTP settings here
  //       // For example, for Gmail:
  //       service: 'Gmail',
  //       auth: {
  //         user: 'your-email@gmail.com',
  //         pass: 'your-password',
  //       },
  //     });

  //     // Calculate the expiration date (e.g., 7 days from the current date)
  //     const expirationDate = new Date();
  //     expirationDate.setDate(expirationDate.getDate() + 7);

  //     // Format the expiration date as a string
  //     const formattedExpirationDate = expirationDate.toDateString();

  //     // Generate unique acceptance and rejection codes
  //     const acceptanceCode = generateUniqueCode();
  //     const rejectionCode = generateUniqueCode();

  //     // Compose the email message
  //     const message = {
  //       from: 'your-email@gmail.com',
  //       to: employee.email,
  //       subject: 'Employee Registration Confirmation',
  //       html: `<p>Dear ${employee.firstName},</p>
  //       <p>Thank you for registering as an employee.</p>
  //       <p>Your registration is valid until ${formattedExpirationDate}.</p>
  //       <p>Please click one of the following links to accept or reject your registration:</p>
  //       <ul>
  //         <li><a href="${process.env.BASE_URL}/accept/${acceptanceCode}">Accept</a></li>
  //         <li><a href="${process.env.BASE_URL}/reject/${rejectionCode}">Reject</a></li>
  //       </ul>`,
  //     };

  //     // Save the acceptance and rejection codes to the Employee record
  //     await employee.update({ acceptanceCode, rejectionCode });

  //     // Send the email
  //     await transporter.sendMail(message);

  //     resolve(); // Resolve the promise when the email is sent successfully
  //   } catch (error) {
  //     reject(error); // Reject the promise if there's an error sending the email
  //   }
  // });
};

// Generate a unique code
function generateUniqueCode() {
  // Implement your own logic to generate a unique code
  // For example, you can use a UUID library
  return uuidv4();
}

// exports.sendEmail = async (req, res, next) => {
//   try {
//     let email = "gemechubulti11@gmail.com";
//     let text = "hello";
//     const message = {
//       from: "your-email@gmail.com",
//       to: email,
//       subject: "Employee Registration Confirmation",
//       html: `<p>Dear {employee.firstName},</p>
//   <p>Thank you for registering as an employee.</p>
//   <p>Your registration is valid until {formattedExpirationDate}.</p>
//   <p>Please click the following link to confirm your registration:</p>
//   <p><a href="{process.env.BASE_URL}/confirm/{token}">{process.env.BASE_URL}/confirm/{token}</a></p>`,
//     };

//     try {
//       await sendEmail({
//         message,
//       });
//       res.status(200).json({
//         status: "success",
//         message: "Message  sent to email",
//       });
//     } catch (error) {
//       console.log(error);
//     }

//     // res.status(200).json("updated");
//   } catch (error) {
//     console.log("error", error);
//     res.status(404).json("error");
//   }
// };

exports.createEmployee_new = async (req, res) => {
  const {
    address,
    employeeInfo,
    emergencyInfo,
    basicInfo,
    accountInformation,
  } = req.body;

  if (!accountInformation) {
    return res.status(400).json({ message: "Please provide account number" });
  }

  const accountNumbers = accountInformation?.map((acct) => acct.accountNumber);

  console.log("employee", req.files);

  try {
    const [grade, department, employee, accountInfos, idformat] =
      await Promise.all([
        Grade.findByPk(Number(basicInfo?.GradeId)),
        Department.findByPk(Number(basicInfo?.DepartmentId)),
        Employee.findOne({ where: { email: basicInfo?.email } }),
        AccountInfo.findAll({ where: { accountNumber: accountNumbers } }),
        IdFormat.findOne({
          where: { CompanyId: Number(req.user.id), isActive: true },
        }),
      ]);
    const errors = [];

    if (!grade) {
      errors.push({ error: "Grade does not exist." });
    }

    if (!department) {
      errors.push({ error: "Department does not exist." });
    }
    if (
      employeeInfo.basicSalary < grade?.minSalary ||
      employeeInfo.basicSalary > grade?.maxSalary
    ) {
      errors.push({
        error: `Basic salary must be between ${grade.minSalary} and ${grade.maxSalary}`,
      });
    }

    if (employee) {
      errors.push({
        error: `Employee already exists with ${basicInfo?.email} email.`,
      });
    }

    if (accountInfos.length > 0) {
      errors.push({ error: "Account infos already exist." });
    }

    if (!idformat) {
      errors.push({ error: "ID format does not exist." });
    }
    if (errors.length > 0) {
      return res.status(404).json({ message: errors });
    }

    let password = req?.user?.companyCode?.substring(0, 4) + "0000";
    await sequelize.transaction(async (t) => {
      const imagePath = req?.files?.["basicInfo[image]"]?.[0]?.path || null;
      const idImagePath =
        req?.files?.["basicInfo[id_image]"]?.[0]?.path || null;

      const formatElements = idformat.order.split(",");
      const lastEmployee = await Employee.findOne({
        order: [["createdAt", "DESC"]],
      });
      let paddedEmployeeCode = "00001";

      if (lastEmployee) {
        const lastEmployeeId = lastEmployee.employee_id_number;
        const lastEmployeeCode = lastEmployeeId.split(idformat.separator).pop();
        const incrementedEmployeeCode = parseInt(lastEmployeeCode, 10) + 1;
        paddedEmployeeCode = incrementedEmployeeCode
          .toString()
          .padStart(idformat.digitLength, "0");
      }

      let employeeId = "";
      for (let i = 0; i < formatElements.length; i++) {
        const element = formatElements[i];
        switch (element) {
          case "companyCode":
            employeeId += idformat.companyCode;
            break;
          case "year":
            employeeId += employeeInfo.hireDate.split("-")[0];
            break;
          case "department":
            employeeId += department.shorthandRepresentation;
            break;
        }

        if (i !== formatElements.length - 1) {
          employeeId += idformat.separator;
        }
      }

      employeeId += idformat.separator + paddedEmployeeCode;
      const createEmployee = await Employee.create(
        {
          ...basicInfo,
          password,
          image: imagePath,
          id_image: idImagePath,
          CompanyId: Number(req.user.id),
          employee_id_number: employeeId,
        },
        { transaction: t }
      );

      const junctionCreate = await EmployeeDepartment.create(
        {
          EmployeeId: Number(createEmployee.id),
          DepartmentId: Number(department.id),
          active: true,
        },
        { transaction: t }
      );

      const junctionGrade = await EmployeeGrade.create(
        {
          EmployeeId: Number(createEmployee.id),
          GradeId: Number(grade.id),
          active: true,
        },
        { transaction: t }
      );

      const createAddress = await Address.create(
        { ...address, EmployeeId: createEmployee.id, isActive: true },
        { transaction: t }
      );

      const createEmployeeInfo = await EmployeeInfo.create(
        { ...employeeInfo, isActive: true, EmployeeId: createEmployee.id },
        { transaction: t }
      );

      const createdEmergencyInfos = await EmergencyContact.bulkCreate(
        emergencyInfo.map((info) => ({
          ...info,
          isActive: true,
        })),
        { transaction: t }
      );

      const accountImages = accountInformation.map((info, index) => {
        const key = `accountInformation[${index}][image]`;
        return req?.files?.[key]?.[0]?.path || null;
      });

      const createdAccountInformations = await AccountInfo.bulkCreate(
        accountInformation.map((info, index) => ({
          ...info,
          EmployeeId: createEmployee.id,
          isActive: info.isActive || false,
          image: accountImages[index],
        })),
        { transaction: t }
      );

      const generateConfirmationToken = () => {
        return crypto.randomBytes(20).toString("hex");
      };
      const token = generateConfirmationToken();
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7);

      // Format the expiration date as a string
      const formattedExpirationDate = expirationDate.toDateString();

      // Generate unique acceptance and rejection codes
      const acceptanceCode = token;
      const rejectionCode = expirationDate;
      console.log("generateUniqueCode", acceptanceCode);
      console.log("rejection code", rejectionCode);

      const URL = "https://payroll-ms.onrender.com";
      createEmployee.acceptanceCode = acceptanceCode;
      createEmployee.rejectionCode = rejectionCode;
      // createEmployee.save();
      const message1 = {
        from: "your-email@gmail.com",
        to: createEmployee.email,
        subject: "Employee Registration Confirmation",
        html: `
             
      <p>Dear ${createEmployee.fullname},</p>
      <p>Thank you for registering as an employee.</p>
      <p>Your registration is valid until ${formattedExpirationDate}.</p>
      <p>Please click one of the following links to accept or reject your registration:</p>
      <a href="${URL}/confirm/${
          createEmployee.id
        }?token=${token}&expiry=${expirationDate.toISOString()}">Confirm Registration</a>
      <p>This link will expire on ${expirationDate.toLocaleDateString()}.</p>
      <p>Click this link to reject the registration</p>
       <p>If you wish to reject the confirmation, click the following button:</p>
     
    `,
      };

      //  await sendEmail({ message1 });

      return res.status(201).json({
        basicInfo: createEmployee,
        address: createAddress,
        employeeInfo: createEmployeeInfo,
        emergencyInfo: createdEmergencyInfos,
        accountInformation: createdAccountInformations,
      });
    });
  } catch (error) {
    console.error("Error creating records:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the records." });
  }
};
