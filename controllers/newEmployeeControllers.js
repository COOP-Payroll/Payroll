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
      (accountInformation?.[0]?.accountNumber === '' &&
        accountInformation?.[0]?.phoneNumber === '')
    ) {
      return next(createError.createError(400, "Account number or phone number is required"));
    }
    if (accountInformation[0]?.paymentMethod === "phone" && (!accountInformation[0]?.phoneNumber || accountInformation[0]?.phoneNumber === "")) {
      return next(createError.createError(400, "Phone number is required when payment method is 'phone'."));
    }
    
    // Check if account number is missing and payment method is not selected
    if (!accountInformation[0]?.accountNumber || accountInformation[0]?.accountNumber === "") {
      if (!accountInformation[0]?.paymentMethod) {
        return next(createError.createError(400, "Either account number or payment method must be provided."));
      }
      // If payment method is selected but no account number, you can handle it differently if needed
      if (accountInformation[0]?.paymentMethod && accountInformation[0]?.paymentMethod !== "phone") {
        return next(createError.createError(400, "Account number is required unless payment method is 'phone'."));
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
        where:{CompanyId:CompanyId },
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


// exports.createEmployee = async (req, res, next) => {
//   const {
//     address,
//     employeeInfo,
//     emergencyInfo,
//     basicInfo,
//     accountInformation,
//   } = req.body;

//   try {
//     var regionId, zoneId, woredaId;
//     const CompanyId =
//       req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

//     const company = await Company.findOne({ where: { id: CompanyId } });
//     const companyRegionId = company?.regionId;
//     const companyZoneId = company?.zoneId;
//     const companyWoredaId = company?.woredaId;

//     // Always set from company if not set in the request body
//     if (companyRegionId) {
//       basicInfo.regionId = companyRegionId; // Overwrite with company region
//     }

//     if (companyZoneId) {
//       basicInfo.zoneId = companyZoneId; // Overwrite with company zone
//     }

//     if (companyWoredaId) {
//       basicInfo.woredaId = companyWoredaId; // Overwrite with company woreda
//     }



//     if (!basicInfo?.DepartmentId || !basicInfo?.GradeId) {
//       return next(
//         createError.createError(400, "Please provide all required information")
//       );
//     }

//     if (
//       !accountInformation ||
//       accountInformation?.[0]?.accountNumber === undefined
//     ) {
//       return next(createError.createError(400, "Account number is required"));
//     }

//     const accountNumbers = accountInformation?.map(
//       (acct) => acct.accountNumber
//     );
//     const [position, grade, department, employee, accountInfos, idformat] =
//       await Promise.all([
//         Position.findOne({
//           where: { id: Number(employeeInfo.position), CompanyId: CompanyId },
//         }),
//         Grade.findOne({ where: { id: Number(basicInfo?.GradeId), CompanyId } }),
//         Department.findOne({
//           where: { id: Number(basicInfo?.DepartmentId), CompanyId },
//         }),
//         Employee.findOne({
//           where: { email: basicInfo?.email, CompanyId },
//         }),
//         AccountInfo.findAll({
//           where: { accountNumber: accountNumbers, CompanyId },
//         }),
//         IdFormat.findOne({
//           where: { CompanyId, isActive: true },
//         }),
//       ]);

//     if (!position) {
//       return next(createError.createError(404, "Position not found"));
//     }
//     if (!grade) {
//       return next(createError.createError(404, "Grade not found"));
//     }

//     if (!department) {
//       return next(createError.createError(404, "Department not found"));
//     }
//     if (
//       employeeInfo.basicSalary < grade?.minSalary ||
//       employeeInfo.basicSalary > grade?.maxSalary
//     ) {
//       return next(
//         createError.createError(
//           404,
//           `Basic salary must be between ${grade.minSalary} and ${grade.maxSalary}`
//         )
//       );
//     }

//     if (employee) {
//       return next(
//         createError.createError(
//           404,
//           `Employee already exists with ${basicInfo?.email} email.`
//         )
//       );
//     }

//     if (accountInfos.length > 0) {
//       return next(createError.createError(404, "Account infos already exist."));
//     }

//     let password = req?.user?.companyCode?.substring(0, 4) + "0000";

//     await sequelize.transaction(async (t) => {
//       const imagePath = req?.files?.["basicInfo[image]"]?.[0]?.path || null;
//       const idImagePath =
//         req?.files?.["basicInfo[id_image]"]?.[0]?.path || null;

//       const formatElements = idformat?.order?.split(",");
//       const lastEmployee = await Employee.findOne({
//         order: [["createdAt", "DESC"]],
//       });
//       let paddedEmployeeCode = "00001";

//       if (lastEmployee) {
//         const lastEmployeeId = lastEmployee.employee_id_number;
//         const lastEmployeeCode = lastEmployeeId
//           .split(idformat?.separator)
//           ?.pop();
//         const incrementedEmployeeCode = parseInt(lastEmployeeCode, 10) + 1;
//         paddedEmployeeCode = incrementedEmployeeCode
//           .toString()
//           .padStart(idformat?.digitLength, "0");
//       }

//       let employeeId = "";
//       for (let i = 0; i < formatElements.length; i++) {
//         const element = formatElements[i];
//         switch (element) {
//           case "companyCode":
//             employeeId += idformat?.companyCode;
//             break;
//           case "year":
//             employeeId += employeeInfo.hireDate.split("-")[0];
//             break;
//           case "department":
//             employeeId += department.shorthandRepresentation;
//             break;
//         }

//         if (i !== formatElements.length - 1) {
//           employeeId += idformat?.separator;
//         }
//       }

//       employeeId += idformat?.separator + paddedEmployeeCode;
//       const createEmployee = await Employee.create(
//         {
//           ...basicInfo,
//           password,
//           isActive: true,
//           image: imagePath,
//           id_image: idImagePath,
//           CompanyId: Number(req.user.id),
//           employee_id_number: employeeId,
//         },
//         { transaction: t }
//       );
//       const junctionCreate = await EmployeeDepartment.create(
//         {
//           EmployeeId: Number(createEmployee.id),
//           DepartmentId: Number(department.id),
//           active: true,
//         },
//         { transaction: t }
//       );

//       const junctionGrade = await EmployeeGrade.create(
//         {
//           EmployeeId: Number(createEmployee.id),
//           GradeId: Number(grade.id),
//           active: true,
//         },
//         { transaction: t }
//       );

//       const junctionPosition = await EmployeePosition.create(
//         {
//           EmployeeId: Number(createEmployee.id),
//           PositionId: Number(position.id),
//         },
//         { transaction: t }
//       );
//       const createAddress = await Address.create(
//         { ...address, EmployeeId: createEmployee.id, isActive: true },
//         { transaction: t }
//       );

//       const createEmployeeInfo = await EmployeeInfo.create(
//         { ...employeeInfo, isActive: true, EmployeeId: createEmployee.id },
//         { transaction: t }
//       );

//       const createdEmergencyInfos = await EmergencyContact.bulkCreate(
//         emergencyInfo.map((info) => ({
//           ...info,
//           isActive: true,
//           EmployeeId: createEmployee.id,
//         })),
//         { transaction: t }
//       );

//       const accountImages = accountInformation.map((info, index) => {
//         const key = `accountInformation[${index}][image]`;
//         return req?.files?.[key]?.[0]?.path || null;
//       });

//       const createdAccountInformations = await AccountInfo.bulkCreate(
//         accountInformation.map((info, index) => ({
//           ...info,
//           EmployeeId: createEmployee.id,
//           isActive: info.isActive || true,
//           image: accountImages[index],
//         })),
//         { transaction: t }
//       );

//       return res.status(201).json({
//         success: true,
//         message: "Registered successfully",
//       });
//     });
//   } catch (error) {
//     console.log(error);
//     return next(
//       createError.createError(
//         503,
//         "An error occurred while creating the records."
//       )
//     );
//   }
// };

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

    // if (GradeId) {

    //    grade = await Grade.findOne({ where: { id: GradeId } })

    //      if (!grade) {
    //     status=true
    //   }
    //   if (basicSalary) {
    //     if (basicSalary < grade?.minSalary || basicSalary > grade?.maxSalary) {
    //       return next(
    //         createError.createError(
    //           400,
    //           `Basic salary must be between ${grade.minSalary} and ${grade.maxSalary}`
    //         )
    //       )
    //     }
    //   } else {if(employee.basicSalary < grade?.minSalary || employee.basicSalary > grade?.maxSalary) {
    //       return next(
    //         createError.createError(
    //           400,
    //           `Basic salary must be between ${grade.minSalary} and ${grade.maxSalary}`
    //         )
    //       )
    //     }
    //   }
    // }
    //     if (basicSalary) {
    //       if(status){
    //         console.log('basicsalary', basicSalary)
    //         if (
    //           basicSalary < employee.Grades[0]?.minSalary ||
    //           basicSalary > employee.Grades[0]?.maxSalary
    //         ) {

    //        return next(createError.createError(400, `Basic salary must be between ${employee.Grades[0]?.minSalary} and ${employee.Grades[0]?.maxSalary}`
    //           ))
    //         }
    //       }

    //       else {

    //         const employeeInfo = await EmployeeInfo.findOne({
    //           where: { EmployeeId: Number(employee.id), isActive: true }
    //         },{transaction})
    //         // return res.status(200).json({data:employeeInfo.basicSalary
    //         // })
    //         if (employeeInfo) {
    //           const updatedData = await employeeInfo.update(
    //             { isActive: false },
    //             { transaction }
    //           )
    //         }
    //         // console.log("department",DepartmentId)
    //         const newEmployeeInfo = await EmployeeInfo.create(
    //           {
    //             isActive: true,
    //             EmployeeId: Number(employee.id),
    //             basicSalary: basicSalary ? basicSalary : employeeInfo?.basicSalary,
    //             grossEarning: grossEarning
    //               ? grossEarning
    //               : employeeInfo?.grossEarning,
    //             position: employeeInfo?.position,
    //             employement_Type: employeeInfo?.employement_Type,
    //             employeeTIN: employeeInfo?.employeeTIN,

    //             hireDate: employeeInfo?.hireDate
    //           },
    //           { transaction }
    //         )

    //         // newEmployeeInfo.save();
    //       }
    //     }

    // if (position) {

    //   console.log(employee.Positions?.[0]?.id != position)
    //   if(employee.Positions?.[0]?.id != position) {
    //     console.log("helloo")
    //   const foundPosition= await Position.findOne({where: {id: position, companyId:req.user.id}},{transaction});
    //   if(!foundPosition){
    //    return next(createError.createError(404, 'Position not found'));
    //   }
    //    const employeeInfo = await EmployeePosition.findOne({
    //     where: { EmployeeId: Number(employee.id), isActive: true }
    //   })
    //   // console.log('employee', employeeInfo.basicSalary)
    //   if (employeeInfo) {
    //     await employeeInfo.update({ isActive: false }, { transaction })
    //   }
    //   const newEmployeeInfo = await EmployeePosition.create(
    //     {
    //       isActive: true,
    //       EmployeeId: Number(employee.id),
    //       PositionId:position,
    //       // CompanyId:req.user.id
    //             },
    //     { transaction }
    //   )}
    // }

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

    //  // Check if the confirmation token is valid and not expired
    //  if (employee.confirmationToken === token && expirationDate <= new Date()) {
    //    // Update the employee's confirmation status in the database
    //    employee.isConfirmed = true;
    //    employee.confirmationToken = null; // Clear the confirmation token
    //    employee.confirmationTokenExpiry = null; // Clear the confirmation token expiry
    //    await employee.save();

    //    res.send("Email confirmed successfully");
    //  }

    //  else {
    //    res.status(400).send("Invalid or expired confirmation link");
    //  }
    res.status(200).json("employee", employee);
  } catch (error) {}
};

