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

exports.createEmployee = async (req, res) => {
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

      const URL = "https://payroll-production.up.railway.app";
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

exports.updateEmployee = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { basicSalary, position, DepartmentId, GradeId, employement_Type } =
      req.body;

    console.log("GradeID ", GradeId);

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
    let department, grade;

    if (basicSalary) {
      console.log("basicsalary", basicSalary);
      if (
        basicSalary < employee.Grades[0]?.minSalary ||
        basicSalary > employee.Grades[0]?.maxSalary
      ) {
        errors.push({
          error: `Basic salary must be between ${employee.Grades[0]?.minSalary} and ${employee.Grades[0]?.maxSalary}`,
        });
      } else {
        const employeeInfo = await EmployeeInfo.findOne({
          where: { EmployeeId: Number(employee.id), isActive: true },
        });
        if (employeeInfo) {
          const updatedData = await employeeInfo.update(
            { isActive: false },
            { transaction }
          );
        }
        // console.log("department",DepartmentId)
        const newEmployeeInfo = await EmployeeInfo.create(
          {
            isActive: true,
            EmployeeId: Number(employee.id),
            basicSalary,
            position: employeeInfo?.position,
            employement_Type: employeeInfo?.employement_Type,
            employeeTIN: employeeInfo?.employeeTIN,
            hireDate: employeeInfo?.hireDate,
          },
          { transaction }
        );

        // newEmployeeInfo.save();
      }
    }

    if (position) {
      const employeeInfo = await EmployeeInfo.findOne({
        where: { EmployeeId: Number(employee.id), isActive: true },
      });
      console.log("employee", employeeInfo.basicSalary);
      if (employeeInfo) {
        await employeeInfo.update({ isActive: false }, { transaction });
      }
      const newEmployeeInfo = await EmployeeInfo.create(
        {
          isActive: true,
          EmployeeId: Number(employee.id),
          position,
          employement_Type: employeeInfo.employement_Type,
          employeeTIN: employeeInfo.employeeTIN,
          basicSalary: employeeInfo.basicSalary,
        },
        { transaction }
      );
    }

    if (DepartmentId) {
      department = await Department.findByPk(Number(DepartmentId));
      console.log("new department", department);
      if (!department) {
        errors.push("Department does not exist.");
      }
    }

    if (GradeId) {
      grade = await Grade.findByPk(Number(GradeId));
      if (!grade) {
        errors.push("Grade does not exist.");
      }
    }

    if (errors.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ errors });
    }

    // console.log("employee files", req.files);

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
      console.log("joint data", jointData);

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
    await transaction.rollback();
    console.error(error);
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = error.errors.reduce((acc, err) => {
        acc[err.path] = [`${err.path} is required`];
        return acc;
      }, {});
      return res.status(404).json({ message: errors });
    }
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllEmployee = async (req, res) => {
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
            // where: {
            //   active: true,
            // },
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
    return res
      .status(500)
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
  } catch (error) {
    console.log("error", error);
  }
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
    console.log("reqw.body", req.body);
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
        ],
      },
      {
        transaction,
      }
    );
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    if (gradeId) {
      if (basicSalary) {
        const grade = await Grade.findByPk(Number(gradeId));
        if (basicSalary < grade.minSalary || basicSalary > grade.maxSalary) {
          return res.status(409).json({
            error: `Basic salary must be between ${grade.minSalary} and ${grade.maxSalary}`,
          });
        }

        const employeeInfo = await EmployeeInfo.findOne({
          where: { EmployeeId: Number(employee.id), isActive: true },
        });
        if (employeeInfo) {
          const updatedData = await employeeInfo.update(
            { isActive: false },
            { transaction }
          );
        }
        // console.log("department",DepartmentId)
        const newEmployeeInfo = await EmployeeInfo.create(
          {
            isActive: true,
            EmployeeId: Number(employee.id),
            basicSalary,
            position: position ? position : employeeInfo?.position,
            employement_Type: employement_Type
              ? employement_Type
              : employeeInfo?.employement_Type,
            employeeTIN: employeeInfo?.employeeTIN,
            hireDate: employeeInfo?.hireDate,
          },
          { transaction }
        );

        newEmployeeInfo.save();
      } else {
        console.log("no basicSalary");

        const employeeInfo = await EmployeeInfo.findOne({
          where: { EmployeeId: Number(employee.id), isActive: true },
        });
        if (employeeInfo) {
          const updatedData = await employeeInfo.update(
            { isActive: false },
            { transaction }
          );
        }
        // console.log("department",DepartmentId)
        const newEmployeeInfo = await EmployeeInfo.create(
          {
            isActive: true,
            EmployeeId: Number(employee.id),
            position: position ? position : employeeInfo?.position,
            employement_Type: employement_Type
              ? employement_Type
              : employeeInfo?.employement_Type,
            employeeTIN: employeeInfo?.employeeTIN,
            hireDate: employeeInfo?.hireDate,
          },
          { transaction }
        );

        newEmployeeInfo.save();
      }
    } else {
      if (basicSalary) {
        console.log("basicSalary", employee.Grades[0]);
        if (
          basicSalary < employee.Grades[0]?.minSalary ||
          basicSalary > employee.Grades[0]?.maxSalary
        )
          return res.status(404).json({
            error: `Basic salary must be between ${employee.Grades[0]?.minSalary} and ${employee.Grades[0]?.maxSalary}`,
          });
        const employeeInfo = await EmployeeInfo.findOne({
          where: { EmployeeId: Number(employee.id), isActive: true },
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
            EmployeeId: Number(employee.id),
            basicSalary,
            position: position ? position : employeeInfo?.position,
            employement_Type: employement_Type
              ? employement_Type
              : employeeInfo?.employement_Type,
            employeeTIN: employeeInfo?.employeeTIN,
            hireDate: employeeInfo?.hireDate,
          },
          { transaction }
        );

        newEmployeeInfo.save();
      } else {
        const employeeInfo = await EmployeeInfo.findOne({
          where: { EmployeeId: Number(employee.id), isActive: true },
        });
        if (employeeInfo) {
          const updatedData = await employeeInfo.update(
            { isActive: false },
            { transaction }
          );
        }
        // console.log("department",DepartmentId)
        const newEmployeeInfo = await EmployeeInfo.create(
          {
            isActive: true,
            EmployeeId: Number(employee.id),
            position: position ? position : employeeInfo?.position,
            employement_Type: employement_Type
              ? employement_Type
              : employeeInfo?.employement_Type,
            employeeTIN: employeeInfo?.employeeTIN,
            hireDate: employeeInfo?.hireDate,
          },
          { transaction }
        );

        newEmployeeInfo.save();
      }
    }
    await transaction.commit();

    //  if (basicSalary) {
    //    console.log("basicsalary", basicSalary);
    //    if (
    //      basicSalary < employee.Grades[0]?.minSalary ||
    //      basicSalary > employee.Grades[0]?.maxSalary
    //    ) {
    //      errors.push({
    //        error: `Basic salary must be between ${employee.Grades[0]?.minSalary} and ${employee.Grades[0]?.maxSalary}`,
    //      });
    //    } else {

    //  if (position) {
    //    const employeeInfo = await EmployeeInfo.findOne({
    //      where: { EmployeeId: Number(employee.id), isActive: true },
    //    });
    //    console.log("employee", employeeInfo.basicSalary);
    //    if (employeeInfo) {
    //      await employeeInfo.update({ isActive: false }, { transaction });
    //    }
    //    const newEmployeeInfo = await EmployeeInfo.create(
    //      {
    //        isActive: true,
    //        EmployeeId: Number(employee.id),
    //        position,
    //        employement_Type: employeeInfo.employement_Type,
    //        employeeTIN: employeeInfo.employeeTIN,
    //        basicSalary: employeeInfo.basicSalary,
    //      },
    //      { transaction }
    //    );
    //  }

    //  if (DepartmentId) {
    //    department = await Department.findByPk(Number(DepartmentId));
    //    console.log("new department", department);
    //    if (!department) {
    //      errors.push("Department does not exist.");
    //    }
    //  }

    //  if (GradeId) {
    //    grade = await Grade.findByPk(Number(GradeId));
    //    if (!grade) {
    //      errors.push("Grade does not exist.");
    //    }
    //  }

    //  if (errors.length > 0) {
    //    await transaction.rollback();
    //    return res.status(400).json({ errors });
    //  }

    //  // console.log("employee files", req.files);

    //  const imagePath = req.files?.["image"]
    //    ? req.files?.["image"]?.[0]?.path
    //    : employee.image;
    //  const idImagePath = req.files?.["id_image"]
    //    ? req.files?.["id_image"]?.[0]?.path
    //    : employee.id_image;

    //  if (department) {
    //    const jointData = await EmployeeDepartment.findOne({
    //      where: { EmployeeId: employee.id, active: true },
    //    });
    //    console.log("joint data", jointData);

    //    if (jointData) {
    //      await jointData.update({ active: false }, { transaction });
    //    }

    //    const createdJointData = await EmployeeDepartment.create(
    //      {
    //        active: true,
    //        EmployeeId: employee.id,
    //        DepartmentId: department.id,
    //      },
    //      {
    //        transaction,
    //      }
    //    );
    //  }

    //  if (grade) {

    //  }

    //  // const updateEmployee = await employee.update(
    //  //   { image: imagePath, id_image: idImagePath },
    //  //   { transaction }
    //  // );

    //  await transaction.commit();
    //////////////////////
    return res.status(200).json({
      message: "Employee fields updated successfully.",
      // oldEmployee: updateEmployee,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    next(error);
  }
};
