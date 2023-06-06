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
      employeeInfo.basicSalary < grade.minSalary ||
      employeeInfo.basicSalary > grade.maxSalary
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
      return res.status(400).json(errors);
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
          await employeeInfo.update({ isActive: false }, { transaction });
        }

        const newEmployeeInfo = await EmployeeInfo.create(
          {
            isActive: true,
            EmployeeId: Number(employee.id),
            basicSalary,
            position: employeeInfo.position,
            employement_Type: employeeInfo.employement_Type,
            employeeTIN: employeeInfo.employeeTIN,
            hireDate: employeeInfo.hireDate,
          },
          { transaction }
        );
      }
    }

    if (position) {
      const employeeInfo = await EmployeeInfo.findOne({
        where: { EmployeeId: Number(employee.id), isActive: true },
      });
      if (employeeInfo) {
        await employeeInfo.update({ isActive: false }, { transaction });
      }
      const newEmployeeInfo = await EmployeeInfo.create(
        {
          isActive: true,
          EmployeeId: Number(employee.id),
          position,
          employement_Type: employee.employement_Type,
          employeeTIN: employee.employeeTIN,
          basicSalary: employee.basicSalary,
        },
        { transaction }
      );
    }

    if (DepartmentId) {
      department = await Department.findByPk(Number(DepartmentId));
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

    const updateEmployee = await employee.update(
      { image: imagePath, id_image: idImagePath },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      message: "Employee fields updated successfully.",
      oldEmployee: updateEmployee,
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
      return res.status(400).json(errors);
    }
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllEmployee = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      where: { CompanyId: Number(req.user.id) },
      exclude: ["password"],
    });
    return res.status(200).json({ count: employees.length, employees });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "there is a problem fetching employees" });
  }
};