//   <p>Dear ${createEmployee.fullname},</p>
// <p>Thank you for registering as an employee.</p>
// <p>Your registration is valid until ${formattedExpirationDate}.</p>
// <p>Please click one of the following links to accept or reject your registration:</p>
// <ul>
//   <li><a href="${URL}/accept/${acceptanceCode}">Accept</a></li>
//   <li><a href="${URL}/reject/${rejectionCode}">Reject</a></li>
// </ul>
//   <form action="http://yourwebsite.com/reject/" method="POST">
//   <button type="submit">Reject</button>
// </form>

//PROMOTION

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

    //   if(position){
    //     if(employee.Positions?.[0]?.id === Number(position)){
    //       // return res.json("equial")
    //     }
    //     else
    //  {
    //       const foundPosition = await Position.findOne({where:{
    //         id:position,
    //         CompanyId:req.user.id,

    //         // isActive:true,

    //       }})
    //       if(!foundPosition){
    //       return next(createError.createError(404,"Position not found"))
    //     }
    //     if (imagePath ==null){
    //       return next(createError.createError(404,"Please insert Letter of promotion "))
    //     }
    //            const employeePosition = await EmployeePosition.findOne({
    //              where: { EmployeeId: Number(req.params.id),PositionId:employee?.Positions?.[0]?.id
    //              , isActive: true },
    //            });

    //            if (employeePosition) {
    //          await employeePosition.update({ isActive: false }, { transaction });

    //                   }
    //            const newEmployeeInfo = await EmployeePosition.create(
    //              {
    //                isActive: true,
    //                EmployeeId: Number(employee.id),
    //                PositionId: Number(position),
    //                letter:imagePath
    //                    },

    //              { transaction }
    //            );

    //     }
    //   }

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

// exports.downloadEmployeeRegistrationDoc = (req, res, next) => {
//   try {
//     // The content of the HTML for the PDF
//     const apiDocumentationHtml = `
//       <html>
//       <head>
//         <title>Employee Registration API Documentation</title>
//       </head>
//       <body>
//         <h3>Employee Registration API Documentation</h3>
//         <h5>Endpoint: POST /api/employee/register</h5>
//         <p>Use this endpoint to register a new employee in the system.</p>

