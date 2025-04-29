const sequelize = require("../database/db");
const AccountInfo = require("../models/accountInfo");
const IdFormat = require("../models/companyIdFormat");
const Department = require("../models/department");
const Employee = require("../models/employee");

const Grade = require("../models/grade");
const Address = require("../models/address");
const EmployeeInfo = require("../models/employeInfo");
const EmergencyContact = require("../models/emergency_Contact");
const EmployeeDepartment = require("../models/EmployeeDepartment");
const EmployeeGrade = require("../models/EmployeeGrade");
const sendEmail = require("../utils/sendEmail.js");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const Projects = require("../models/projects.js");
const ProjectEmployee = require("../models/project-employee.js");
const Position = require("../models/position.js");
const EmployeePosition = require("../models/employeePosition.js");
const createError = require("../utils/error.js");
const { Sequelize, where } = require("sequelize");
const EmployeePromotion = require("../models/employeePromotion.js");
const { model } = require("mongoose");
const xlsx = require("xlsx");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const CustomRole = require("../models/customRole.js");
const Permission = require("../models/permission.js");
const Company = require("../models/company.js");
const { clearScreenDown } = require("readline");
const EmployeeHistory = require("../models/employeeHistory.js");

const pdf = require("html-pdf");

exports.createEmployee = async (req, res, next) => {
  const {
    address,
    employeeInfo,
    emergencyInfo,
    basicInfo,
    accountInformation,
  } = req.body;

  try {
    var regionId, zoneId, woredaId;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const company = await Company.findOne({ where: { id: CompanyId } });
    const companyRegionId = company?.regionId;
    const companyZoneId = company?.zoneId;
    const companyWoredaId = company?.woredaId;

    // Always set from company if not set in the request body
    if (companyRegionId) {
      basicInfo.regionId = companyRegionId; // Overwrite with company region
    }

    if (companyZoneId) {
      basicInfo.zoneId = companyZoneId; // Overwrite with company zone
    }

    if (companyWoredaId) {
      basicInfo.woredaId = companyWoredaId; // Overwrite with company woreda
    }

    if (!basicInfo?.DepartmentId || !basicInfo?.GradeId) {
      return next(
        createError.createError(400, "Please provide all required information")
      );
    }
    if (
      !accountInformation ||
      (accountInformation?.[0]?.accountNumber === "" &&
        accountInformation?.[0]?.phoneNumber === "")
    ) {
      return next(
        createError.createError(
          400,
          "Account number or phone number is required"
        )
      );
    }
    if (
      accountInformation[0]?.paymentMethod === "phone" &&
      (!accountInformation[0]?.phoneNumber ||
        accountInformation[0]?.phoneNumber === "")
    ) {
      return next(
        createError.createError(
          400,
          "Phone number is required when payment method is 'phone'."
        )
      );
    }

    // Check if account number is missing and payment method is not selected
    if (
      !accountInformation[0]?.accountNumber ||
      accountInformation[0]?.accountNumber === ""
    ) {
      if (!accountInformation[0]?.paymentMethod) {
        return next(
          createError.createError(
            400,
            "Either account number or payment method must be provided."
          )
        );
      }
      // If payment method is selected but no account number, you can handle it differently if needed
      if (
        accountInformation[0]?.paymentMethod &&
        accountInformation[0]?.paymentMethod !== "phone"
      ) {
        return next(
          createError.createError(
            400,
            "Account number is required unless payment method is 'phone'."
          )
        );
      }
    }

    // If accountNumber is not provided, use phoneNumber
    accountInformation.forEach((acct) => {
      if (!acct.accountNumber && acct.phoneNumber) {
        acct.accountNumber = acct.phoneNumber; // Default account number to phoneNumber
      }
    });

    const accountNumbers = accountInformation?.map(
      (acct) => acct.accountNumber
    );
    const [position, grade, department, employee, accountInfos, idformat] =
      await Promise.all([
        Position.findOne({
          where: { id: Number(employeeInfo.position), CompanyId: CompanyId },
        }),
        Grade.findOne({ where: { id: Number(basicInfo?.GradeId), CompanyId } }),
        Department.findOne({
          where: { id: Number(basicInfo?.DepartmentId), CompanyId },
        }),
        Employee.findOne({
          where: { email: basicInfo?.email, CompanyId },
        }),
        AccountInfo.findAll({
          where: { accountNumber: accountNumbers, CompanyId },
        }),
        IdFormat.findOne({
          where: { CompanyId, isActive: true },
        }),
      ]);

    if (!position) {
      return next(createError.createError(404, "Position not found"));
    }
    if (!grade) {
      return next(createError.createError(404, "Grade not found"));
    }

    if (!department) {
      return next(createError.createError(404, "Department not found"));
    }
    if (
      employeeInfo.basicSalary < grade?.minSalary ||
      employeeInfo.basicSalary > grade?.maxSalary
    ) {
      return next(
        createError.createError(
          404,
          `Basic salary must be between ${grade.minSalary} and ${grade.maxSalary}`
        )
      );
    }

    if (employee) {
      return next(
        createError.createError(
          404,
          `Employee already exists with ${basicInfo?.email} email.`
        )
      );
    }

    if (accountInfos.length > 0) {
      return next(createError.createError(404, "Account infos already exist."));
    }

    let password = req?.user?.companyCode?.substring(0, 4) + "0000";

    await sequelize.transaction(async (t) => {
      const imagePath = req?.files?.["basicInfo[image]"]?.[0]?.path || null;
      const idImagePath =
        req?.files?.["basicInfo[id_image]"]?.[0]?.path || null;

      const formatElements = idformat?.order?.split(",");
      const lastEmployee = await Employee.findOne({
        where: { CompanyId: CompanyId },
        order: [["createdAt", "DESC"]],
      });
      let paddedEmployeeCode = "00001";

      if (lastEmployee) {
        const lastEmployeeId = lastEmployee.employee_id_number;
        const lastEmployeeCode = lastEmployeeId
          .split(idformat?.separator)
          ?.pop();
        const incrementedEmployeeCode = parseInt(lastEmployeeCode, 10) + 1;
        paddedEmployeeCode = incrementedEmployeeCode
          .toString()
          .padStart(idformat?.digitLength, "0");
      }

      let employeeId = "";
      for (let i = 0; i < formatElements.length; i++) {
        const element = formatElements[i];
        switch (element) {
          case "companyCode":
            employeeId += idformat?.companyCode;
            break;
          case "year":
            employeeId += employeeInfo.hireDate.split("-")[0];
            break;
          case "department":
            employeeId += department.shorthandRepresentation;
            break;
        }

        if (i !== formatElements.length - 1) {
          employeeId += idformat?.separator;
        }
      }

      employeeId += idformat?.separator + paddedEmployeeCode;
      const createEmployee = await Employee.create(
        {
          ...basicInfo,
          password,
          isActive: true,
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

      const junctionPosition = await EmployeePosition.create(
        {
          EmployeeId: Number(createEmployee.id),
          PositionId: Number(position.id),
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
          EmployeeId: createEmployee.id,
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
          isActive: info.isActive || true,
          isVerified: false,
          image: accountImages[index],
        })),
        { transaction: t }
      );

      return res.status(201).json({
        success: true,
        message: "Registered successfully",
      });
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(
        503,
        "An error occurred while creating the records."
      )
    );
  }
};

exports.updateEmployee = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      basicSalary,
      position,
      grossEarning,
      DepartmentId,
      GradeId,
      employement_Type,
    } = req.body;
    const status = false;

    const employee = await Employee.findByPk(
      Number(req.params.id),
      {
        include: [
          {
            model: Grade,
            through: {
              model: EmployeeGrade,
              where: {
                active: true,
              },
              attributes: [],
            },
          },
          {
            model: Department,
            through: {
              model: EmployeeDepartment,
              where: {
                active: true,
              },
              attributes: [],
            },
          },
          {
            model: Position,
            through: {
              model: EmployeePosition,
              where: {
                isActive: true,
              },
              // attributes: []
            },
          },
        ],
      },
      {
        transaction,
      }
    );

    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({ error: "Employee not found" });
    }

    const errors = [];
    let department, grade, positionID;

    if (DepartmentId) {
      department = await Department.findByPk(Number(DepartmentId));
      console.log("new department", department);
      if (!department) {
        errors.push("Department does not exist.");
      }
    }

    const imagePath = req.files?.["image"]
      ? req.files?.["image"]?.[0]?.path
      : employee.image;
    const idImagePath = req.files?.["id_image"]
      ? req.files?.["id_image"]?.[0]?.path
      : employee.id_image;

    if (department) {
      const jointData = await EmployeeDepartment.findOne({
        where: { EmployeeId: employee.id, active: true },
      });

      if (jointData) {
        await jointData.update({ active: false }, { transaction });
      }

      const createdJointData = await EmployeeDepartment.create(
        {
          active: true,
          EmployeeId: employee.id,
          DepartmentId: department.id,
        },
        {
          transaction,
        }
      );
    }

    if (grade) {
      const jointData = await EmployeeGrade.findOne({
        where: { EmployeeId: employee.id, active: true },
      });
      if (jointData) {
        await jointData.update({ active: false }, { transaction });
      }
      const createdJointData = await EmployeeGrade.create(
        {
          active: true,
          EmployeeId: employee.id,
          GradeId: grade.id,
        },
        {
          transaction,
        }
      );
    }

    // const updateEmployee = await employee.update(
    //   { image: imagePath, id_image: idImagePath },
    //   { transaction }
    // );

    await transaction.commit();
    //////////////////////
    return res.status(200).json({
      message: "Employee fields updated successfully.",
      // oldEmployee: updateEmployee,
    });
  } catch (error) {
    return res.status(503).json({ message: "Internal server error" });
  }
};

