const Employee = require("../models/employee.js");
const EmployeeInfo = require("../models/employeInfo.js");
const EmergencyContact = require("../models/emergency_Contact.js");
const Address = require("../models/address.js");
const Department = require("../models/department.js");
const Grade = require("../models/grade.js");
const Company = require("../models/company.js");
const AccountInfo = require("../models/accountInfo.js");
const IdFormat = require("../models/companyIdFormat.js");
const CustomRole=require("../models/customRole.js")
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
        Company,
        CustomRole,
      ],
    });
    res.status(200).json({
      count: Employees.length,
      Employees,
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

// exports.createEmployee = async (req, res, next) => {
//   try {
//     const {
//       address,
//       employeeInfo,
//       emergencyInfo,
//       basicInfo,
//       accountInformation,
//     } = req.body;
//     let password = req.user.companyCode.substring(0, 4) + "0000";

//     if (!basicInfo?.DepartmentId) {
//       res.status(404).json("There is no department");
//     } else if (!basicInfo?.GradeId) {
//       res.status(404).json("There is no Grade");
//     } else {
//       const gradeId = await Grade.findByPk(Number(basicInfo?.GradeId));
//       const departmentId = await Department.findByPk(
//         Number(basicInfo?.DepartmentId)
//       );

//       if (!gradeId) {
//         res.status(404).json("There is no Grade with this ID");
//       } else if (!departmentId) {
//         res.status(404).json("There is no Department with this ID");
//       } else if (
//         employeeInfo.basicSalary < gradeId.minSalary ||
//         employeeInfo.basicSalary > gradeId.maxSalary
//       ) {
//         res
//           .status(404)
//           .json(
//             `Basic SALARY must be between  ${gradeId.minSalary} and  ${gradeId.maxSalary}`
//           );
//       } else {
//         const address1 = await Address.create(address);
//         const employeeInfo1 = await EmployeeInfo.create(employeeInfo);

//         // employeeID

//         // const company = await IdFormat.findByPk{where: } (Number(req.user.id));

//         const idFormat = await IdFormat.findOne({
//           where: { companyId: Number(req.user.id), isActive: true },
//         });

//         if (!idFormat)
//           return res.status(400).json({ error: "define Id Format first" });

//         const formatElements = idFormat.order.split(",");
//         // Find the last created employee
//         const lastEmployee = await Employee.findOne({
//           order: [["createdAt", "DESC"]],
//         });
//         let paddedEmployeeCode = "00001"; // Default value if no previous employee exists

//         if (lastEmployee) {
//           const lastEmployeeId = lastEmployee.id_number;
//           // Extract the employee code from the last employee's employeeId
//           let lastEmployeeCode = lastEmployeeId.split(idFormat.separator);
//           lastEmployeeCode = lastEmployeeCode[lastEmployeeCode.length - 1];
//           // Parse the employee code as an integer and increment it by one
//           const incrementedEmployeeCode = parseInt(lastEmployeeCode, 10) + 1;

//           // Pad the incremented employee code with leading zeros
//           paddedEmployeeCode = incrementedEmployeeCode
//             .toString()
//             .padStart(5, "0");
//         }
//         // Build the employee ID based on the format elements and separator
//         let employeeId = "";
//         for (let i = 0; i < formatElements.length; i++) {
//           const element = formatElements[i];
//           switch (element) {
//             case "companyCode":
//               employeeId += idFormat.companyCode;
//               break;
//             case "year":
//               employeeId += employeeInfo.hireDate.split("-")[0];
//               break;
//             case "department":
//               employeeId += departmentId.shorthandRepresentation;
//               break;
//           }

//           // Add the separator between format elements (except for the last element)
//           if (i !== formatElements.length - 1) {
//             employeeId += idFormat.separator;
//           }
//         }
//         // Append the padded employee code to the employee ID
//         employeeId += idFormat.separator + paddedEmployeeCode;

//         const basicInfo1 = await Employee.create({
//           ...basicInfo,
//           password,
//           id_number: employeeId,
//         });

//         //add ADDRESS TO EMPLOYEE
//         await basicInfo1.setAddress(address1);
//         await basicInfo1.setEmployeeInfo(employeeInfo1);
//         await basicInfo1.setDepartment(Number(basicInfo.DepartmentId));
//         await basicInfo1.setGrade(Number(basicInfo.GradeId));
//         await basicInfo1.setCompany(Number(req.user.id));
//         //const emergencyInfo1 = await EmergencyContact.create(emergencyInfo);
//         // console.log("employeeInfo1", basicInfo1);

//         const emergencies = await Promise.all(
//           emergencyInfo.map((emer) => EmergencyContact.create(emer))
//         );
//         const accountinfos = await Promise.all(
//           accountInformation.map((emer) => AccountInfo.create(emer))
//         );

//         // console.log("first", accountInformation);

//         const ss = await Promise.all(
//           emergencies.map((emer) => emer.setEmployee(basicInfo1))
//         );

//         const acc_info = await Promise.all(
//           accountinfos.map((emer) => emer.setEmployee(basicInfo1))
//         );

//         res.status(200).json({
//           message: "Successfully Registered",
//           basicInfo1,
//         });
//       }
//     }
//   } catch (error) {
//     // console.log("first", error);
//     if (error.name === "SequelizeValidationError") {
//       const errors = {};
//       error.errors.forEach((err) => {
//         errors[err.path] = [`${err.path} is required`];
//       });

//       return res.status(400).json(errors);
//     } else if (error.name === "SequelizeUniqueConstraintError") {
//       const errors = {};
//       error.errors.forEach((err) => {
//         errors[err.path] = [`${err.path} must be unique`];
//       });

//       return res.status(400).json(errors);
//     } else {
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   }
// };

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

    if (!basicInfo?.DepartmentId) {
      return res.status(404).json("There is no department");
    } else if (!basicInfo?.GradeId) {
      return res.status(404).json("There is no Grade");
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

    const idFormat = await IdFormat.findOne({
      where: { companyId: Number(req.user.id), isActive: true },
    });

    if (!idFormat) {
      return res.status(400).json({ error: "Define Id Format first" });
    }

    const formatElements = idFormat.order.split(",");
    const lastEmployee = await Employee.findOne({
      order: [["createdAt", "DESC"]],
    });
    let paddedEmployeeCode = "00001";

    if (lastEmployee) {
      const lastEmployeeId = lastEmployee.id_number;
      let lastEmployeeCode = lastEmployeeId.split(idFormat.separator);
      lastEmployeeCode = lastEmployeeCode[lastEmployeeCode.length - 1];
      const incrementedEmployeeCode = parseInt(lastEmployeeCode, 10) + 1;
      paddedEmployeeCode = incrementedEmployeeCode.toString().padStart(5, "0");
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
      id_number: employeeId,
    });

    await basicInfo1.setAddress(address1);
    await basicInfo1.setEmployeeInfo(employeeInfo1);
    await basicInfo1.setDepartment(Number(basicInfo.DepartmentId));
    await basicInfo1.setGrade(Number(basicInfo.GradeId));
    await basicInfo1.setCompany(Number(req.user.id));

    const emergencies = await Promise.all(
      emergencyInfo.map((emer) => EmergencyContact.create(emer))
    );
    const accountinfos = await Promise.all(
      accountInformation.map((emer) => AccountInfo.create(emer))
    );

    const ss = await Promise.all(
      emergencies.map((emer) => emer.setEmployee(basicInfo1))
    );

    const acc_info = await Promise.all(
      accountinfos.map((emer) => emer.setEmployee(basicInfo1))
    );

    res.status(200).json({
      message: "Successfully Registered",
      basicInfo1,
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