//         <h4>Request Body</h4>
//         <pre>
// {
//     "address": {
//         "country": "Ethiopia",
//         "state": "Addis Ababa",
//         "zone_or_city": "Bole",
//         "woreda": "13",
//         "kebele": "05",
//         "houseNumber": "09345"
//     },
//     "employeeInfo": {
//         "employeeTIN": "4324324",
//         "title": "Mr",
//         "employeeType": "permanent",
//         "hireDate": "2025-02-25",
//         "employee_Code": "CG34",
//         "basicSalary": "3000",
//         "position": "2",
//         "siteLocation": "AA"
//     },
//     "emergencyInfo": [
//         {
//             "fullname": "Daniel",
//             "relation": "Father",
//             "phoneNumber": "0943243243",
//             "address": "Addis Ababa"
//         }
//     ],
//     "basicInfo": {
//         "fullname": "Samuel Daniel",
//         "images": "",
//         "sex": "male",
//         "date_of_birth": "1998-02-25",
//         "DepartmentId": "2",
//         "GradeId": "7",
//         "marriageStatus": "Single",
//         "isActive": true,
//         "nationality": "ET",
//         "email": "samuel@gmail.com",
//         "phoneNumber": "09324324324",
//         "optionalPhoneNumber": "",
//         "id_type": "passport",
//         "id_Number": "kb432432"
//     },
//     "accountInformation": [
//         {
//             "bankName": "Coop",
//             "accountNumber": "1000022299229294444",
//             "isVerified": true
//         }
//     ]
// }
//         </pre>

//         <h4>Response</h4>
//         <p>A successful registration will return a response with status 200 and a message confirming the registration.</p>

//         <h4>Response Example</h4>
//         <pre>
// {
//     "status": "success",
//     "message": "Employee registered successfully"
// }
//         </pre>

//         <h4>Errors</h4>
//         <p>If there are any errors during the registration, the API will return an appropriate status code and error message.</p>

//         <h5>Error Response Example</h5>
//         <pre>
// {
//     "status": "error",
//     "message": "Invalid request data"
// }
//         </pre>

//         <h4>Security</h4>
//         <p>This API requires a valid token in the Authorization header to access. Use Bearer Token for authentication.</p>
//       </body>
//       </html>
//     `;

//     // return res.json(apiDocumentationHtml);
//     // Convert the HTML to PDF
//     const options = { format: "A4" };
//     pdf.create(apiDocumentationHtml, options).toBuffer((err, buffer) => {
//       if (err) {
//         return next(
//           createError.createError(400, "An error occour while downloading")
//         );
//       }

//       // Set the response headers for PDF download
//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader(
//         "Content-Disposition",
//         "attachment; filename=employee_registration_api_documentation.pdf"
//       );

//       // Send the PDF buffer as a response
//       res.end(buffer);
//     });
//   } catch (error) {
//     return next(createError.createError(503, "Internal server error"));
//   }
// };
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