exports.getAllEmployee = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      where: { CompanyId: Number(req.user.id) },
      exclude: ["password"],

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
          model: Position,
          required: false,
          through: {
            model: EmployeePosition,
            where: {
              active: true,
            },
          },
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
          where: {
            isActive: true,
          },
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
    return res.status(200).json({ count: employees.length, employees });
  } catch (error) {
    // con=
    return res
      .status(503)
      .json({ error: "there is a problem fetching employees" });
  }
};

function generateUniqueCode() {
  // Implement your own logic to generate a unique code
  // For example, you can use a UUID library
  return uuidv4();
}

exports.confirmaRegistration = async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId;
    const token = req.query.token;
    const expirationDate = new Date(req.query.expiry);
    const employee = await Employee.findByPk(employeeId);

    if (!employee) {
      return res.status(404).send("Employee not found");
    }

    res.status(200).json("employee", employee);
  } catch (error) {}
};

exports.promotion = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { basicSalary, position, gradeId, employement_Type } = req.body;

    const data = req.files?.letter?.[0]?.path;
    const imagePath = data ? data : null;

    const employee = await Employee.findOne({
      where: { id: Number(req.params.id), CompanyId: req.user.id },

      include: [
        {
          model: Grade,
          through: {
            model: EmployeeGrade,
            where: {
              active: true,
            },
            // attributes: []
          },
        },
        {
          model: Position,
          through: {
            model: EmployeePosition,
            where: { isActive: true },
          },
        },
        {
          model: EmployeeInfo,
          where: { isActive: true },
        },
      ],
    });

    if (!employee) {
      await transaction.rollback();

      return next(createError.createError(404, "Employee not found"));
      // return res.status(404).json({ error: "Employee not found" });
    }

    if (gradeId) {
      if (employee?.Grades?.[0]?.id === Number(gradeId)) {
        return res.json("equial");
      } else {
        // return res.json(employee?.EmployeeInfos?.[0]?.basicSalary)
        const employeeBasicsalary =
          Number(employee?.EmployeeInfos?.[0]?.basicSalary) ===
          Number(basicSalary)
            ? Number(employee?.EmployeeInfos?.[0]?.basicSalary)
            : Number(basicSalary);

        const grade = await Grade.findOne({
          where: { id: Number(gradeId), CompanyId: req.user.id },
        });

        if (!grade) {
          return next(createError.createError(404, "Grade not found"));
        }

        if (
          employeeBasicsalary < grade.minSalary ||
          employeeBasicsalary > grade.maxSalary
        ) {
          return res.status(400).json({
            message: `Basic salary must be between ${grade.minSalary} and ${grade.maxSalary}`,
          });
        }

        const employeeInfo = await EmployeeInfo.findOne({
          where: { EmployeeId: req.params.id, isActive: true },
        });

        if (employeeInfo) {
          const updatedData = await employeeInfo.update(
            { isActive: false },
            { transaction }
          );
        }
        const newEmployeeInfo = await EmployeeInfo.create(
          {
            isActive: true,
            EmployeeId: Number(req.params.id),
            basicSalary: employeeBasicsalary,
            employement_Type:
              employement_Type ?? employee.EmployeeInfos?.[0]?.employement_Type,
            // employeeTIN: employee.EmployeeInfos?.[0]?.employeeTIN,
            // hireDate: employee.EmployeeInfos?.[0]?.hireDate
          },
          { transaction }
        );

        ///
        const employeeGrade = await EmployeeGrade.findOne({
          where: { EmployeeId: req.params.id, active: true },
        });

        if (employeeGrade) {
          const updatedData = await employeeGrade.update(
            { active: false },
            { transaction }
          );
        }
        const newEmployeeGrade = await EmployeeGrade.create(
          {
            active: true,
            EmployeeId: Number(req.params.id),
            GradeId: gradeId,
          },
          { transaction }
        );
      }
    }

    //  if (position)
    //  {

    //   if (imagePath ==null){
    //     return next(createError.createError(404,"Please insert Letter of promotion "))
    //   }

    //   // await transaction.rollback();
    //   const foundPosition= await Position.findOne({where: {id:position, CompanyId:req.user.id}})

    //   if(!foundPosition){
    //     await transaction.rollback()
    //     return next(createError.createError(404, "position not found "))
    //   }
    //   const checkPosition= await EmployeePosition.findOne({where:{PositionId:position, EmployeeId:Number(req.params.id),isActive:true}})
    // //  console.log("checke",employee.Positions)
    //   if(!checkPosition) {
    //        const employeePosition = await EmployeePosition.findOne({
    //          where: { EmployeeId: Number(req.params.id),PositionId:employee.Positions?.[0]?.id
    //          , isActive: true },
    //        });

    //        if (employeePosition) {
    //          await employeePosition.update({ isActive: false }, { transaction });
    //        }

    //        console.log("newEmployeeInfo",employeePosition)
    //        const newEmployeeInfo = await EmployeePosition.create(
    //          {
    //            isActive: true,
    //            EmployeeId: Number(employee.id),
    //            PositionId: Number(position),
    //            letter:"imagePath"
    //                },

    //          { transaction }
    //        );
    //      }}

    await transaction.commit();
    return res.status(200).json({
      message: "Employee fields updated successfully.",
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

exports.updatedBasicInfo = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { fullname, marriageStatus, id_type, id_Number, id_image } = req.body;
    let imagePath = null;

    const employee = await Employee.findByPk(Number(id));
    if (!employee) {
      return res.status(404).json({
        error: "Employee does not exist.",
      });
    }
    console.log("data", req?.files?.id_image?.[0]?.path || null);

    const data = req?.files?.id_image?.[0]?.path;
    const idImagePath = data ? data : null;

    if (idImagePath != null) {
      const updateEmployee = await employee.update(
        {
          id_image: idImagePath,
          id_type: id_type ? id_type : employee.id_type,
          id_Number: id_Number ? id_Number : employee.id_Number,
          fullname: fullname ? fullname : employee.fullname,
          marriageStatus: marriageStatus
            ? marriageStatus
            : employee.marriageStatus,
        },
        { transaction }
      );
    } else {
      const updateEmployee = await employee.update(
        {
          id_type: id_type ? id_type : employee.id_type,
          id_Number: id_Number ? id_Number : employee.id_Number,
          fullname: fullname ? fullname : employee.fullname,
          marriageStatus: marriageStatus
            ? marriageStatus
            : employee.marriageStatus,
        },
        { transaction }
      );
    }
    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: "Employee basic information updated successfully",
    });
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.updateTermination = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { terminantionDate, terminationReason, terminationNotes } = req.body;

    console.log(id, terminantionDate, terminationReason, terminationNotes);
    if (!terminantionDate || !terminationReason) {
      return next(
        createError.createError(
          503,
          "Please enter a valid termination date and  termination reason"
        )
      );
    }

    const employeeInfo = await EmployeeInfo.findOne({
      where: { EmployeeId: id },
    });

    if (!employeeInfo) {
      return next(createError.createError(404, "Employee not found"));
    }

    if (employeeInfo) {
      const updatedData = await employeeInfo.update(
        { isActive: false },
        { transaction }
      );
    }

    const newEmployeeInfo = await EmployeeInfo.create(
      {
        isActive: true,
        EmployeeId: Number(id),
        basicSalary: employeeInfo.basicSalary,
        grossEarning: employeeInfo.grossEarning,
        position: employeeInfo.position,
        employement_Type: employeeInfo.employement_Type,
        employeeTIN: employeeInfo.employeeTIN,
        terminantionDate: terminantionDate
          ? terminantionDate
          : employeeInfo.terminantionDate,
        terminationReason: terminationReason
          ? terminationReason
          : employeeInfo.terminationReason,
        terminationNotes: terminationNotes
          ? terminationNotes
          : employeeInfo.terminationNotes,
        hireDate: employeeInfo.hireDate,
      },
      { transaction }
    );
    await transaction.commit();
    // newEmployeeInfo.save();

    return res.status(200).json({
      success: true,
      message: "Employee basic information updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.updateEmergencyContact = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const employeeId = req.params.employeeId;
    const updatedEmergencyInfo = req.body.EmergencyInfo;
    const updatedRecords = [];

    for (const item of updatedEmergencyInfo) {
      const { id, ...updatedData } = item;

      // Check if a record with the given id exists
      const existingRecord = await EmergencyContact.findOne(
        { where: { id: id, EmployeeId: employeeId } },
        { transaction }
      );

      if (existingRecord) {
        // If the record exists, update it with the provided data
        await existingRecord.update(updatedData, { transaction });
        updatedRecords.push(existingRecord);
      } else {
        await transaction.rollback();
        return next(createError.createError(404, `Employee record not found`));
      }
    }
    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: "updated successfully",
      updatedRecords,
    });
    // The updatedRecords array now contains the updated records
    // console.log(updatedRecords);
  } catch (error) {
    await transaction.rollback();
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.updateAccountInfo = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const employeeId = req.params.employeeId;
    const { accountId, accountNumber, accountImage, isVerified } = req.body;
    if (!accountNumber) {
      return next(createError.createError(400, "please insert account number"));
    }

    const accountInfo = await AccountInfo.findOne({
      where: { id: accountId, EmployeeId: employeeId, isActive: true },
    });

    if (!accountInfo) {
      return next(createError.createError(404, "Account not found"));
    }
    const data = req?.files?.accountImage?.[0]?.path;
    const imagePath = data ? data : null;
    if (imagePath != null) {
      await accountInfo.update({ isActive: false }, { transaction });
      await AccountInfo.create(
        {
          isActive: true,
          accountNumber: accountNumber,
          image: imagePath,
          isVerified: isVerified ? isVerified : false,
          EmployeeId: employeeId,
        },
        { transaction }
      );
    } else {
      await accountInfo.update({ isActive: false }, { transaction });
      await AccountInfo.create(
        {
          isActive: true,
          accountNumber: accountNumber,
          isVerified: isVerified ? isVerified : false,
          EmployeeId: employeeId,
        },
        { transaction }
      );
    }
    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: "Account information updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.getEmployeeHistory = async (req, res, next) => {
  try {
    const EmployeeId = Number(req?.params?.id);

    // Fetch all historical records for the employee from EmployeeHistory model
    const allHistoricalRecords = await EmployeeHistory.findAll({
      where: {
        EmployeeId,
        // isActive: false, // Assuming 'isActive' field indicates past records
      },
      attributes: {
        exclude: [
          "password",
          "isActive",
          "rejectionCode",
          "acceptanceCode",
          "EmployeeId",
          "CompanyId",
          "isDeactivated",
          "totalPercent",
          "isConfirmed",
          "changeTimestamp",
        ],
      },
      // attributes: ["PositionId", "startDate", "endDate", "remarks"], // Fetch relevant details
      order: [["createdAt", "DESC"]], // Order by creation date in descending order
      raw: true,
    });

    if (!allHistoricalRecords.length) {
      return res.status(404).json({
        success: false,
        message: "No history found for this employee",
      });
    }

    return res.status(200).json({ success: true, data: allHistoricalRecords });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// LOGIN HANDLER
exports.employeeLogin = async (req, res, next) => {
  try {
    const { email, password, companyCode } = req.body;

    // const CompanyId =
    //   req.user.role == "companyAdmin" ? req.user.id : req.user.CompanyId;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide both email and password." });
    }

    // Fetch employee
    const employee = await Employee.findOne({
      where: { email },
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
      return next(
        createError.createError(
          401,
          "Invalid credentials. Employee does not exist."
        )
      );
    }

    const employeeCompanyCode = await Company.findOne({
      where: { id: employee.CompanyId },
    });

    // Check if password matches
    const isPasswordCorrect = await bcrypt.compare(password, employee.password);
    if (!isPasswordCorrect || employeeCompanyCode.companyCode != companyCode) {
      return res.status(401).json({
        message: "Unauthorized access - Invalid email or password.",
      });
    }

    if (!employee.isActive) {
      return res.status(401).json({
        message: "Your account is deactivated. Please contact admin.",
      });
    }

    createSendToken(employee, 200, res);
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// SIGN TOKEN FUNCTION
const signToken = (id, role, fullName, phoneNumber, permissions) => {
  try {
    const token = jwt.sign(
      { id, role, fullName, phoneNumber, permissions },
      "secret",
      {
        expiresIn: "7d",
      }
    );

    const refreshToken = jwt.sign(
      { id, role, fullName, phoneNumber, permissions },
      "refreshSecret",
      {
        expiresIn: "90d",
      }
    );

    return { token, refreshToken };
  } catch (error) {
    throw new Error("Failed to sign token");
  }
};

// CREATE SEND TOKEN FUNCTION
const createSendToken = (employee, statusCode, res) => {
  try {
    const permissionsList =
      employee.CustomRole && Array.isArray(employee.CustomRole.Permissions)
        ? employee.CustomRole.Permissions.map((perm) => ({
            id: perm.id,
            module: perm.module,
            isAccessible: perm.isAccessible,
          }))
        : [];

    const { token, refreshToken } = signToken(
      employee.id,
      employee.role,
      employee.fullname,
      employee.phoneNumber,
      permissionsList
    );

    // Set cookie options
    const cookieOptions = {
      expires: new Date(Date.now() + 1000 * 24 * 60 * 60 * 1000), // 1 day
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    };

    // Remove password from response
    employee.password = undefined;

    // Send response
    res.cookie("jwt", token, cookieOptions);
    res.status(statusCode).json({
      token,
      refreshToken,
    });
  } catch (error) {
    throw new Error("Failed to create and send token");
  }
};

exports.updateEmployementInfo = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { employeeTIN } = req.body;

    const employeeInfo = await EmployeeInfo.findOne({
      where: { EmployeeId: Number(req.params.id), isActive: true },
    });
    if (employeeInfo.employeeTIN === employeeTIN) {
      return next(
        createError.createError(400, "Employee info already updated")
      );
    }
    if (employeeInfo) {
      const updatedData = await employeeInfo.update(
        { isActive: false },
        { transaction }
      );
    }
    const newEmployeeInfo = await EmployeeInfo.create(
      {
        isActive: true,
        EmployeeId: Number(req.params.id),
        basicSalary: employeeInfo?.basicSalary,
        employement_Type: employeeInfo?.employement_Type,
        employeeTIN: employeeTIN,
        hireDate: employeeInfo?.hireDate,
      },
      { transaction }
    );
    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Employee information updated successfully",
    });
  } catch (error) {
    await transaction.rollback();
    next(createError.createError(503, "Internal server error"));
  }
};

