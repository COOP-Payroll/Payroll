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
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
    const employee = await Employee.findByPk(id);
    res.json({ employee });
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


     const { file } = req;
 

    let password = req.user.companyCode.substring(0, 4) + "0000";
    const conflicts = [];
    const createdAccountInfos = [];

 const existingEmail = await Employee.findOne({
   where: {
     email: basicInfo.email,
   },
 });
 
const accountData=[];

 for(const ai of accountInformation){
accountData.push(ai)
 }


 for (const account of accountData) {
  
   const existingAccount = await AccountInfo.findOne({
     where: { accountNumber: account.accountNumber },
   });
   if (!existingAccount) {
 
   }
   else{
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

    employeeId += idFormat.separator + paddedEmployeeCode;
let basicInfo1;
 if (file) {
   const { path } = file;
  //  company = await Company.create({ ...companyData, companyLogo: path });

       basicInfo1 = await Employee.create({
        ...basicInfo,
        password,
        images:path,
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
    console.log("departmentId", departmentId);
    if (departmentId != 0) {
      const Employees = await Employee.findAll({
        where: { companyId: req.user.id, DepartmentId: departmentId },
        include: {
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
      });

      res.status(200).json({
        count: Employees.length,
        Employees,
      });
    } else if (departmentId == 0) {
      const Employees = await Employee.findAll({
        where: { companyId: req.user.id },
        include: [
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
const Permission = require("../models/permission.js");

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
    const { email, password, companyCode } = req.body;

    //check if email and password exist company code
    if (!email || !password || !companyCode) {
      return res
        .status(404)
        .json({ error: "please provide email, password or companycode" });
    }
    //check if user exists and password is correct
    const user = await Employee.findOne({
      where: { email: email },
      include: { model: Company, where: { companyCode: companyCode } },
    });
    console.log("user", user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Incorrect email, password" });
      //next(createError.createError(401,'Incorrect email, password or company Code'))
    } else {
      // console.log("first",res)
      return createSendToken(user, 200, res);
    }
  } catch (error) {
    console.log("Error",error)
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
      return res.status(500).json({ error: "Internal server error" ,
          user:user
        });
    }
  }
};
exports.addAddionalPay = async (req, res, next) => {
  try {
    const updates = req.body;
    const { id } = req.params.id;
    console.log("first",updates)

      const employee = await Employee.findAll({where:{id:req.params.id,companyId:req.user.id}});

    //  console.log("first", employee);
    if (employee) {
  const result = await employee.update({acting:100});

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
