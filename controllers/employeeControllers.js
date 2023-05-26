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
const DeductionDefinition = require("../models/deductionDefinition.js");
const Deduction = require("../models/deduction.js");
const multer = require("multer");
// Define controller methods for handling User requests
exports.getAllEmployee = async (req, res) => {
  try {
    const Employees = await Employee.findAll({
      where: { companyId: req.user.id },
      include: [
        {
          model: Address,
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
        include: {
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

//Import from Excel
const xlsx = require("xlsx");

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


          console.log("first",basicInfo.GradeId)
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
    }
  });
};