// BULK EMPLOYEE REGISTRATION
exports.bulkEmployeeRegistration = async (req, res, next) => {
  try {
    return res.status(200).json(req.body);
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.downloadEmployeeRegistrationDoc = (req, res, next) => {
  try {
    // The content of the HTML for the PDF
    const apiDocumentationHtml = `
      <html>
      <head>
        <title>Employee Registration API Documentation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 10px; /* Set default font size */
            line-height: 1.2; /* Set line height to reduce spacing */
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          h3, h4, h5 {
            margin: 5px 0; /* Reduced margin for headings */
            padding: 0;
          }

          p, pre {
            margin: 5px 0; /* Reduced margin for paragraphs and pre-formatted text */
            padding: 0;
          }

          pre {
            font-size: 8px; /* Reduce font size for pre elements */
            white-space: pre-wrap; /* Allow text to wrap inside <pre> */
            word-wrap: break-word; /* Break long words for better fit */
            margin: 0;
            padding: 0;
          }

  

      
        </style>
      </head>
      <body>
        <h3>Employee Registration API Documentation</h3>
        <h5>Endpoint: POST /api/employee/register</h5>
        <p>Use this endpoint to register a new employee in the system.</p>
        
        <h4>Request Body</h4>
        <pre>
{
    "address": {
        "country": "Ethiopia",
        "state": "Addis Ababa",
        "zone_or_city": "Bole",
        "woreda": "13",
        "kebele": "05",
        "houseNumber": "09345"
    },
    "employeeInfo": {
        "employeeTIN": "4324324",
        "title": "Mr",
        "employeeType": "permanent",
        "hireDate": "2025-02-25",
        "employee_Code": "CG34",
        "basicSalary": "3000",
        "position": "2",
        "siteLocation": "AA"
    },
    "emergencyInfo": [
        {
            "fullname": "Daniel",
            "relation": "Father",
            "phoneNumber": "0943243243",
            "address": "Addis Ababa"
        }
    ],
    "basicInfo": {
        "fullname": "Samuel Daniel",
        "images": "",
        "sex": "male",
        "date_of_birth": "1998-02-25",
        "DepartmentId": "2",
        "GradeId": "7",
        "marriageStatus": "Single",
        "isActive": true,
        "nationality": "ET",
        "email": "samuel@gmail.com",
        "phoneNumber": "09324324324",
        "optionalPhoneNumber": "",
        "id_type": "passport",
        "id_Number": "kb432432"
    },
    "accountInformation": [
        {
            "bankName": "Coop",
            "accountNumber": "1000022299229294444",
            "isVerified": true
        }
    ]
}
        </pre>

        <h4>Response</h4>
        <p>A successful registration will return a response with status 200 and a message confirming the registration.</p>
        
        <h4>Response Example</h4>
        <pre>
{
    "status": "success",
    "message": "Employee registered successfully"
}
        </pre>

        <h4>Errors</h4>
        <p>If there are any errors during the registration, the API will return an appropriate status code and error message.</p>
        
        <h5>Error Response Example</h5>
        <pre>
{
    "status": "error",
    "message": "Invalid request data"
}
        </pre>
        
        <h4>Security</h4>
        <p>This API requires a valid token in the Authorization header to access. Use Bearer Token for authentication.</p>
      </body>
      </html>
    `;

    // Convert the HTML to PDF
    const options = { format: "A4" };
    pdf.create(apiDocumentationHtml, options).toBuffer((err, buffer) => {
      if (err) {
        return next(
          createError.createError(400, "An error occurred while downloading")
        );
      }

      // Set the response headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=employee_registration_api_documentation.pdf"
      );

      // Send the PDF buffer as a response
      res.end(buffer);
    });
  } catch (error) {
    return next(createError.createError(503, "Internal server error"));
  }
};

// ... existing code ...
exports.downloadEmployeeTemplate = async (req, res, next) => {
  try {
    const CompanyId = 1;

    const departments = await Department.findAll({ where: { CompanyId } });
    const positions = await Position.findAll({ where: { CompanyId } });
    const grades = await Grade.findAll({ where: { CompanyId } });

    const workbook = new ExcelJS.Workbook();

    // Instructions Sheet
    const instructionsSheet = workbook.addWorksheet("Instructions");
    instructionsSheet.columns = [
      { header: "Instructions", key: "instructions", width: 120 },
    ];
    instructionsSheet.getRow(1).font = {
      bold: true,
      size: 16,
      color: { argb: "FFFFFF" },
    };
    instructionsSheet.getRow(1).alignment = { horizontal: "center" };
    instructionsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0070C0" },
    };
    [
      "1. Please refer to the 'Grades' sheet to view the available grade names and their corresponding salary ranges (Min Salary and Max Salary).",
      "2. When entering a salary in the 'Employees' sheet, ensure the salary falls within the Min and Max Salary range specified for the corresponding grade.",
      "3. For fields such as 'Sex' and 'Marital Status', please select from the provided dropdown options.",
      "4. For the 'Date of Birth' and 'Hire Date' fields, use the calendar picker in Excel or enter the date in 'mm/dd/yyyy' format.",
      "5. The 'Email' field must be unique and follow the correct format (e.g., example@domain.com).",
      "6. For payment information:",
      "   - Select payment method (phone/account)",
      "   - If 'phone' is selected:",
      "     * Enter phone number in 'PHONE NUMBER' field",
      "     * Enter payment phone number in 'PAYMENT PHONE NUMBER' field",
      "   - If 'account' is selected:",
      "     * Enter account number in 'ACCOUNT NUMBER' field",
      "   - At least one payment method must be provided",
    ].forEach((text) => {
      const row = instructionsSheet.addRow({ instructions: text });
      row.font = { size: 11 };
      row.alignment = { wrapText: true };
    });

    // Departments Sheet (hidden)
    const departmentSheet = workbook.addWorksheet("Departments", {
      state: "hidden",
    });
    departmentSheet.columns = [
      { header: "Department ID", key: "id", width: 15 },
      { header: "Department Name", key: "deptName", width: 30 },
    ];
    departments.forEach((department) => {
      departmentSheet.addRow({
        id: department.id,
        deptName: department.deptName,
      });
    });

    // Positions Sheet (hidden)
    const positionSheet = workbook.addWorksheet("Positions", {
      state: "hidden",
    });
    positionSheet.columns = [
      { header: "Position ID", key: "id", width: 15 },
      { header: "Position Name", key: "name", width: 30 },
    ];
    positions.forEach((position) => {
      positionSheet.addRow({ id: position.id, name: position.positionName });
    });

    // Grades Sheet
    const gradeSheet = workbook.addWorksheet("Grades");
    gradeSheet.columns = [
      { header: "Grade Name", key: "name", width: 20 },
      { header: "Min Salary", key: "minSalary", width: 20 },
      { header: "Max Salary", key: "maxSalary", width: 20 },
    ];
    gradeSheet.getRow(1).font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 12,
    };
    gradeSheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    gradeSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0070C0" },
    };
    grades.forEach((grade) => {
      const row = gradeSheet.addRow({
        name: grade.name,
        minSalary: grade.minSalary,
        maxSalary: grade.maxSalary,
      });
      row.font = { size: 11 };
      row.alignment = { vertical: "middle", horizontal: "left" };
    });

    // Employees Sheet
    const employeeSheet = workbook.addWorksheet("Employees");
    employeeSheet.columns = [
      { header: "FULL NAME", key: "fullname", width: 40 },
      { header: "SEX", key: "sex", width: 20 },
      {
        header: "DATE OF BIRTH",
        key: "date_of_birth",
        width: 25,
        style: { numFmt: "mm/dd/yyyy" },
      },
      { header: "EMAIL", key: "email", width: 40 },
      {
        header: "PHONE NUMBER",
        key: "phoneNumber",
        width: 40,
        style: { numFmt: "@" }, // Set as text format
      },
      { header: "DEPARTMENT", key: "DepartmentId", width: 40 },
      { header: "GRADE", key: "GradeId", width: 40 },
      { header: "MARRIAGE STATUS", key: "marriageStatus", width: 40 },
      { header: "EMPLOYEE TIN", key: "employeeTIN", width: 40 },
      {
        header: "HIRE DATE",
        key: "hireDate",
        width: 40,
        style: { numFmt: "mm/dd/yyyy" },
      },
      { header: "BASIC SALARY", key: "basicSalary", width: 40 },
      { header: "POSITION", key: "positionId", width: 40 },
      { header: "PAYMENT METHOD", key: "paymentMethod", width: 40 },
      {
        header: "ACCOUNT NUMBER",
        key: "accountNumber",
        width: 40,
        style: { numFmt: "@" }, // Set as text format
      },
      {
        header: "PAYMENT PHONE NUMBER",
        key: "paymentPhoneNumber",
        width: 40,
        style: { numFmt: "@" }, // Set as text format
      },
    ];

    // Set header style
    const headerRow = employeeSheet.getRow(1);
    headerRow.font = { color: { argb: "ffffff" }, bold: true, size: 12 };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0070C0" },
    };
    headerRow.height = 20;

    // Set font size for all columns (including data rows)
    employeeSheet.eachRow((row, rowNumber) => {
      row.font = { size: 11 };
      row.alignment = { vertical: "middle", horizontal: "left" };
    });

    // Dropdown options
    const SEX_LIST = ["Male", "Female"];
    const MARITALSTATUS = ["Single", "Married", "Divorced"];
    const IDTYPE = ["kebele", "passport", "driving License"];
    const PAYMENT_METHODS = ["phone", "account"];
    const departmentNames = departments.map((dept) => dept.deptName);
    const positionNames = positions.map((pos) => pos.positionName);
    const gradeNames = grades.map((grade) => grade.name);

    // Hidden option sheets
    const sexSheet = workbook.addWorksheet("SexOptions", { state: "hidden" });
    const maritalStatusSheet = workbook.addWorksheet("MaritalStatusOptions", {
      state: "hidden",
    });
    const idTypeSheet = workbook.addWorksheet("IdTypeOptions", {
      state: "hidden",
    });
    const paymentMethodSheet = workbook.addWorksheet("PaymentMethodOptions", {
      state: "hidden",
    });

    SEX_LIST.forEach(
      (value, i) => (sexSheet.getCell(`A${i + 1}`).value = value)
    );
    MARITALSTATUS.forEach(
      (value, i) => (maritalStatusSheet.getCell(`A${i + 1}`).value = value)
    );
    IDTYPE.forEach(
      (value, i) => (idTypeSheet.getCell(`A${i + 1}`).value = value)
    );
    PAYMENT_METHODS.forEach(
      (value, i) => (paymentMethodSheet.getCell(`A${i + 1}`).value = value)
    );

    // Data validation (dropdowns)
    for (let row = 2; row <= 100; row++) {
      // SEX
      employeeSheet.getCell(`B${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`SexOptions!$A$1:$A$${SEX_LIST.length}`],
      };
      // DEPARTMENT
      employeeSheet.getCell(`F${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        showDropDown: true,
        formulae: [`"${departmentNames.join(",")}"`],
      };
      // GRADE
      employeeSheet.getCell(`G${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        showDropDown: true,
        formulae: [`"${gradeNames.join(",")}"`],
      };
      // MARRIAGE STATUS
      employeeSheet.getCell(`H${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        showDropDown: true,
        formulae: [`MaritalStatusOptions!$A$1:$A$${MARITALSTATUS.length}`],
      };
      // PAYMENT METHOD
      employeeSheet.getCell(`M${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        showDropDown: true,
        formulae: [`PaymentMethodOptions!$A$1:$A$${PAYMENT_METHODS.length}`],
      };
      // ID-TYPE
      employeeSheet.getCell(`Q${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`IdTypeOptions!$A$1:$A$${IDTYPE.length}`],
      };
      // POSITION
      employeeSheet.getCell(`L${row}`).dataValidation = {
        type: "list",
        allowBlank: true,
        showDropDown: true,
        formulae: [`"${positionNames.join(",")}"`],
      };
    }

    // Date columns: Excel will show calendar picker for date-formatted cells
    employeeSheet
      .getColumn("date_of_birth")
      .eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber === 1) return;
        cell.numFmt = "mm/dd/yyyy";
        cell.dataValidation = {
          type: "date",
          operator: "greaterThan",
          formula1: "1900-01-01",
          showErrorMessage: true,
          errorTitle: "Invalid Date",
          error: "Please enter a valid date.",
        };
      });
    employeeSheet
      .getColumn("hireDate")
      .eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber === 1) return;
        cell.numFmt = "mm/dd/yyyy";
        cell.dataValidation = {
          type: "date",
          operator: "greaterThan",
          formula1: "1900-01-01",
          showErrorMessage: true,
          errorTitle: "Invalid Date",
          error: "Please enter a valid date.",
        };
      });

    // Add conditional formatting for payment method validation
    for (let row = 2; row <= 100; row++) {
      // Add data validation for account number based on payment method
      const accountNumberCell = employeeSheet.getCell(`N${row}`);
      accountNumberCell.dataValidation = {
        type: "custom",
        formula1: `OR(M${row}="account",M${row}="")`,
        showErrorMessage: true,
        errorTitle: "Invalid Entry",
        error: "Account number is required when payment method is 'account'",
      };

      // Add data validation for phone number based on payment method
      const phoneNumberCell = employeeSheet.getCell(`E${row}`);
      phoneNumberCell.dataValidation = {
        type: "custom",
        formula1: `OR(M${row}="phone",M${row}="")`,
        showErrorMessage: true,
        errorTitle: "Invalid Entry",
        error: "Phone number is required when payment method is 'phone'",
      };

      // Add data validation for payment phone number based on payment method
      const paymentPhoneNumberCell = employeeSheet.getCell(`O${row}`);
      paymentPhoneNumberCell.dataValidation = {
        type: "custom",
        formula1: `OR(M${row}="phone",M${row}="")`,
        showErrorMessage: true,
        errorTitle: "Invalid Entry",
        error:
          "Payment phone number is required when payment method is 'phone'",
      };
    }

    // Send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=employee_template.xlsx"
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log(error);
    next(createError.createError(503, "Internal Server Error"));
  }
};
// ... existing code ...