exports.downloadEmployeeTemplate = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const departments = await Department.findAll({
      where: {
        CompanyId: CompanyId,
      },
    });
    const positions = await Position.findAll({
      where: {
        CompanyId: CompanyId,
      },
    });
    const grades = await Grade.findAll({
      where: {
        CompanyId: CompanyId,
      },
    });
    const workbook = new ExcelJS.Workbook();

    // Add an instructions sheet
    const instructionsSheet = workbook.addWorksheet("Instructions");
    instructionsSheet.columns = [
      { header: "Instructions", key: "instructions", width: 150 },
    ];

    // Apply bold and font size to the header
    instructionsSheet.getRow(1).font = {
      bold: true,
      size: 20,
      color: { argb: "FFFFFF" },
    }; // Bold and font size for the header
    instructionsSheet.getRow(1).alignment = { horizontal: "center" }; // Center-align the header
    instructionsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0070C0" },
    };
    const instructionsRows = [
      "1. Please refer to the 'Grades' sheet to view the available grade names and their corresponding salary ranges (Min Salary and Max Salary).",
      "2. When entering a salary in the 'Employees' sheet, ensure the salary falls within the Min and Max Salary range specified for the corresponding grade.",
      "3. For fields such as 'Sex' and 'Marital Status', please select from the provided dropdown options. The 'Sex' field allows the selection of either 'MALE' or 'FEMALE', and the 'Marital Status' field provides options like 'Single', 'Married', etc.",
      "4. For the 'Date of Birth' field, please ensure the date is entered in the format 'mm/dd/yyyy'. Use the calendar picker to select a date or enter the value manually in the correct format.",
      "5. The 'Email', 'Account Number', and 'Phone Number' fields must be unique. Please ensure that no duplicate values are entered in these fields. The 'Email' must follow the correct format (e.g., example@domain.com), the 'Account Number' must be unique for each employee, and the 'Phone Number' must also be unique.",
    ];

    // Add and style instruction rows
    instructionsRows.forEach((text, index) => {
      const row = instructionsSheet.addRow({ instructions: text });
      row.font = { bold: true, size: 12 }; // Make the text bold and set font size
      row.alignment = { wrapText: true }; // Wrap the text for better readability
    });

    const departmentSheet = workbook.addWorksheet("Departments");
    departmentSheet.columns = [
      { header: "Department ID", key: "id", width: 15 },
      { header: "Department Name", key: "deptName", width: 30 },
    ];
    // departments.forEach((department) => {
    //   departmentSheet.addRow({
    //     id: department.id,
    //     deptName: department.deptName,
    //   });
    // });
    // Populate the Departments sheet
    departments.forEach((department, index) => {
      departmentSheet.addRow({
        id: department.id,
        deptName: department.deptName,
      });
    });

    const positionSheet = workbook.addWorksheet("Positions");
    positionSheet.columns = [
      { header: "Position ID", key: "id", width: 15 },
      { header: "Position Name", key: "name", width: 30 },
    ];
    positions.forEach((position) => {
      positionSheet.addRow({ id: position.id, name: position.positionName });
    });

    // positions.forEach((position, index) => {
    //   positionSheet.addRow({
    //     id: position.id,
    //     positionName: position.positionName,
    //   });
    // });
    const employeeSheet = workbook.addWorksheet("Employees");
    const gradeSheet = workbook.addWorksheet("Grades");
    gradeSheet.columns = [
      // { header: "Grade ID", key: "id", width: 15 },
      { header: "Grade Name", key: "name", width: 20 },
      { header: "minSalary", key: "minSalary", width: 20 },
      { header: "maxSalary", key: "maxSalary", width: 20 },
    ];
    const headerRow = gradeSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 13 };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0070C0" }, // Blue background
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    grades.forEach((grade) => {
      const row = gradeSheet.addRow({
        name: grade.name,
        minSalary: grade.minSalary,
        maxSalary: grade.maxSalary,
      });

      row.eachCell((cell) => {
        cell.font = { bold: true, size: 12 };
        cell.alignment = { vertical: "middle", horizontal: "left" }; // Align content to left
      });
    });

    employeeSheet.columns = [
      { header: "FULL NAME", key: "fullname", width: 30 },
      { header: "SEX", key: "sex", width: 25 },
      {
        header: "DATE OF BIRTH",
        key: "date_of_birth",
        style: { numFmt: "mm/dd/yyyy" },
        width: 20,
      },
      { header: "DEPARTMENT ", key: "DepartmentId", width: 30 },
      { header: "GRADE ", key: "GradeId", width: 30 },
      { header: "MARRIAGE STATUS", key: "marriageStatus", width: 30 },
      { header: "NATIONALITY", key: "nationality", width: 25 },
      { header: "EMAIL", key: "email", width: 30 },
      { header: "ID-TYPE", key: "id_type", width: 30 },
      // { header: "ID TYPE", key: "id_type", width: 20 },
      { header: "ID NUMBER", key: "id_Number", width: 30 },
      { header: "PHONE NUMBER", key: "phoneNumber", width: 30 },
      {
        header: "OPTIONAL PHONE NUMBER",
        key: "optionalPhoneNumber",
        width: 30,
      },
      { header: "COUNTRY", key: "country", width: 30 },
      { header: "STATE", key: "state", width: 30 },
      { header: "ZONE OR CITY", key: "zone_or_city", width: 30 },
      { header: "WOREDA", key: "woreda", width: 30 },
      { header: "KEBELE", key: "kebele", width: 30 },
      { header: "HOUSE NUMBER", key: "houseNumber", width: 25 },
      { header: "EMPLOYEE TIN", key: "employeeTIN", width: 30 },
      { header: "HIRE DATE", key: "hireDate", width: 30 },
      { header: "EMPLOYEE CODE", key: "employee_Code", width: 30 },
      { header: "BASIC SALARY", key: "basicSalary", width: 30 },
      { header: "POSITION", key: "positionId", width: 30 },
      // { header: "SITE LOCATION", key: "siteLocation", width: 15 },
      { header: "EMERGENCY RELATION", key: "emergency_relation", width: 45 },
      {
        header: "EMERGENCY PHONE NUMBER",
        key: "emergency_phoneNumber",
        width: 45,
      },
      { header: "EMERGENCY FULL NAME", key: "emergency_fullname", width: 45 },
      { header: "ACCOUNT NUMBER", key: "accountNumber", width: 45 },
    ];

    // Define your options
    const SEX_LIST = ["Male", "Female"];
    const MARITALSTATUS = ["Single", "Married", "Divorced"];
    const IDTYPE = ["kebele", "passport", "driving License"];
    const departmentNames = departments.map((dept) => dept.deptName);
    const positionNames = positions.map((dept) => dept.positionName);
    const gradeNames = grades.map((dept) => dept.name);
    // Create hidden sheets for options
    const secondSheet = workbook.addWorksheet("SexOptions", { visible: false });
    const maritalStatusSheet = workbook.addWorksheet("maritalstatusOptions", {
      visible: false,
    });
    const idTypeSheet = workbook.addWorksheet("idTypeOptions", {
      visible: false,
    });

    // Populate hidden sheets with options
    SEX_LIST.forEach(
      (value, index) => (secondSheet.getCell(`A${index + 1}`).value = value)
    );
    MARITALSTATUS.forEach(
      (value, index) =>
        (maritalStatusSheet.getCell(`A${index + 1}`).value = value)
    );
    IDTYPE.forEach(
      (value, index) => (idTypeSheet.getCell(`A${index + 1}`).value = value)
    );

    // Apply drop-down validation for columns
    const header = employeeSheet.getRow(1);

    const stateSize = secondSheet.getColumn(1).values.length;
    const maritalStatusSize = maritalStatusSheet.getColumn(1).values.length;
    const idTypeSize = idTypeSheet.getColumn(1).values.length;

    header.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0070C0" },
      };
      cell.font = { color: { argb: "ffffff" }, bold: true, size: 13 };

      if (cell.value === "SEX") {
        for (let i = 2; i <= 100; i++) {
          const sexCell = employeeSheet.getCell(`B${i}`);
          sexCell.dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`SexOptions!$A$1:$A$${stateSize}`],
          };
        }
      }

      for (let row = 2; row <= 100; row++) {
        const departmentCell = employeeSheet.getCell(`D${row}`); // Department column (D)

        departmentCell.dataValidation = {
          type: "list",
          allowBlank: true,
          showDropDown: true,
          formulae: [`"${departmentNames.join(",")}"`],
        };
      }

      ///POSITION

      for (let row = 2; row <= 100; row++) {
        const departmentCell = employeeSheet.getCell(`W${row}`); // Department column (D)

        departmentCell.dataValidation = {
          type: "list",
          allowBlank: true,
          showDropDown: true,
          formulae: [`"${positionNames.join(",")}"`],
        };
      }

      //GRADE
      for (let row = 2; row <= 100; row++) {
        const departmentCell = employeeSheet.getCell(`E${row}`); // Department column (D)

        departmentCell.dataValidation = {
          type: "list",
          allowBlank: true,
          showDropDown: true,
          formulae: [`"${gradeNames.join(",")}"`],
        };
      }
      if (cell.value === "MARRIAGE STATUS") {
        for (let i = 2; i <= 100; i++) {
          const maritalStatusCell = employeeSheet.getCell(`F${i}`);
          maritalStatusCell.dataValidation = {
            type: "list",
            allowBlank: true,
            showDropDown: true,

            formulae: [`maritalstatusOptions!$A$1:$A$${maritalStatusSize}`],
          };
        }
      }

      if (cell.value === "ID-TYPE") {
        for (let i = 2; i <= 100; i++) {
          const idTypeCell = employeeSheet.getCell(`I${i}`);
          idTypeCell.dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`idTypeOptions!$A$1:$A$${idTypeSize}`],
          };
        }
      }
    });

    const dobColumn = employeeSheet.getColumn("C"); // 'C' is for DATE OF BIRTH column

    secondSheet.state = "hidden";
    maritalStatusSheet.state = "hidden";
    idTypeSheet.state = "hidden";
    departmentSheet.state = "hidden";
    positionSheet.state = "hidden";

    header.commit();

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
    // Prepare password and CompanyId
    let password = req?.user?.companyCode?.substring(0, 4) + "0000";
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

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

    const employees = [];
    const employeeRecords = [];
    const employeeDepartmentRecords = [];
    const employeeGradeRecords = [];
    const employeePositionRecords = [];
    const emergencyContactRecords = [];
    const accountInfoRecords = [];

    for (const row of rows) {
      const fullName = row.getCell(1).text.trim();
      const email = row.getCell(8).text.trim();
      const accountNumber = row.getCell(27).text.trim();
      const basicSalary = parseFloat(row.getCell(22).text.trim());

      // Perform validations
      const departmentName = row.getCell(4).text.trim();
      const positionName = row.getCell(23).text.trim();
      const gradeName = row.getCell(5).text.trim();

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

      if (!fullName || !email || !accountNumber) {
        return next(
          createError.createError(
            400,
            "Full name, email, and account number are required fields and cannot be empty."
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
      const hireDateRaw = row.getCell(20).text.trim();
      const hireDate = hireDateRaw
        ? new Date(hireDateRaw).toISOString().slice(0, 10)
        : null;
      const dateOfBirthRaw = row.getCell(3).text.trim();
      const dateOfBirth = dateOfBirthRaw
        ? new Date(dateOfBirthRaw).toISOString().slice(0, 10)
        : null;

      const employeeData = {
        fullname: fullName,
        sex: row.getCell(2).text.trim(),
        date_of_birth: dateOfBirth,
        email,
        accountNumber,
        basicSalary,
        DepartmentId: departmentId,
        PositionId: positionId,
        GradeId: gradeId,
        password, // Assuming password is predefined
        hireDate,
        phoneNumber: "987654",
        isActive: true,
        CompanyId,
      };

      employees.push(employeeData);

      if (!employeeData.phoneNumber) {
        // Handle the case where phoneNumber is missing
        console.error("Phone number is required");
        return res.status(400).json({ message: "Phone number is required" });
      }
      // return res.json(employees)
      employeeDepartmentRecords.push({
        EmployeeId: 1,
        DepartmentId: departmentId,
        active: true,
      });
      employeeGradeRecords.push({
        EmployeeId: 1,
        GradeId: gradeId,
        active: true,
      });
      employeePositionRecords.push({ EmployeeId: 1, PositionId: positionId });
      emergencyContactRecords.push({
        EmployeeId: 1,
        emergency_fullname: row.getCell(26).text.trim(),
        emergency_phoneNumber: row.getCell(25).text.trim(),
      });
      accountInfoRecords.push({
        EmployeeId: 1,
        account_number: accountNumber,
      });
    }

    await sequelize.transaction(async (t) => {
      await Employee.bulkCreate(employees, { transaction: t });
      await EmployeeDepartment.bulkCreate(employeeDepartmentRecords, {
        transaction: t,
      });
      await EmployeeGrade.bulkCreate(employeeGradeRecords, { transaction: t });
      await EmployeePosition.bulkCreate(employeePositionRecords, {
        transaction: t,
      });
      await EmergencyContact.bulkCreate(emergencyContactRecords, {
        transaction: t,
      });
      await AccountInfo.bulkCreate(accountInfoRecords, { transaction: t });

      return res.status(201).json({
        message: "Bulk employee registration completed successfully.",
      });
    });
  } catch (error) {
    console.log(error);
    return next(createError.createError(500, "Internal server error", error));
  }
};

// exports.bulkRegister = async (req, res, next) => {
//   try {
//     // Proceed with employee registration
//     let password = req?.user?.companyCode?.substring(0, 4) + "0000";
//     const CompanyId =
//       req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

//     const excelFile = req?.files?.["file"]?.[0]?.path;

//     if (excelFile == null) {
//       return next(createError.createError(404, "Please upload the file"));
//     }

//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.readFile(excelFile);

//     const worksheet = workbook.getWorksheet("Employees"); // Ensure this matches your template sheet name

//     const employees = [];

//     const departments = await Department.findAll({ where: { CompanyId } });
//     const grades = await Grade.findAll({ where: { CompanyId } });
//     const positions = await Position.findAll({ where: { CompanyId } });

//     // Convert the departments, grades, and positions to arrays of their names for easy checking
//     const departmentNames = departments.map((dept) => dept.name);
//     const gradeNames = grades.map((grade) => grade.name);
//     const positionNames = positions.map((position) => position.name);
//     const rows = [];
//     worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//       if (rowNumber !== 1) rows.push(row); // Skip header row
//     });

//     // Process rows asynchronously
//     await Promise.all(
//       rows.map(async (row) => {
//         const departmentName = row.getCell(4).text.trim();
//         const positionName = row.getCell(23).text.trim();
//         const gradeName = row.getCell(5).text.trim();
//         // Fetch DepartmentId
//         const department = await Department.findOne({
//           where: { deptName: departmentName, CompanyId },
//         });

//         // Fetch PositionId
//         const position = await Position.findOne({
//           where: { positionName: positionName, CompanyId },
//         });

//         const grade = await Grade.findOne({
//           where: { name: gradeName, CompanyId }, // Adjust `name` to your database schema
//         });

//         // Check if any of the required fields are not found
//         if (!department) {
//           return next(
//             createError.createError(
//               400,
//               `Department '${departmentName}' not found.`
//             )
//           );
//         }

//         if (!position) {
//           return next(
//             createError.createError(
//               400,
//               `Position '${positionName}' not found.`
//             )
//           );
//         }

//         if (!grade) {
//           return next(
//             createError.createError(400, `Grade '${gradeName}' not found.`)
//           );
//         }

//         const fullName = row.getCell(1).text.trim(); // Make sure fullName is assigned here
//         const email = row.getCell(8).text.trim();
//         const accountNumber = row.getCell(27).text.trim();
//         const basicSalary = parseFloat(row.getCell(22).text.trim());

//         // Check if the basic salary is within the grade's salary range
//         if (basicSalary < grade.minSalary || basicSalary > grade.maxSalary) {
//           //   return res.status(400).json({
//           //     message: `Basic salary '${basicSalary}' is outside the valid range for grade '${gradeName}'. The salary should be between ${grade.minSalary} and ${grade.maxSalary}.`,
//           //   });

//           return next(
//             createError.createError(
//               400,
//               `Basic salary '${basicSalary}' is outside the valid range for grade '${gradeName}'. The salary should be between ${grade.minSalary} and ${grade.maxSalary}.`
//             )
//           );
//         }

//         // Check if fullName, email, or accountNumber are empty
//         if (!fullName || !email || !accountNumber) {
//           // return res.status(400).json({
//           //   error:
//           //     "Full name, email, and account number are required fields and cannot be empty.",
//           // });

//           return next(
//             createError.createError(
//               400,
//               "Full name, email, and account number are required fields and cannot be empty."
//             )
//           );
//         }

//         // Check if email is unique
//         const existingEmail = await Employee.findOne({ where: { email } });
//         if (existingEmail) {
//           // return res
//           //   .status(400)
//           //   .json({ error: `Email '${email}' is already taken.` });

//           return next(
//             createError.createError(400, "Email '${email}' is already taken.")
//           );
//         }
//         const hireDateRaw = row.getCell(20).text.trim();
//         const hireDate = hireDateRaw
//           ? new Date(hireDateRaw).toISOString().slice(0, 10) // Format as "YYYY-MM-DD"
//           : null;
//         const dateOfBirthRaw = row.getCell(3).text.trim();
//         const dateOfBirth = dateOfBirthRaw
//           ? new Date(dateOfBirthRaw).toISOString().slice(0, 10) // Format as "YYYY-MM-DD"
//           : null;
//         const employeeData = {
//           fullname: row.getCell(1).text.trim(),
//           sex: row.getCell(2).text.trim(),
//           date_of_birth: dateOfBirth,
//           marriageStatus: row.getCell(6).text.trim(),
//           nationality: row.getCell(7).text.trim(),
//           email: row.getCell(8).text.trim(),
//           id_type: row.getCell(9).text.trim(),
//           id_Number: row.getCell(10).text.trim(),
//           phoneNumber: row.getCell(11).text.trim(),
//           optionalPhoneNumber: row.getCell(12).text.trim(),
//           country: row.getCell(13).text.trim(),
//           state: row.getCell(14).text.trim(),
//           zone_or_city: row.getCell(15).text.trim(),
//           woreda: row.getCell(16).text.trim(),
//           kebele: row.getCell(17).text.trim(),
//           houseNumber: row.getCell(18).text.trim(),
//           employeeTIN: row.getCell(19).text.trim(),
//           hireDate,
//           employee_Code: row.getCell(21).text.trim(),
//           basicSalary: row.getCell(22).text.trim(),
//           emergency_relation: row.getCell(24).text.trim(),
//           emergency_phoneNumber: row.getCell(25).text.trim(),
//           emergency_fullname: row.getCell(26).text.trim(),
//           accountNumber: row.getCell(27).text.trim(),
//           DepartmentId: department ? department.id : null,
//           positionId: position ? position.id : null,
//           GradeId: grade ? grade.id : null,
//         };

//         employees.push(employeeData);
//       })
//     );

//     console.log("Employees array after processing rows:", employees);
//     await sequelize.transaction(async (t) => {
//       const imagePath = req?.files?.["basicInfo[image]"]?.[0]?.path || null;
//       const idImagePath =
//         req?.files?.["basicInfo[id_image]"]?.[0]?.path || null;

//       const employeeRecords = []; // Array to collect employee records
//       const employeeDepartmentRecords = []; // Array for EmployeeDepartment records
//       const employeeGradeRecords = []; // Array for EmployeeGrade records
//       const employeePositionRecords = []; // Array for EmployeePosition records
//       const emergencyContactRecords = []; // Array for EmergencyContact records
//       const accountInfoRecords = []; // Array for AccountInfo records

//       // Loop through each employee row for bulk insertion
//       for (const row of rows) {
//         const departmentName = row.getCell(4).text.trim();
//         const positionName = row.getCell(23).text.trim();
//         const gradeName = row.getCell(5).text.trim();

//         // Fetch DepartmentId, PositionId, GradeId (same as your current logic)
//         const department = await Department.findOne({
//           where: { deptName: departmentName, CompanyId },
//         });

//         const position = await Position.findOne({
//           where: { positionName: positionName, CompanyId },
//         });

//         const grade = await Grade.findOne({
//           where: { name: gradeName, CompanyId },
//         });

//         if (!department || !position || !grade) {
//           return res
//             .status(400)
//             .json({ error: "Invalid department, position, or grade." });
//         }

//         const fullName = row.getCell(1).text.trim();
//         const email = row.getCell(8).text.trim();
//         const accountNumber = row.getCell(27).text.trim();
//         const basicSalary = parseFloat(row.getCell(22).text.trim());

//         if (!fullName || !email || !accountNumber) {
//           return res.status(400).json({
//             error:
//               "Full name, email, and account number are required fields and cannot be empty.",
//           });
//         }

//         // Validate uniqueness of email and account number
//         const existingEmail = await Employee.findOne({ where: { email } });
//         // const existingAccountNumber = await Employee.findOne({
//         //   where: { accountNumber },
//         // });

//         if (existingEmail) {
//           return res.status(400).json({
//             error: `Email or account number '${
//               email || accountNumber
//             }' is already taken.`,
//           });
//         }

//         // Prepare employee data for bulk insert
//         const employeeData = {
//           fullname: fullName,
//           email,
//           sex: "male",
//           accountNumber,
//           basicSalary,
//           DepartmentId: department.id,
//           PositionId: position.id,
//           GradeId: grade.id,
//           password, // Assuming password is generated in a loop or predefined.
//           image: imagePath,
//           id_image: idImagePath,
//           isActive: true,
//           CompanyId: Number(req.user.id),
//         };

//         employeeRecords.push(employeeData);
//         employeeDepartmentRecords.push({
//           EmployeeId: 1,
//           DepartmentId: department.id,
//           active: true,
//         });
//         employeeGradeRecords.push({
//           EmployeeId: 1,
//           GradeId: grade.id,
//           active: true,
//         });
//         employeePositionRecords.push({
//           EmployeeId: 1,
//           PositionId: position.id,
//         });
//         emergencyContactRecords.push({
//           EmployeeId: 1,
//           emergency_fullname: row.getCell(26).text.trim(),
//           emergency_phoneNumber: row.getCell(25).text.trim(),
//         });
//         accountInfoRecords.push({
//           EmployeeId: 1,
//           account_number: accountNumber,
//           image: imagePath,
//         });
//       }

//       // Bulk insert data using sequelize.bulkCreate
//       await Employee.bulkCreate(employeeRecords, { transaction: t });
//       await EmployeeDepartment.bulkCreate(employeeDepartmentRecords, {
//         transaction: t,
//       });
//       await EmployeeGrade.bulkCreate(employeeGradeRecords, { transaction: t });
//       await EmployeePosition.bulkCreate(employeePositionRecords, {
//         transaction: t,
//       });
//       await EmergencyContact.bulkCreate(emergencyContactRecords, {
//         transaction: t,
//       });
//       await AccountInfo.bulkCreate(accountInfoRecords, { transaction: t });

//       return res.status(201).json({
//         message: "Bulk employee registration completed successfully.",
//       });
//     });
// return res.json(employees);

//   // Find corresponding department, grade, and position based on the names in the excel sheet
//   const department = departments.find(
//     (dept) => dept.name === employeeData.basicInfo.DepartmentName
//   );
//   const grade = grades.find(
//     (grade) => grade.name === employeeData.basicInfo.GradeName
//   );
//   const position = positions.find(
//     (position) => position.name === employeeData.basicInfo.PositionName
//   );

//   return res.json(employeeData.basicInfo.PositionName)

//   if (!department || !grade || !position) {
//     return next(
//       createError.createError(
//         404,
//         "Department, Grade, or Position not found"
//       )
//     );
//   }

//   // Error handling for missing required fields
//   if (
//     !employeeData.basicInfo?.DepartmentName ||
//     !employeeData.basicInfo?.GradeName ||
//     !employeeData.basicInfo?.PositionName
//   ) {
//     return next(
//       createError.createError(
//         400,
//         "Please provide all required information"
//       )
//     );
//   }

//   if (
//     !employeeData.accountInformation ||
//     employeeData.accountInformation?.[0]?.accountNumber === undefined
//   ) {
//     return next(createError.createError(400, "Account number is required"));
//   }

//   const accountNumbers = employeeData.accountInformation?.map(
//     (acct) => acct.accountNumber
//   );

//   try {
//     // Fetch position, grade, department, employee, account info, and ID format in parallel
//     const [
//       existingPosition,
//       existingGrade,
//       existingDepartment,
//       employee,
//       accountInfos,
//       idformat,
//     ] = await Promise.all([
//       Position.findOne({
//         where: {
//           id: Number(position.id),
//           CompanyId,
//         },
//       }),
//       Grade.findOne({
//         where: { id: Number(grade.id), CompanyId },
//       }),
//       Department.findOne({
//         where: {
//           id: Number(department.id),
//           CompanyId,
//         },
//       }),
//       Employee.findOne({
//         where: { email: employeeData.basicInfo?.email, CompanyId },
//       }),
//       AccountInfo.findAll({
//         where: { accountNumber: accountNumbers, CompanyId },
//       }),
//       IdFormat.findOne({
//         where: { CompanyId, isActive: true },
//       }),
//     ]);

//     const errors = [];

//     return res.json(existingGrade);

//     // Validation checks for position, grade, department, and salary
//     if (!existingPosition) {
//       return next(createError.createError(404, "Position not found"));
//     }
//     if (!existingGrade) {
//       return next(createError.createError(404, "Grade not found"));
//     }
//     if (!existingDepartment) {
//       return next(createError.createError(404, "Department not found"));
//     }
//     if (
//       employeeData.employeeInfo.basicSalary < existingGrade?.minSalary ||
//       employeeData.employeeInfo.basicSalary > existingGrade?.maxSalary
//     ) {
//       return next(
//         createError.createError(
//           404,
//           `Basic salary must be between ${existingGrade.minSalary} and ${existingGrade.maxSalary}`
//         )
//       );
//     }

//     if (employee) {
//       return next(
//         createError.createError(
//           404,
//           "Employee already exists with this email"
//         )
//       );
//     }

//     if (accountInfos.length > 0) {
//       return next(
//         createError.createError(404, "Account number already exists")
//       );
//     }

//     await sequelize.transaction(async (t) => {
//       const newEmployee = await Employee.create(
//         {
//           ...employeeData.basicInfo,
//           password: "defaultPassword", // Use a default password or generate one
//           isActive: true,
//           CompanyId,
//           departmentId: existingDepartment.id,
//           gradeId: existingGrade.id,
//           positionId: existingPosition.id,
//         },
//         { transaction: t }
//       );

//       await Address.create(
//         {
//           ...employeeData.address,
//           EmployeeId: newEmployee.id,
//           isActive: true,
//         },
//         { transaction: t }
//       );
//       await EmployeeInfo.create(
//         {
//           ...employeeData.employeeInfo,
//           EmployeeId: newEmployee.id,
//           isActive: true,
//         },
//         { transaction: t }
//       );
//       await EmergencyContact.bulkCreate(
//         employeeData.emergencyInfo.map((info) => ({
//           ...info,
//           EmployeeId: newEmployee.id,
//           isActive: true,
//         })),
//         { transaction: t }
//       );
//       await AccountInfo.bulkCreate(
//         employeeData.accountInformation.map((info) => ({
//           ...info,
//           EmployeeId: newEmployee.id,
//           isActive: true,
//         })),
//         { transaction: t }
//       );
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Employees registered successfully.",
//     });
//   } catch (err) {
//     console.error("Error processing employee:", err);
//     return next(
//       createError.createError(
//         503,
//         "An error occurred during employee registration."
//       )
//     );
//   }
// });
//   } catch (error) {
//     console.error("Error processing Excel file:", error);
//     return next(
//       createError.createError(
//         503,
//         "An error occurred during bulk registration."
//       )
//     );
//   }
// };

// exports.downloadEmployeeTemplate = async (req, res, next) => {
//   try {
//     const departments = await Department.findAll();
//     const positions = await Position.findAll();
//     const grades = await Grade.findAll();
//     const workbook = new ExcelJS.Workbook();

//     // Employee data sheet
//     const employeeSheet = workbook.addWorksheet("Employees");
//     employeeSheet.columns = [
//       { header: "fullname", key: "fullname", width: 30 },
//       { header: "sex", key: "sex", width: 10 },
//       { header: "date_of_birth", key: "date_of_birth", width: 15 },
//       { header: "DepartmentId", key: "DepartmentId", width: 15 },
//       { header: "GradeId", key: "GradeId", width: 15 },
//       { header: "marriageStatus", key: "marriageStatus", width: 15 },
//       { header: "isActive", key: "isActive", width: 10 },
//       { header: "nationality", key: "nationality", width: 15 },
//       { header: "email", key: "email", width: 30 },
//       { header: "phoneNumber", key: "phoneNumber", width: 20 },
//       { header: "optionalPhoneNumber", key: "optionalPhoneNumber", width: 20 },
//       { header: "id_type", key: "id_type", width: 15 },
//       { header: "id_Number", key: "id_Number", width: 20 },
//       { header: "country", key: "country", width: 15 },
//       { header: "state", key: "state", width: 15 },
//       { header: "zone_or_city", key: "zone_or_city", width: 15 },
//       { header: "woreda", key: "woreda", width: 15 },
//       { header: "kebele", key: "kebele", width: 15 },
//       { header: "houseNumber", key: "houseNumber", width: 15 },
//       { header: "employeeTIN", key: "employeeTIN", width: 20 },
//       { header: "hireDate", key: "hireDate", width: 20 },
//       { header: "employee_Code", key: "employee_Code", width: 20 },
//       { header: "basicSalary", key: "basicSalary", width: 20 },
//       { header: "position", key: "position", width: 15 },
//       { header: "siteLocation", key: "siteLocation", width: 15 },
//       { header: "emergency_relation", key: "emergency_relation", width: 20 },
//       { header: "emergency_phoneNumber", key: "emergency_phoneNumber", width: 20 },
//       { header: "emergency_fullname", key: "emergency_fullname", width: 30 },
//       { header: "accountNumber", key: "accountNumber", width: 30 },
//     ];

//     worksheet.getCell('A1').names = ['thing1', 'thing2'];
//     expect(worksheet.getCell('A1').names).to.have.members(['thing1', 'thing2']);
//       // Apply data validation for the id_type column using dropdown with mapped options
//       employeeSheet.getColumn('id_type').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
//         if (rowNumber === 1) return; // Skip header row
//         cell.dataValidation = {
//           type: 'list',
//           allowBlank: true,
//           formula1: `=INDIRECT("${Object.keys(idTypeOptions).join(',')}")`, // Use INDIRECT for dynamic options
//           showErrorMessage: true,
//           errorTitle: 'Invalid Option',
//           error: 'Please select a valid option',
//         };
//       });
//     // employeeSheet.getColumn('id_type').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
//     //   cell.dataValidation = {
//     //     type: 'list',
//     //     allowBlank: true,
//     //     formula1: '= "driving_license,passport"', // Use formula prefix for Excel
//     //     showErrorMessage: true,
//     //     errorTitle: 'Invalid Option',
//     //     error: 'Please select a valid option',
//     //   };
//     // });

//     // Apply date format for the date_of_birth column
//     employeeSheet.getColumn('date_of_birth').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
//       if (rowNumber === 1) return; // Skip header row
//       cell.numFmt = 'mm/dd/yyyy'; // Apply date format
//       cell.dataValidation = {
//         type: 'date',
//         operator: 'greaterThan',
//         formula1: '1900-01-01', // Date must be after this date
//         showErrorMessage: true,
//         errorTitle: 'Invalid Date',
//         error: 'Please enter a valid date',
//       };
//     });

//     // Department data sheet
//     const departmentSheet = workbook.addWorksheet("Departments");
//     departmentSheet.columns = [
//       { header: "Department ID", key: "id", width: 15 },
//       { header: "Department Name", key: "deptName", width: 30 },
//     ];
//     departments.forEach((department) => {
//       departmentSheet.addRow({
//         id: department.id,
//         deptName: department.deptName,
//       });
//     });

//     // Position data sheet
//     const positionSheet = workbook.addWorksheet("Positions");
//     positionSheet.columns = [
//       { header: "Position ID", key: "id", width: 15 },
//       { header: "Position Name", key: "name", width: 30 },
//     ];
//     positions.forEach((position) => {
//       positionSheet.addRow({ id: position.id, name: position.positionName });
//     });

//     // Grade data sheet
//     const gradeSheet = workbook.addWorksheet("Grades");
//     gradeSheet.columns = [
//       { header: "Grade ID", key: "id", width: 15 },
//       { header: "Grade Name", key: "name", width: 20 },
//       { header: "minSalary", key: "minSalary", width: 20 },
//       { header: "maxSalary", key: "maxSalary", width: 20 },
//     ];
//     grades.forEach((grade) => {
//       gradeSheet.addRow({
//         id: grade.id,
//         name: grade.name,
//         minSalary: grade.minSalary,
//         maxSalary: grade.maxSalary,
//       });
//     });

//     // Set the response content type
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=employee_template.xlsx"
//     );

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("Error generating template:", error);
//     next(createError.createError(503, "Internal Server Error"));
//   }
// };

// exports.downloadEmployeeTemplate = async (req, res, next) => {
//   try {
//     const departments = await Department.findAll();
//     const positions = await Position.findAll();
//     const grades = await Grade.findAll();
//     const workbook = new ExcelJS.Workbook();

//     // Employee data sheet
//     const employeeSheet = workbook.addWorksheet("Employees");

//     // Add department, grade, and position lists at the top
//     employeeSheet.mergeCells("A1:B1");
//     employeeSheet.getCell("A1").value = "Departments:";
//     let departmentStartRow = 2;
//     departments.forEach((department, index) => {
//       employeeSheet.getCell(`A${departmentStartRow + index}`).value =
//         department.id;
//       employeeSheet.getCell(`B${departmentStartRow + index}`).value =
//         department.deptName;
//     });

//     let gradeStartRow = departmentStartRow + departments.length + 1;
//     employeeSheet.mergeCells(`A${gradeStartRow}:C${gradeStartRow}`);
//     employeeSheet.getCell(`A${gradeStartRow}`).value = "Grades:";

//     // Adding titles for GradeId and GradeName under Grades section
//     employeeSheet.getCell(`A${gradeStartRow + 1}`).value = "GRADEid";
//     employeeSheet.getCell(`B${gradeStartRow + 1}`).value = "GRADEname";
//     employeeSheet.getCell(`C${gradeStartRow + 1}`).value = "Salary Range";

//     grades.forEach((grade, index) => {
//       employeeSheet.getCell(`A${gradeStartRow + 2 + index}`).value = grade.id;
//       employeeSheet.getCell(`B${gradeStartRow + 2 + index}`).value = grade.name;
//       employeeSheet.getCell(
//         `C${gradeStartRow + 2 + index}`
//       ).value = `${grade.minSalary} - ${grade.maxSalary}`;
//     });

//     let positionStartRow = gradeStartRow + grades.length + 2;
//     employeeSheet.mergeCells(`A${positionStartRow}:B${positionStartRow}`);
//     employeeSheet.getCell(`A${positionStartRow}`).value = "Positions:";

//     positions.forEach((position, index) => {
//       employeeSheet.getCell(`A${positionStartRow + 1 + index}`).value =
//         position.id;
//       employeeSheet.getCell(`B${positionStartRow + 1 + index}`).value =
//         position.positionName;
//     });

//     // Leave a blank row between lists and the employee table
//     let employeeTableStartRow = positionStartRow + positions.length + 2;

//     // Set up employee data table headers
//     employeeSheet.columns = [
//       { header: "fullname", key: "fullname", width: 30 },
//       { header: "sex", key: "sex", width: 10 },
//       { header: "date_of_birth", key: "date_of_birth", width: 15 },
//       { header: "DepartmentId", key: "DepartmentId", width: 15 },
//       { header: "GradeId", key: "GradeId", width: 15 },
//       { header: "position", key: "position", width: 15 },
//       // Add more columns as needed
//     ];

//     // // Adjust the table header row
//     employeeSheet.spliceRows(
//       employeeTableStartRow,
//       0,
//       employeeSheet.columns.map((col) => col.header)
//     );

//     // Apply data validation for DepartmentId, GradeId, and Position columns
//     const dropdownRange = (startRow, endRow, colIndex) =>
//       `$${String.fromCharCode(64 + colIndex)}${startRow}:$${String.fromCharCode(
//         64 + colIndex
//       )}${endRow}`;

//     employeeSheet
//       .getColumn("DepartmentId")
//       .eachCell({ includeEmpty: true }, (cell, rowNumber) => {
//         if (rowNumber >= employeeTableStartRow) {
//           cell.dataValidation = {
//             type: "list",
//             allowBlank: true,
//             formula1: dropdownRange(2, 2 + departments.length - 1, 1),
//             showErrorMessage: true,
//             errorTitle: "Invalid Option",
//             error: "Please select a valid Department ID.",
//           };
//         }
//       });

//     employeeSheet
//       .getColumn("GradeId")
//       .eachCell({ includeEmpty: true }, (cell, rowNumber) => {
//         if (rowNumber >= employeeTableStartRow) {
//           cell.dataValidation = {
//             type: "list",
//             allowBlank: true,
//             formula1: dropdownRange(
//               gradeStartRow + 1,
//               gradeStartRow + grades.length,
//               1
//             ),
//             showErrorMessage: true,
//             errorTitle: "Invalid Option",
//             error: "Please select a valid Grade ID.",
//           };
//         }
//       });

//     employeeSheet
//       .getColumn("position")
//       .eachCell({ includeEmpty: true }, (cell, rowNumber) => {
//         if (rowNumber >= employeeTableStartRow) {
//           cell.dataValidation = {
//             type: "list",
//             allowBlank: true,
//             formula1: dropdownRange(
//               positionStartRow + 1,
//               positionStartRow + positions.length,
//               1
//             ),
//             showErrorMessage: true,
//             errorTitle: "Invalid Option",
//             error: "Please select a valid Position ID.",
//           };
//         }
//       });

//     // Set the response content type
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=employee_template.xlsx"
//     );

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("Error generating template:", error);
//     next(createError.createError(503, "Internal Server Error"));
//   }
// };