exports.genrea = async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    const secondSheet = workbook.addWorksheet("Sheet2");

    const STATE_LIST = [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Andaman and Nicobar Islands",
      "Chandigarh",
      "Dadra and Nagar Haveli and Daman and Diu",
      "Lakshadweep",
      "Delhi (National Capital Territory of Delhi)",
      "Puducherry",
    ];

    // Add states to second sheet
    STATE_LIST.forEach((value, index) => {
      const rowNumber = index + 1;
      secondSheet.getCell(`A${rowNumber}`).value = value;
    });

    const headerRow = [
      "CUSTOMER NAME",
      "CUSTOMER EMAIL",
      "CUSTOMER ADDRESS",
      "MOBILE NUMBER",
      "PRODUCT NAME",
      "TOTAL AMOUNT",
      "DISCOUNT",
      "STATE",
      "CITY",
      "PIN CODE",
    ];

    worksheet.addRow(headerRow);
    const header = worksheet.getRow(1);

    const stateSize = secondSheet.getColumn(1).values;

    header.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "090f63" }, // Set the header color (light gray in this example)
      };
      cell.font = {
        color: { argb: "ffffff" },
        bold: true,
      };

      if (cell.value == "STATE") {
        let i = 2;
        while (i < 100) {
          const customerTypeCell = worksheet.getCell(
            `${cell.address.charAt(0)}${i}`
          );
          customerTypeCell.dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`Sheet2!$A$1:$A$${stateSize.length}`],
          };
          i++;
        }
      }
    });

    const createSheet1 = workbook.getWorksheet("Sheet1");
    const createSheet2 = workbook.getWorksheet("Sheet2");

    if (worksheet) {
      createSheet1.columns.forEach((column, index) => {
        column.width = 25;

        createSheet1.eachRow((row) => {
          row.height = 25;
        });

        // Center align cells in the worksheet
        for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber++) {
          const cell = worksheet.getCell(rowNumber, index + 1);
          cell.alignment = { horizontal: "center", vertical: "middle" };
        }
      });
    }

    // Hide the second sheet containing the states
    createSheet2.state = "hidden";

    // Set the response headers to allow file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Customer-file.xlsx"
    );

    // Stream the workbook as a response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.bulkRegister = async (req, res, next) => {
  try {
    // Prepare CompanyId
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    // Fetch the company to get region/zone/woreda
    const company = await Company.findByPk(CompanyId);

    const companyRegionId = company?.regionId;
    const companyZoneId = company?.zoneId;
    const companyWoredaId = company?.woredaId;

    // Fetch idformat for employee_id_number generation
    const idformat = await IdFormat.findOne({ where: { CompanyId } });

    const excelFile = req?.files?.["file"]?.[0]?.path;

    if (!excelFile) {
      return next(createError.createError(404, "Please upload the file"));
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFile);
    const worksheet = workbook.getWorksheet("Employees"); // Ensure this matches your template sheet name

    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber !== 1) rows.push(row); // Skip header row
    });

    // Fetch departments, grades, and positions once to avoid repeated database queries
    const [departments, grades, positions] = await Promise.all([
      Department.findAll({ where: { CompanyId } }),
      Grade.findAll({ where: { CompanyId } }),
      Position.findAll({ where: { CompanyId } }),
    ]);

    const departmentNames = new Map(departments.map((d) => [d.deptName, d.id]));
    const gradeNames = new Map(grades.map((g) => [g.name, g.id]));
    const positionNames = new Map(positions.map((p) => [p.positionName, p.id]));
    // For shorthand representation
    const departmentShorthand = new Map(
      departments.map((d) => [d.id, d.shorthandRepresentation])
    );

    const employees = [];
    const accountInfos = [];
    const saltRounds = 10;

    // --- Find the highest employee code in the DB for this company ---
    // Fetch all employee_id_numbers for this company
    const allEmployeeIds = await Employee.findAll({
      where: { CompanyId },
      attributes: ["employee_id_number"],
      raw: true,
    });

    let maxEmployeeCode = 0;
    if (allEmployeeIds && allEmployeeIds.length > 0) {
      for (const emp of allEmployeeIds) {
        const code = emp.employee_id_number;
        if (code) {
          // Get the numeric part after the last separator
          const parts = code.split(idformat?.separator);
          const numPart = parts[parts.length - 1];
          const num = parseInt(numPart, 10);
          if (!isNaN(num) && num > maxEmployeeCode) {
            maxEmployeeCode = num;
          }
        }
      }
    }
    let nextEmployeeCode = maxEmployeeCode;

    for (const row of rows) {
      // Map columns according to the template
      const fullName = row.getCell(1).text.trim();
      const sex = row.getCell(2).text.trim();
      const dateOfBirthRaw = row.getCell(3).text.trim();
      const email = row.getCell(4).text.trim();
      const phoneNumber = row.getCell(5).text.trim();
      const departmentName = row.getCell(6).text.trim();
      const gradeName = row.getCell(7).text.trim();
      const marriageStatus = row.getCell(8).text.trim();
      const employeeTIN = row.getCell(9).text.trim();
      const hireDateRaw = row.getCell(10).text.trim();
      const basicSalary = parseFloat(row.getCell(11).text.trim());
      const positionName = row.getCell(12).text.trim();
      const paymentMethod = row.getCell(13).text.trim();
      const accountNumber = row.getCell(14).text.trim();
      const paymentPhoneNumber = row.getCell(15).text.trim();

      // Fetch DepartmentId, PositionId, GradeId from preloaded maps
      const departmentId = departmentNames.get(departmentName);
      const positionId = positionNames.get(positionName);
      const gradeId = gradeNames.get(gradeName);

      // Check if the necessary data exists
      if (!departmentId || !positionId || !gradeId) {
        return next(
          createError.createError(
            400,
            "Invalid department, position, or grade."
          )
        );
      }

      if (!fullName || !email) {
        return next(
          createError.createError(
            400,
            "Full name and email are required fields and cannot be empty."
          )
        );
      }

      // Validate payment method and account information
      if (!paymentMethod) {
        return next(
          createError.createError(400, "Payment method must be provided.")
        );
      }

      if (paymentMethod === "phone") {
        if (!paymentPhoneNumber) {
          return next(
            createError.createError(
              400,
              "Payment phone number is required when payment method is 'phone'."
            )
          );
        }
      } else if (paymentMethod === "account") {
        if (!accountNumber) {
          return next(
            createError.createError(
              400,
              "Account number is required when payment method is 'account'."
            )
          );
        }
      } else {
        return next(
          createError.createError(
            400,
            "Invalid payment method. Must be either 'phone' or 'account'."
          )
        );
      }

      // Check if email is unique
      const existingEmail = await Employee.findOne({ where: { email } });
      if (existingEmail) {
        return next(
          createError.createError(400, `Email '${email}' is already taken.`)
        );
      }

      // Check if basic salary is within the valid range for the grade
      const grade = grades.find((g) => g.id === gradeId);
      if (basicSalary < grade.minSalary || basicSalary > grade.maxSalary) {
        return next(
          createError.createError(
            400,
            `Basic salary '${basicSalary}' is outside the valid range for grade '${gradeName}'.`
          )
        );
      }

      // Prepare employee data
      const hireDate = hireDateRaw
        ? new Date(hireDateRaw).toISOString().slice(0, 10)
        : null;
      const dateOfBirth = dateOfBirthRaw
        ? new Date(dateOfBirthRaw).toISOString().slice(0, 10)
        : null;

      // Prepare password and hash it
      const rawPassword = req?.user?.companyCode?.substring(0, 4) + "0000";
      const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

      // --- Generate employee_id_number ---
      nextEmployeeCode += 1;
      const paddedEmployeeCode = nextEmployeeCode
        .toString()
        .padStart(idformat?.digitLength, "0");

      const formatElements = idformat?.order?.split(",");
      let employeeId = "";
      for (let i = 0; i < formatElements.length; i++) {
        const element = formatElements[i];
        switch (element) {
          case "companyCode":
            employeeId += idformat?.companyCode;
            break;
          case "year":
            employeeId += hireDate ? hireDate.split("-")[0] : "";
            break;
          case "department":
            employeeId += departmentShorthand.get(departmentId) || "";
            break;
        }
        if (i !== formatElements.length - 1) {
          employeeId += idformat?.separator;
        }
      }
      employeeId += idformat?.separator + paddedEmployeeCode;
      // --- End employee_id_number generation ---

      // Build employee data object
      const employeeData = {
        fullname: fullName,
        sex,
        date_of_birth: dateOfBirth,
        email,
        phoneNumber,
        DepartmentId: departmentId,
        GradeId: gradeId,
        marriageStatus,
        employeeTIN,
        hireDate,
        basicSalary,
        PositionId: positionId,
        password: hashedPassword,
        isActive: true,
        CompanyId,
        regionId: companyRegionId || null,
        zoneId: companyZoneId || null,
        woredaId: companyWoredaId || null,
        employee_id_number: employeeId,
      };

      if (!employeeData.phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      employees.push(employeeData);

      // Prepare account information based on payment method
      const accountInfo = {
        paymentMethod,
        isActive: true,
        isVerified: false,
        CompanyId,
        // We'll set EmployeeId after creating the employee
      };

      // Set account number or phone number based on payment method
      if (paymentMethod === "phone") {
        accountInfo.phoneNumber = paymentPhoneNumber;
        accountInfo.accountNumber = paymentPhoneNumber; // Use phone number as account number for phone payments
      } else {
        accountInfo.accountNumber = accountNumber;
      }

      accountInfos.push(accountInfo);
    }

    await sequelize.transaction(async (t) => {
      // Create all employees
      const createdEmployees = await Employee.bulkCreate(employees, {
        transaction: t,
        returning: true, // This ensures we get back the created records with their IDs
      });

      // Create account information for each employee
      const accountInfoWithEmployeeIds = accountInfos.map(
        (accountInfo, index) => ({
          ...accountInfo,
          EmployeeId: createdEmployees[index].id,
        })
      );

      // Bulk create account information
      await AccountInfo.bulkCreate(accountInfoWithEmployeeIds, {
        transaction: t,
      });

      return res.status(201).json({
        message: "Bulk employee registration completed successfully.",
      });
    });
  } catch (error) {
    console.log(error);
    return next(createError.createError(500, "Internal server error", error));
  }
};
