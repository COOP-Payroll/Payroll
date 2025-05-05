const Grade = require("../models/grade.js");
const DeductionDefinition = require("../models/deductionDefinition.js");
const { Op } = require("sequelize");
const sequelize = require("../database/db");
const { Sequelize } = require("sequelize");
const Pension = require("../models/pension");
const ProvidentFund = require("../models/providentFund.js");
const Taxslab = require("../models/taxslab");
const Employee = require("../models/employee");
const Loan = require("../models/loan");
const Allowance = require("../models/allowance");
const Deduction = require("../models/deduction");
const AllowanceDefinition = require("../models/allowanceDefinition");
const AdditionalAllowances = require("../models/additionalAllowance");
const Payroll = require("../models/Payroll");
const EmployeeInfo = require("../models/employeInfo");
const AdditionalAllowanceDefinition = require("../models/additionalAllowanceDefinition");
const AdditionalDeduction = require("../models/additionalDeduction");
const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition");
const AdditionalPayDefinition = require("../models/additionalPayDefinition.js");
const AdditionalPay = require("../models/additionalPay.js");
const PayrollDefinition = require("../models/payrollDefinition");
const EmployeeGrade = require("../models/EmployeeGrade");
const { run } = require("../utils/checkSubscriptionPlan.js");
const { child } = require("winston");
const { error } = require("shelljs");
const AccountInfo = require("../models/accountInfo.js");
const createError = require("../utils/error.js");
const Approver = require("../models/approver.js");
const ApprovalMethod = require("../models/approvalMethod.js");
const EmployeePayrollApprovement = require("../models/employeePayrollApprovement.js");
const Company = require("../models/company.js");
const Position = require("../models/position.js");
const EmployeePosition = require("../models/employeePosition.js");
const Department = require("../models/department.js");
const EmployeeDepartment = require("../models/EmployeeDepartment.js");
const Projects = require("../models/projects.js");
const ProjectEmployee = require("../models/project-employee.js");
const Sponsor = require("../models/sponsor.js");
const CustomRole = require("../models/customRole.js");
const Permission = require("../models/permission.js");
const OTPayment = require("../models/otPayModel.js");
const TransactionHistory = require("../models/transactionHistory.js");
const XLSX = require("xlsx");
const ExcelJS = require("exceljs");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
exports.createPayroll1 = async (req, res, next) => {
  try {
    const isProjectBased = req.user.isProjectBased;
    const { payrollDefinitionId, employeeIds } = req.body;

    const employeeID = employeeIds.map((id) => parseInt(id));
    const payrolldef = await PayrollDefinition.findByPk(payrollDefinitionId);
    const company = req.user.id;

    // return res.json(req.user.isProjectBased)
    if (!payrolldef) {
      return res.status(404).json({ message: "payroll is not defined" });
    }

    const employees = await Employee.findAll({
      where: {
        id: employeeID,
      },
    });
    const existingEmployeeIds = employees.map((employee) => employee.id);

    const nonExistingEmployeeIds = employeeID.filter(
      (id) => !existingEmployeeIds.includes(id)
    );

    if (nonExistingEmployeeIds.length > 0) {
      return res.status(404).json({
        message: "Some Employee not found",
        employees: nonExistingEmployeeIds,
      });
    }
    const errors = [];

    const existingPayrolls = await Payroll.findAll({
      where: {
        EmployeeId: {
          [Op.in]: employeeIds, // Use Op.in to match any employee in the employeeIds array
        },
        PayrollDefinitionId: payrollDefinitionId,
      },
    });

    if (existingPayrolls.length > 0) {
      return next(
        createError.createError(
          400,
          "Payroll has already been run for one or more employees."
        )
      );
    }
    if (isProjectBased) {
      const isTotalPercentEqual100 = employees.every(
        (employee) => employee?.totalPercent === 100
      );
      if (!isTotalPercentEqual100) {
        return next(
          createError.createError(
            400,
            "Some employees have not been fully assigned projects. Please ensure all employees are assigned projects totaling 100%."
          )
        );
      }

      const payroll = await Payroll.findOne({
        where: {
          EmployeeId: employeeID,
          PayrollDefinitionId: payrollDefinitionId,
        },
      });

      if (payroll != null) {
        // return res.json("data")
        return next(
          createError.createError(
            400,
            "Payroll has already been run for one or more employees1."
          )
        );
      }
      for (const employeeId of employeeID) {
        try {
          const resp = await runForProjectBasedPayroll(req, res, {
            employeeId,
            company,
            payrollDefinitionId,
          });
        } catch (error) {
          errors.push(error);
        }
      }
    }
    if (!isProjectBased) {
      return res.json("dfankfnjasndjf");
      let payrollCount = 0;
      await payrolldef.update({ status: "ordered" });
      for (const employeeId of employeeID) {
        try {
          // const payroll = await Payroll.findOne({
          //   where: {
          //     EmployeeId: employeeID,
          //     PayrollDefinitionId: payrollDefinitionId,
          //   },
          // });

          // if (payroll != null) {
          //   // return res.json("data")
          //   return next(
          //     createError.createError(
          //       400,
          //       "Payroll has already been run for one or more employees."
          //     )
          //   );
          // }

          const resp = await runPayroll(req, res, next, {
            employeeId,
            company,
            payrollDefinitionId,
          });
        } catch (error) {
          errors.push(error);
        }
      }

      if (errors.length > 0) {
        return next(createError(503, "There is a problem creating payroll "));
      }
      ///
      // // Update total payroll count in the database
      // payrolldef.totalNoOfEmployee =
      //   Number(payrolldef.totalNoOfEmployee) + Number(payrollCount);
      // await payrolldef.save();
    }

    return res.status(201).json({ message: "Payroll created successfully!  " });
  } catch (error) {
    console.log(error);

    return next(
      createError.createError(503, "Error occurred while creating payroll ")
    );
    // return res
    //   .status(503)
    //   .json({ message: "Error occurred while creating payroll:" });
  }
};

exports.getPayrollByPayrollDefId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const payrollDef = await PayrollDefinition.findOne({
      where: {
        id: id,
        CompanyId,
      },
    });
    if (!payrollDef)
      return res.status(404).json({ message: "Payroll not found" });
    const payrolls = await Payroll.findAll({
      where: { PayrollDefinitionId: id, CompanyId },
      include: [{ model: Employee }, PayrollDefinition],
    });

    return res.json({ count: payrolls.length, payrolls });
  } catch (error) {
    // next(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getNonPayrollEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payrollDef = await PayrollDefinition.findByPk(id);
    if (!payrollDef)
      return res.status(404).json({ message: "payroll not found" });
    const employees = await Employee.findAll({
      where: {
        PayrollDefinitionId: id, // Filter for payroll records of the specific month
      },
      include: [
        {
          model: Payroll,
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
      ],
      where: {
        "$Payroll.id$": null, // Filter for records where the payroll ID is null
      },
    });
    return res.status(200).json({
      count: employees.length,
      employees,
    });
  } catch (error) {
    // next(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
//update payroll data

exports.updatePayrollData = async (req, res, next) => {
  try {
    const payrollId = req.params.payrollId;
    const employeeData = req.body;
    const payroll = await Payroll.findByPk(Number(payrollId));
    if (!payroll) {
      return res.status(404).json({ message: "payroll does not exist" });
    } else {
      await payroll.update(employeeData);

      // Return the updated company object
      return res.status(200).json({
        message: "updated successfully",
        payroll,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getAll = async (req, res) => {
  try {
  } catch (error) {}
};
async function runPayroll(
  req,
  res,
  next,
  { employeeId, company, payrollDefinitionId }
) {
  try {
    const employeeGrade = await EmployeeGrade.findOne({
      where: { EmployeeId: employeeId, active: true },
    });
    // const allowances1=
    const [
      pension,
      payrollDefinition,
      oldPayroll,
      employee,
      loans,
      allowances,
      deductions,
      additionalAllowances,
      additionalDeductions,

      // additionalPayDefinition,
      additionalPay,
      otpayment,
    ] = await Promise.all([
      Pension.findOne({
        where: {
          CompanyId: company,
          isActive: true,
        },
      }),
      PayrollDefinition.findByPk(Number(payrollDefinitionId)),
      Payroll.findOne({
        where: {
          PayrollDefinitionId: payrollDefinitionId,
          EmployeeId: employeeId,
        },
      }),
      Employee.findByPk(Number(employeeId), {
        include: [
          { model: Loan },
          { model: EmployeeInfo, where: { isActive: true } },
        ],
      }),
      Loan.findAll({ where: { EmployeeId: employeeId } }),
      Allowance.findAll({
        where: { GradeId: employeeGrade?.GradeId },
        include: [AllowanceDefinition],
      }),

      Deduction.findAll({ where: { GradeId: employeeGrade?.GradeId } }),
      AdditionalAllowances.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
        include: [AdditionalAllowanceDefinition],
      }),
      AdditionalDeduction.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
        include: [AdditionalDeductionDefinition],
      }),
      AdditionalPay.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
      }),
      OTPayment.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
      }),
    ]);

    const employee_pension = pension?.employeeContribution ?? 0;
    const employer_pension = pension?.employerContribution ?? 0;

    const taxslabs = await Taxslab.findAll({
      where: { CompanyId: company, isActive: true },
    });
    let totalDeduction = 0;
    let totalAllowance = 0;
    let totalTaxable = 0;
    let income_tax_payable = 0;
    let deductible_Fee = 0;
    let totalExempted = 0;
    let totalTaxableIncome = 0;
    let overallTotalDeduction = 0;
    let totalLoan = 0;
    let totalAdditionalPay = 0;
    let totalOTPayment = 0;
    // Calculate total allowances
    allowances?.forEach((allowance) => {
      totalAllowance += Number(allowance.amount);

      if (allowance?.AllowanceDefinition?.isExempted) {
        totalExempted += Number(allowance.AllowanceDefinition.exemptedAmount);
        if (
          Number(allowance?.amount) >
          Number(allowance?.AllowanceDefinition?.startingAmount)
        ) {
          totalTaxable +=
            Number(allowance?.amount) -
            Number(allowance?.AllowanceDefinition?.exemptedAmount);
        } else {
          totalTaxable += Number(allowance.amount);
        }
      } else {
        totalTaxable += Number(allowance?.amount);
      }
    });
    additionalPay.forEach((additionalPay) => {
      totalAdditionalPay += Number(additionalPay?.amount);
    });
    otpayment.forEach((otpay) => {
      totalOTPayment +=
        (employee.EmployeeInfos[0]?.basicSalary / 192) * otpay?.hour;
    });
    // Calculate total additional allowances
    additionalAllowances.forEach((allowance) => {
      totalAllowance += Number(allowance?.amount);
      if (allowance?.AllowanceDefinition?.isExempted) {
        totalExempted += Number(allowance?.AllowanceDefinition?.exemptedAmount);
        if (
          Number(allowance?.amount) >
          Number(allowance?.AllowanceDefinition?.startingAmount)
        ) {
          totalTaxable +=
            Number(allowance?.amount) -
            Number(allowance?.AllowanceDefinition?.exemptedAmount);
        } else {
          totalTaxable += Number(allowance?.amount);
        }
      } else {
        totalTaxable += Number(allowance?.amount);
      }
    });
    deductions?.forEach((deduction) => {
      totalDeduction += Number(deduction?.amount);
    });
    additionalDeductions.forEach((deduction) => {
      totalDeduction += Number(deduction?.amount);
    });
    totalTaxable += Number(employee?.EmployeeInfos[0]?.basicSalary);
    const taxslab = taxslabs.find(
      (tax) => totalTaxable > tax?.from_Salary && totalTaxable < tax?.to_Salary
    );
    if (taxslab) {
      deductible_Fee = taxslab?.deductible_Fee;
      income_tax_payable = taxslab?.income_tax_payable;
      totalTaxableIncome =
        totalTaxable *
          (income_tax_payable === 0 ? 1 : income_tax_payable / 100) -
        deductible_Fee;
    } else {
      totalTaxableIncome = 0;
    }

    loans.forEach((loan) => (totalLoan += loan?.amount));
    overallTotalDeduction =
      totalLoan +
      totalTaxableIncome +
      totalDeduction +
      employee.EmployeeInfos[0]?.basicSalary * ((employee_pension * 1) / 100);
    const payrollData = {
      grossSalary: (
        totalAllowance +
        employee.EmployeeInfos[0]?.basicSalary +
        employee.EmployeeInfos[0]?.basicSalary * ((employer_pension * 1) / 100)
      ).toFixed(2),

      basicSalary: employee.EmployeeInfos[0]?.basicSalary,
      taxableIncome: totalTaxable.toFixed(2),
      incomeTax: totalTaxableIncome.toFixed(2),
      totalDeduction: overallTotalDeduction.toFixed(2),
      totalAllowance: totalAllowance + totalOTPayment,
      employee_pension_amount: Number(
        employee.EmployeeInfos[0]?.basicSalary * ((employee_pension * 1) / 100)
      ).toFixed(2),
      employer_pension_amount: (
        employee.EmployeeInfos[0]?.basicSalary *
        ((employer_pension * 1) / 100)
      ).toFixed(2),
      NetSalary: (
        totalTaxable -
        overallTotalDeduction +
        totalExempted +
        totalAdditionalPay +
        totalOTPayment
      ).toFixed(2),

      status: "processed",
      overtime: totalOTPayment,
    };

    // return res.json(payrollData)
    const data = await Payroll.create({
      ...payrollData,
      PayrollDefinitionId: payrollDefinitionId,
      EmployeeId: employeeId,
      CompanyId: company,
    });
    // await data.setCompany(Number(req.user.id));
    // const payroll = await oldPayroll.update(payrollData);
    // await payrollDefinition.increment("totalNoOfprocessedEmployee");
    // if (payrollDefinition.totalNoOfEmployee !== 0) {
    //   const percent =
    //     (Number(payrollDefinition.totalNoOfprocessedEmployee) /
    //       Number(payrollDefinition.totalNoOfEmployee)) *
    //     100;
    //   await payrollDefinition.update({ processedInPercent: percent });
    // }
    return 1;
  } catch (error) {
    console.log(error);

    return next(
      createError.createError(503, "Error occur on Some employee please check ")
    );
    // return res.status(404).json({
    //   message: `Error occur on Some employee please check `,
    // });
  }
}
// EMPLOYEE WITH NO PAYROLL ON CURRENT MONTH
exports.getNonPayrollEmployee1 = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { id } = req.params;

    const payrollDef = await PayrollDefinition.findOne({
      where: {
        id: id,
        CompanyId: CompanyId,
      },
    });
    if (!payrollDef) {
      return next(createError.createError(404, "Payroll definition not found"));
      // return res.status(404).json({ error: "Payroll definition not found" });
    }

    const employees = await Employee.findAll({
      attributes: [
        "id",
        "fullname",
        "image",
        "sex",
        "date_of_birth",
        "role",
        "nationality",
        "marriageStatus",
        "employee_id_number",
        "email",
        "phoneNumber",
        "optionalNumber",
        "id_image",
        "id_type",
        "id_Number",
        "isDeactivated",
        "hireDate",
        "joiningDate",
        "isActive",
        "CompanyId",
      ],
      where: { CompanyId: CompanyId },
      include: [
        {
          model: Payroll,
          required: false,
          where: {
            PayrollDefinitionId: id,
          },
        },
        {
          model: EmployeeInfo,
          where: { isActive: true },
          required: false,
        },
        {
          model: Grade,
          through: { model: EmployeeGrade },
          include: [
            {
              model: Allowance,
              // include: [AllowanceDefinition],
            },
            {
              model: Deduction,
              // include: [DeductionDefinition],
            },
          ],
        },
        // {
        //   model: AccountInfo,
        //   where: { isActive: true },
        //   required: false,
        // },
        {
          model: Loan,
          required: false,
        },
        {
          model: AdditionalAllowances,
          // include: [AdditionalAllowanceDefinition],
        },
        {
          model: AdditionalDeduction,
          // include: [AdditionalDeductionDefinition],
        },
      ],
      where: {
        "$Payroll.id$": null,
        CompanyId: req.user.id,
      },
    });

    const pension = await Pension.findOne({
      where: { CompanyId: req.user.id, isActive: true },
    });
    const taxslabs = await Taxslab.findAll({
      where: { CompanyId: req.user.id, isActive: true },
    });

    const employee_pension = pension?.employeeContribution ?? 0;
    const employer_pension = pension?.employerContribution ?? 0;

    const enrichedEmployees = employees.map((employee) => {
      let totalDeduction = 0;
      let totalAllowance = 0;
      let additionalAllowance = 0;
      let additionalDeduction = 0;
      let totalLoan = 0;
      let taxableIncome = employee?.EmployeeInfos[0]?.basicSalary || 0;
      let grossEarning = 0;
      let totalOTPayment = 0;

      // Calculate allowances and deductions
      employee.Grades?.[0]?.Allowances.forEach((allowance) => {
        totalAllowance += parseFloat(allowance.amount || 0);
      });
      employee.Grades?.[0]?.Deductions.forEach((deduction) => {
        totalDeduction += parseFloat(deduction.amount || 0);
      });
      employee.AdditionalAllowances?.forEach((allowance) => {
        additionalAllowance += parseFloat(allowance.amount || 0);
      });
      employee.AdditionalDeductions?.forEach((deduction) => {
        additionalDeduction += parseFloat(deduction.amount || 0);
      });
      employee.Loan?.forEach((loan) => {
        totalLoan += parseFloat(loan.amount || 0);
      });

      // Summing allowances and deductions
      const totalAllowancesCombined = totalAllowance + additionalAllowance;
      const totalDeductionsCombined = totalDeduction + additionalDeduction;

      // Calculate gross earnings
      grossEarning =
        taxableIncome +
        totalAllowancesCombined +
        (taxableIncome * employer_pension) / 100 -
        totalDeductionsCombined;

      // Add calculated fields to the employee object
      return {
        ...employee.toJSON(),
        totalAllowances: totalAllowancesCombined,
        totalDeductions: totalDeductionsCombined,
        // additionalAllowance,
        // additionalDeduction,
        totalLoan,
        taxableIncome,
        grossEarning,
        employerContribution: (taxableIncome * employer_pension) / 100,
      };
    });

    return res
      .status(200)
      .json({ count: enrichedEmployees.length, data: enrichedEmployees });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.deselectRunnedPayroll = async (req, res, next) => {
  try {
    const { payrollDefinitionId, employeeIds } = req.body;
    const payrolldef = await PayrollDefinition.findByPk(payrollDefinitionId);
    const company = req.user.id;
    if (!payrolldef) {
      return res.status(404).json({ message: "payroll is not defined" });
    }

    const employees = await Employee.findAll({
      where: {
        id: employeeIds,
        CompanyId: req.user.id,
      },
    });
    const existingEmployeeIds = employees.map((employee) => employee.id);
    const nonExistingEmployeeIds = employeeIds.filter(
      (id) => !existingEmployeeIds.includes(id)
    );

    if (nonExistingEmployeeIds.length > 0) {
      return res.status(404).json({
        error: "employee not found",
        employees: nonExistingEmployeeIds,
      });
    }
    let payrollDestroyed = false;
    await Promise.all(
      employeeIds.map(async (employeeId) => {
        try {
          const payroll = await Payroll.findOne({
            where: {
              EmployeeId: employeeId,
              PayrollDefinitionId: payrollDefinitionId,
            },
          });

          if (payroll) {
            await payroll.destroy();
            payrollDestroyed = true;
          }
        } catch (error) {
          // next(error);
          return next(
            createError.createError(
              503,
              "An error occurred, please try again later"
            )
          );
        }
      })
    );
    // Respond with a success message after all employees have been processed
    if (payrollDestroyed) {
      res
        .status(200)
        .json({ message: "Payroll deselected successfully for rerun" });
    } else {
      res.status(404).json({ message: "Their is no such employee" });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.getNotApprovedPayroll = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    // return res.json(CompanyId);
    // return res.json("Gemechu")
    const approver = await Approver.findOne({
      where: { EmployeeId: req.user.id, isActive: true },
      include: {
        model: ApprovalMethod,
        as: "ApprovalMethod",
        where: {
          CompanyId: CompanyId,
          isActive: true,
        },
      },
    });

    // return res.json(approver)

    if (approver?.ApprovalMethod === null) {
      return next(createError.createError(400, "Define approval method first"));
    }

    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const currentMonthPayrolls = await PayrollDefinition.findAll({
      where: {
        CompanyId: CompanyId,
        startDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    if (currentMonthPayrolls.length === 0) {
      return res.status(204).json({
        message: "No payrolls defined for this month",
      });
    }

    if (approver?.ApprovalMethod?.approvalMethod === "horizontal") {
      //

      const minimumApprovers = Number(approver.ApprovalMethod.minimumApprover);
      if (approver.isMaster) {
        // return res.json(approver);
        // return res.json("dkdddkdk");
        // const payrolls = await Payroll.findAll({
        //   where: {
        //     CompanyId: CompanyId,
        //     status: {
        //       [Op.not]: ["approved", "rejected"], // Exclude payrolls with status 'approved'
        //     },
        //     PayrollDefinitionId: currentMonthPayrolls?.[0]?.id,
        //   },
        //   include: [
        //     {
        //       model: Employee,
        //       attributes: [
        //         "id",
        //         "fullname",
        //         "phoneNumber",
        //         "nationality",
        //         "marriageStatus",
        //         "date_of_birth",
        //         "sex",
        //         "employee_id_number",
        //         "email",
        //       ],
        //     },
        //   ],
        // });

        // return res.status(200).json({
        //   success: true,
        //   data: payrolls,
        // });

        const payrolls = await Payroll.findAll({
          where: {
            CompanyId: CompanyId,
            status: {
              [Op.not]: ["approved", "rejected"],
            },
            PayrollDefinitionId: currentMonthPayrolls?.[0]?.id,
          },
          include: [
            {
              model: Employee,
              attributes: [
                "id",
                "fullname",
                "phoneNumber",
                "nationality",
                "marriageStatus",
                "date_of_birth",
                "sex",
                "employee_id_number",
                "email",
              ],
              include: [
                {
                  model: Position, // Include Position through Employee
                  as: "Positions", // Ensure this alias matches the association in your models
                  attributes: ["positionName"], // Only retrieve the positionName
                  through: { attributes: [] }, // Exclude junction table fields
                  raw: true, // Return plain objects instead of Sequelize instances
                },
              ],
            },
          ],
        });

        // Flatten employee and position fields into each payroll object
        // const formattedPayrolls = payrolls.map((payroll) => {
        //   const employee = payroll.Employee?.toJSON() || {};
        //   const positions = employee.Positions || []; // No need to call .toJSON() here since raw is true
        //   const { Employee, ...rest } = payroll.toJSON(); // remove nested Employee
        //   return {

        //     ...rest,
        //     ...employee, // merge employee fields into top level
        //     positionName: positions[0]?.positionName || null, // add positionName from Positions
        //   };
        // });
        const formattedPayrolls = payrolls.map((payroll) => {
          const { id, ...employeeWithoutId } = payroll.Employee?.toJSON() || {};
          const positions = employeeWithoutId.Positions || [];
          const { Employee, ...rest } = payroll.toJSON(); // remove nested Employee

          return {
            ...rest,
            ...employeeWithoutId, // merged without employee id
            positionName: positions[0]?.positionName || null,
          };
        });

        // return res.json("dkfds  ")
        return res.status(200).json({
          success: true,
          data: formattedPayrolls,
        });
      }

      const payrolls = await Payroll.findAll({
        attributes: [
          "id",
          "grossSalary",
          "basicSalary",
          "taxableIncome",
          "incomeTax",
          "totalDeduction",
          "totalAllowance",
          "NetSalary",
          "employee_pension_amount",
          "employer_pension_amount",
          "status",
          "isPaid",
          "createdAt",
          "updatedAt",
          "EmployeeId",
          "CompanyId",
          "PayrollDefinitionId",
        ],
        include: [
          {
            model: Employee,
            as: "Employee",
            attributes: [
              "id",
              "fullname",
              "phoneNumber",
              "nationality",
              "marriageStatus",
              "date_of_birth",
              "sex",
              "employee_id_number",
              "email",
            ],
            include: [
              {
                model: Position,
                as: "Positions", // Ensure this matches your model associations
                attributes: ["id", "positionName", "description"],
                through: { attributes: [] }, // Exclude junction table fields
              },
            ],
          },
          {
            model: EmployeePayrollApprovement, // Ensure this matches the model name
            attributes: ["id"],
            where: { status: "pending", ApproverId: { [Op.ne]: approver.id } },
            required: false, // Ensure LEFT JOIN
          },
        ],
        where: {
          status: { [Op.notIn]: ["approved", "rejected"] },
          PayrollDefinitionId: currentMonthPayrolls?.[0].id,
          id: {
            [Op.notIn]: Sequelize.literal(`(
              SELECT DISTINCT "PayrollId" FROM "EmployeePayrollApprovements"
              WHERE  "ApproverId" = ${approver.id}
            )`), // Exclude payrolls already approved by the current approver
          },
        },
        // group: [
        //   "Payroll.id",
        //   "Employee.id",
        //   "EmployeePayrollApprovements.id", // Ensure alias matches JOIN
        // ],

        group: [
          "Payroll.id",
          "Employee.id",
          "Employee->Positions.id", // Correct alias reference
          "EmployeePayrollApprovements.id",
        ],
        having: Sequelize.literal(
          'COALESCE(COUNT("EmployeePayrollApprovements"."id"), 0) < 2'
        ),
      });
      const formattedPayrolls = payrolls.map((payroll) => {
        return {
          id: payroll.id,
          grossSalary: payroll.grossSalary,
          basicSalary: payroll.basicSalary,
          taxableIncome: payroll.taxableIncome,
          incomeTax: payroll.incomeTax,
          totalDeduction: payroll.totalDeduction,
          totalAllowance: payroll.totalAllowance,
          NetSalary: payroll.NetSalary,
          employee_pension_amount: payroll.employee_pension_amount,
          employer_pension_amount: payroll.employer_pension_amount,
          status: payroll.status,
          isPaid: payroll.isPaid,
          createdAt: payroll.createdAt,
          updatedAt: payroll.updatedAt,
          EmployeeId: payroll.EmployeeId,
          CompanyId: payroll.CompanyId,
          PayrollDefinitionId: payroll.PayrollDefinitionId,
          fullname: payroll.Employee?.fullname,
          phoneNumber: payroll.Employee?.phoneNumber,
          nationality: payroll.Employee?.nationality,
          marriageStatus: payroll.Employee?.marriageStatus,
          date_of_birth: payroll.Employee?.date_of_birth,
          sex: payroll.Employee?.sex,
          employee_id_number: payroll.Employee?.employee_id_number,
          email: payroll.Employee?.email,
          positionName: payroll.Employee?.Positions?.[0]?.positionName || null, // Extracting only the first position
        };
      });

      return res.status(200).json({
        success: true,
        data: formattedPayrolls,
      });

      return res.status(200).json({
        success: true,
        data: payrolls,
      });
    }

    if (approver?.ApprovalMethod?.approvalMethod === "hierarchy") {
      // return res.json("Hi")
      const approvalLevel = Number(approver?.level);

      const companyApprovalLevel = approver?.ApprovalMethod?.approvalLevel;
      if (approver.isMaster) {
        const payrolls = await Payroll.findAll({
          where: {
            CompanyId: CompanyId,
            status: {
              [Op.not]: ["approved", "rejected"], // Exclude payrolls with status 'approved'
            },
            PayrollDefinitionId: currentMonthPayrolls?.[0]?.id,
            // id: {
            //   [Sequelize.Op.notIn]: Sequelize.literal(
            //     '(SELECT "PayrollId" FROM "EmployeePayrollApprovements")'
            //   ),
            // },
          },
          include: [
            {
              model: Employee,
              attributes: [
                "id",
                "fullname",
                "phoneNumber",
                "nationality",
                "marriageStatus",
                "date_of_birth",
                "sex",
                "employee_id_number",
                "email",
              ],
            },
          ],
        });

        return res.status(200).json({
          success: true,
          data: payrolls,
        });
      }
      if (approvalLevel === 1) {
        const payrolls = await Payroll.findAll({
          where: {
            CompanyId: CompanyId,
            status: {
              [Op.not]: ["approved", "rejected"], // Exclude payrolls with status 'approved'
            },
            PayrollDefinitionId: currentMonthPayrolls?.[0]?.id,
            id: {
              [Sequelize.Op.notIn]: Sequelize.literal(
                '(SELECT "PayrollId" FROM "EmployeePayrollApprovements")'
              ),
            },
          },
          include: [
            {
              model: Employee,
              attributes: [
                "id",
                "fullname",
                "phoneNumber",
                "nationality",
                "marriageStatus",
                "date_of_birth",
                "sex",
                "employee_id_number",
                "email",
              ],
            },
          ],
        });

        return res.status(200).json({
          success: true,
          data: payrolls,
        });
      } else {
        const payrolls = await Payroll.findAll({
          where: {
            CompanyId: CompanyId,
            status: {
              [Op.not]: ["approved", "rejected"], // Exclude payrolls with status 'approved'
            },
            PayrollDefinitionId: currentMonthPayrolls?.[0]?.id,
            id: {
              [Sequelize.Op.notIn]: Sequelize.literal(`
                (SELECT "PayrollId" 
                 FROM "EmployeePayrollApprovements" 
                 WHERE "status" = 'approved' AND "level" = ${approvalLevel})
              `),
            },
          },
          include: [
            {
              model: EmployeePayrollApprovement,
              where: {
                status: "approved",
                level: approvalLevel - 1,
              },
              required: true, // Ensures only matching records are returned
            },
            {
              model: Employee, // Include Employee details
              attributes: ["id", "fullname"],
            },
          ],
          raw: false,
          nest: true,
        });

        const cleanedPayrolls = payrolls.map((payroll) => {
          const { EmployeePayrollApprovements, ...rest } = payroll.toJSON(); // Convert instance to JSON and remove field
          return rest;
        });
        return res.status(200).json({
          success: true,
          data: cleanedPayrolls,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getPayrollPaymentProcess = async (req, res, next) => {
  try {
    let { processIds } = req.body;

    processIds = Array.isArray(processIds)
      ? processIds.map(Number).filter((id) => !isNaN(id))
      : [];

    if (!processIds.length) {
      return res.status(400).json({ message: "Invalid or empty process IDs" });
    }

    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const companyAccountNumber = await AccountInfo.findOne({
      where: {
        CompanyId: CompanyId,
        isActive: true,
      },
    });

    // return res.json(companyAccountNumber.accountNumber);

    if (!companyAccountNumber?.accountNumber) {
      return next(
        createError.createError(400, "There is no valid account Number")
      );
    }

    const payrolls = await Payroll.findAll({
      where: { id: processIds, CompanyId },
      include: [
        {
          model: Employee,
          include: [
            {
              model: AccountInfo,
              where: { isActive: true },
              limit: 1,
            },
          ],
        },
      ],
    });

    const foundIds = payrolls.map((p) => p.id);
    const missingIds = processIds.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      return next(createError.createError(400, "Some payrolls not found"));
    }

    const alreadyPaid = payrolls.find((p) => p.isPaid === true);
    if (alreadyPaid) {
      return res.status(400).json({
        message: "One or more selected payrolls have already been paid",
      });
    }
    let totalAmount = 0;
    const bulkId = uuidv4();

    let creditTransactions = payrolls.map((payroll) => {
      const accountNumber =
        payroll.Employee.AccountInfos?.[0]?.accountNumber || null;

      totalAmount += parseFloat(payroll.NetSalary);
      const orderId = uuidv4();

      // Save transaction with processId
      TransactionHistory.create({
        bulkId,
        orderId,
        processId: payroll.id, // Save processId
        creditAccount: accountNumber,
        amount: payroll.NetSalary,
        status: "PENDING",
      });

      return {
        orderId,
        creditAccount: accountNumber,
        amount: 1,
      };
    });

    const requestBody = {
      // debitAccount: "1045500049787",
      debitAccount: companyAccountNumber.accountNumber,
      // debitAccount: "ETB1769500010473",
      bankCode: "coop",
      totalAmount: processIds.length,
      bulkId,
      creditTransactions,
    };

    // const apiUrl = "http://10.1.151.51:5002/fund-transfer";
    const apiUrl = process.env.PAYMENTURL;
    // return res.json(apiurl);

    // const apiUrl =
    //   "https://souqpass.coopbankoromiasc.com/payroll/fund-transfer/process";
    let resp;

    try {
      resp = await axios.post(apiUrl, requestBody, {
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY":
            "ade8fd2435c92a3b3f48e7897f38964ba332256d3518fed35b5d04b80cfadfc6",
        },
      });
    } catch (apiError) {
      console.error("Payment API Error:", apiError?.response?.data || apiError);

      await TransactionHistory.update(
        { status: "FAILED", message: "API request failed" },
        { where: { bulkId } }
      );

      return res.status(400).json({ message: "Payment processing failed" });
    }

    const { transactionStatuses = [] } = resp.data || {};

    let successfulProcessIds = [];

    for (const txn of transactionStatuses) {
      const { orderId, status, message, transactionId } = txn;

      await TransactionHistory.update(
        { status, message, transactionId },
        { where: { orderId } }
      );

      if (status === "SUCCESS") {
        // Find the processId for the successful transaction
        const transaction = await TransactionHistory.findOne({
          where: { orderId },
        });

        if (transaction) {
          successfulProcessIds.push(transaction.processId);
        }
      }
    }

    if (successfulProcessIds.length > 0) {
      // Update payrolls to isPaid = true where transactions were successful
      await Payroll.update(
        { isPaid: true },
        { where: { id: successfulProcessIds } }
      );
    }

    return res.status(200).json({
      message: "Payroll processed successfully",
      data: transactionStatuses,
    });
  } catch (error) {
    console.error(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.projectBasedPayroll = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { payrollDefinitionId, employeeIds } = req.body;
    const payrollDefinition = await PayrollDefinition.findByPk(
      payrollDefinitionId
    );

    if (!payrollDefinition) {
      return next(createError.createError(404, "PayrollDefinition Not found"));
    }
    const employees = await Employee.findAll({
      where: {
        id: Number(employeeIds),
        CompanyId: CompanyId,
      },
      include: [
        {
          model: Company,
          required: false,
          attributes: [
            "id",
            "companyCode",
            "organizationName",
            "numberOfEmployees",
            "role",
            "status",
          ],
        },

        {
          model: EmployeeInfo,
          required: false,
          where: { isActive: true },
        },
        {
          model: Position,
          required: false,
          through: {
            model: EmployeePosition,
            where: {
              isActive: true,
            },
          },
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
          model: Projects,
          required: false,
          through: {
            model: ProjectEmployee,
          },
          include: [Sponsor],
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
              model: Allowance,
              include: [AllowanceDefinition],
            },
            {
              model: Deduction,
              include: [DeductionDefinition],
            },
          ],
        },

        {
          model: AdditionalAllowances,
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
      ],
    });

    if (employees.length < employeeIds.length) {
      const foundEmployeeIds = employees.map((employee) => employee.id);
      const missingEmployeeIds = employeeIds.filter(
        (id) => !foundEmployeeIds.includes(id)
      );

      return next(
        createError.createError(404, "One or more employees not found")
      );
    }

    const pension = await Pension.findOne({
      where: {
        CompanyId: CompanyId,
        isActive: true,
      },
    });
    const taxslabs = await Taxslab.findAll({
      where: {
        CompanyId: CompanyId,
        isActive: true,
      },
    });

    const employee_pension = pension?.employeeContribution ?? 0;
    const employer_pension = pension?.employerContribution ?? 0;

    const payrollRecords = employees.map((employee) => {
      let totalDeduction = 0;
      let totalAllowance = 0;
      let totalTaxable = 0;
      let income_tax_payable = 0;
      let deductible_Fee = 0;
      let totalExempted = 0;
      let totalTaxableIncome = 0;
      let overallTotalDeduction = 0;
      let totalLoan = 0;
      let totalAdditionalPay = 0;
      let additionalAllowance = 0;
      let taxableIncome = 0;
      let grossEarning = 0;
      let selectedSlab = null;
      let tax = 0;
      taxableIncome = employee?.EmployeeInfos[0]?.basicSalary;
      for (const slab of taxslabs) {
        if (
          taxableIncome >= slab.from_Salary &&
          taxableIncome <= slab.to_Salary
        ) {
          selectedSlab = slab;
          income_tax_payable = slab.income_tax_payable;
          deductible_Fee = slab.deductible_Fee;
          break;
        }
      }

      // tax=

      // Calculate payroll directly here
      const payrollAmount = employee?.EmployeeInfos[0]?.grossEarning;
      // Example calculation
      // const totalA= employee?.Grades
      if (employee.Grades.length > 0) {
        employee.Grades[0].Allowances.forEach((allowance) => {
          totalAllowance += parseFloat(allowance.amount);
        });
        employee.Grades[0].Deductions.forEach((deduction) => {
          totalDeduction += parseFloat(deduction.amount);
        });
      }
      if (employee.AdditionalAllowances.length > 0) {
        employee.AdditionalAllowances.forEach((allowance) => {
          additionalAllowance += parseFloat(allowance.amount);
        });
      }
      if (employee.Loan) {
        employee.Loan.forEach((loan) => {
          totalLoan += parseFloat(loan.amount);
        });
      }

      return {
        employeeId: employee.id,
        payrollDefinitionId: payrollDefinition.id,
        amount: payrollAmount,
        totalAllowance: totalAllowance,
        totalDeduction: totalDeduction,
        additionalAllowance: additionalAllowance,
        totalLoan: totalLoan,
        taxableIncome: taxableIncome,
        grossEarning:
          employee?.EmployeeInfos[0]?.basicSalary +
          totalAllowance +
          totalAdditionalPay +
          (employee?.EmployeeInfos[0]?.basicSalary * employer_pension) / 100 +
          additionalAllowance,
        employerContribution:
          employee?.EmployeeInfos[0]?.basicSalary * (employer_pension / 100),
        additionalAllowance: additionalAllowance,
        deductible_Fee: deductible_Fee,
        income_tax_payable: income_tax_payable,
      };
    });

    // const result = await runPayrollForProjectBased(req, res, { employeeIds, CompanyId, payrollDefinitionId });
    return res.status(200).json({ success: true, payrollRecords });
  } catch (error) {
    // await transaction.rollback();
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

async function runPayrollForProjectBased(
  req,
  res,
  { employeeId, company, payrollDefinitionId }
) {
  const transaction = await sequelize.transaction();

  try {
    const employeeGrade = await EmployeeGrade.findOne({
      where: { EmployeeId: employeeId, active: true },
    });
    // const allowances1=
    const [
      pension,
      payrollDefinition,
      oldPayroll,
      employee,
      loans,
      allowances,
      deductions,
      additionalAllowances,
      additionalDeductions,
      // additionalPayDefinition,
      additionalPay,
    ] = await Promise.all([
      Pension.findOne({
        where: {
          CompanyId: company,
          isActive: true,
        },
      }),
      PayrollDefinition.findByPk(Number(payrollDefinitionId)),
      Payroll.findOne({
        where: {
          PayrollDefinitionId: payrollDefinitionId,
          EmployeeId: employeeId,
        },
      }),
      Employee.findByPk(Number(employeeId), {
        include: [
          { model: Loan },
          { model: EmployeeInfo, where: { isActive: true } },
        ],
      }),
      Loan.findAll({ where: { EmployeeId: employeeId } }),
      Allowance.findAll({
        where: { GradeId: employeeGrade?.GradeId },
        include: [AllowanceDefinition],
      }),

      Deduction.findAll({ where: { GradeId: employeeGrade?.GradeId } }),
      AdditionalAllowances.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
        include: [AdditionalAllowanceDefinition],
      }),
      AdditionalDeduction.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
        include: [AdditionalDeductionDefinition],
      }),
      AdditionalPay.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
      }),
    ]);
    const employee_pension = pension?.employeeContribution ?? 0;
    const employer_pension = pension?.employerContribution ?? 0;

    const taxslabs = await Taxslab.findAll({
      where: { CompanyId: company, isActive: true },
    });
    let totalDeduction = 0;
    let totalAllowance = 0;
    let totalTaxable = 0;
    let income_tax_payable = 0;
    let deductible_Fee = 0;
    let totalExempted = 0;
    let totalTaxableIncome = 0;
    let overallTotalDeduction = 0;
    let totalLoan = 0;
    let totalAdditionalPay = 0;
    // Calculate total allowances
    allowances?.forEach((allowance) => {
      totalAllowance += Number(allowance.amount);

      if (allowance?.AllowanceDefinition?.isExempted) {
        totalExempted += Number(allowance.AllowanceDefinition.exemptedAmount);
        if (
          Number(allowance?.amount) >
          Number(allowance?.AllowanceDefinition?.startingAmount)
        ) {
          totalTaxable +=
            Number(allowance?.amount) -
            Number(allowance?.AllowanceDefinition?.exemptedAmount);
        } else {
          totalTaxable += Number(allowance.amount);
        }
      } else {
        totalTaxable += Number(allowance?.amount);
      }
    });
    additionalPay.forEach((additionalPay) => {
      totalAdditionalPay += Number(additionalPay?.amount);
    });
    // Calculate total additional allowances
    additionalAllowances.forEach((allowance) => {
      totalAllowance += Number(allowance?.amount);
      if (allowance?.AllowanceDefinition?.isExempted) {
        totalExempted += Number(allowance?.AllowanceDefinition?.exemptedAmount);
        if (
          Number(allowance?.amount) >
          Number(allowance?.AllowanceDefinition?.startingAmount)
        ) {
          totalTaxable +=
            Number(allowance?.amount) -
            Number(allowance?.AllowanceDefinition?.exemptedAmount);
        } else {
          totalTaxable += Number(allowance?.amount);
        }
      } else {
        totalTaxable += Number(allowance?.amount);
      }
    });
    deductions?.forEach((deduction) => {
      totalDeduction += Number(deduction?.amount);
    });
    additionalDeductions.forEach((deduction) => {
      totalDeduction += Number(deduction?.amount);
    });
    totalTaxable += Number(employee?.EmployeeInfos[0]?.basicSalary);
    const taxslab = taxslabs.find(
      (tax) => totalTaxable > tax?.from_Salary && totalTaxable < tax?.to_Salary
    );

    if (taxslab) {
      deductible_Fee = taxslab?.deductible_Fee;
      income_tax_payable = taxslab?.income_tax_payable;
      totalTaxableIncome =
        totalTaxable *
          (income_tax_payable === 0 ? 1 : income_tax_payable / 100) -
        deductible_Fee;
    } else {
      totalTaxableIncome = 0;
    }

    loans.forEach((loan) => (totalLoan += loan?.amount));
    overallTotalDeduction =
      totalLoan +
      totalTaxableIncome +
      totalDeduction +
      employee.EmployeeInfos[0]?.basicSalary * ((employee_pension * 1) / 100);
    const payrollData = {
      grossSalary: (
        totalAllowance +
        employee.EmployeeInfos[0]?.basicSalary +
        employee.EmployeeInfos[0]?.basicSalary * ((employer_pension * 1) / 100)
      ).toFixed(2),

      basicSalary: employee.EmployeeInfos[0]?.basicSalary,
      taxableIncome: totalTaxable.toFixed(2),
      incomeTax: totalTaxableIncome.toFixed(2),
      totalDeduction: overallTotalDeduction.toFixed(2),
      totalAllowance,
      employee_pension_amount: Number(
        employee.EmployeeInfos[0]?.basicSalary * ((employee_pension * 1) / 100)
      ).toFixed(2),
      employer_pension_amount: (
        employee.EmployeeInfos[0]?.basicSalary *
        ((employer_pension * 1) / 100)
      ).toFixed(2),
      NetSalary: (
        totalTaxable -
        overallTotalDeduction +
        totalExempted +
        totalAdditionalPay
      ).toFixed(2),

      status: "processed",
    };
    await Payroll.bulkCreate(payrollRecords, { transaction });

    // Commit the transaction
    await transaction.commit();

    return 1;
  } catch (error) {
    // Rollback the transaction if an error occurs
    await transaction.rollback();

    return res.status(503).json({
      success: false,
      error: "Error occurred while processing payroll",
    });
  }
}

async function runForProjectBasedPayroll(
  req,
  res,
  { employeeId, company, payrollDefinitionId }
) {
  try {
    const employeeGrade = await EmployeeGrade.findOne({
      where: { EmployeeId: employeeId, active: true },
    });
    // const allowances1=
    const [
      pension,
      providentFund,
      payrollDefinition,
      oldPayroll,
      employee,
      loans,
      allowances,
      deductions,
      additionalAllowances,
      additionalDeductions,
      // additionalPayDefinition,
      additionalPay,
    ] = await Promise.all([
      Pension.findOne({
        where: {
          CompanyId: company,
          isActive: true,
        },
      }),

      ProvidentFund.findOne({
        where: {
          CompanyId: company,
          isActive: true,
        },
      }),
      PayrollDefinition.findByPk(Number(payrollDefinitionId)),
      Payroll.findOne({
        where: {
          PayrollDefinitionId: payrollDefinitionId,
          EmployeeId: employeeId,
        },
      }),
      Employee.findByPk(Number(employeeId), {
        include: [
          { model: Loan },
          { model: EmployeeInfo, where: { isActive: true } },
        ],
      }),
      Loan.findAll({ where: { EmployeeId: employeeId } }),
      Allowance.findAll({
        where: { GradeId: employeeGrade?.GradeId },
        include: [AllowanceDefinition],
      }),

      Deduction.findAll({ where: { GradeId: employeeGrade?.GradeId } }),
      AdditionalAllowances.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
        include: [AdditionalAllowanceDefinition],
      }),
      AdditionalDeduction.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
        include: [AdditionalDeductionDefinition],
      }),
      AdditionalPay.findAll({
        where: { CompanyId: company, EmployeeId: employeeId },
      }),
    ]);
    const employee_pension = pension?.employeeContribution ?? 0;
    const employer_pension = pension?.employerContribution ?? 0;
    const employee_providentFund = providentFund?.employeeContribution ?? 0;
    const employer_providentFund = providentFund?.employerContribution ?? 0;

    const taxslabs = await Taxslab.findAll({
      where: { CompanyId: company, isActive: true },
    });
    let totalDeduction = 0;
    let totalAllowance = 0;
    let totalTaxable = 0;
    let income_tax_payable = 0;
    let deductible_Fee = 0;
    let totalExempted = 0;
    let totalTaxableIncome = 0;
    let overallTotalDeduction = 0;
    let totalLoan = 0;
    let totalAdditionalPay = 0;
    let taxableIncome = 0;
    let grossSalary = 0;

    (taxableIncome = employee.EmployeeInfos[0]?.basicSalary),
      // Calculate total allowances
      allowances?.forEach((allowance) => {
        totalAllowance += Number(allowance.amount);

        if (allowance?.AllowanceDefinition?.isExempted) {
          totalExempted += Number(allowance.AllowanceDefinition.exemptedAmount);
          if (
            Number(allowance?.amount) >
            Number(allowance?.AllowanceDefinition?.startingAmount)
          ) {
            totalTaxable +=
              Number(allowance?.amount) -
              Number(allowance?.AllowanceDefinition?.exemptedAmount);
          } else {
            totalTaxable += Number(allowance.amount);
          }
        } else {
          totalTaxable += Number(allowance?.amount);
        }
      });
    additionalPay.forEach((additionalPay) => {
      totalAdditionalPay += Number(additionalPay?.amount);
    });
    // Calculate total additional allowances
    additionalAllowances.forEach((allowance) => {
      totalAllowance += Number(allowance?.amount);
      if (allowance?.AllowanceDefinition?.isExempted) {
        totalExempted += Number(allowance?.AllowanceDefinition?.exemptedAmount);
        if (
          Number(allowance?.amount) >
          Number(allowance?.AllowanceDefinition?.startingAmount)
        ) {
          totalTaxable +=
            Number(allowance?.amount) -
            Number(allowance?.AllowanceDefinition?.exemptedAmount);
        } else {
          totalTaxable += Number(allowance?.amount);
        }
      } else {
        totalTaxable += Number(allowance?.amount);
      }
    });

    totalAllowance +=
      employee?.EmployeeInfos[0]?.basicSalary *
      ((employer_pension * 1) / 100).toFixed(2);
    deductions?.forEach((deduction) => {
      totalDeduction += Number(deduction?.amount);
    });
    additionalDeductions.forEach((deduction) => {
      totalDeduction += Number(deduction?.amount);
    });
    totalTaxable += Number(employee?.EmployeeInfos[0]?.basicSalary);
    const taxslab = taxslabs.find(
      (tax) => totalTaxable > tax?.from_Salary && totalTaxable < tax?.to_Salary
    );
    if (taxslab) {
      deductible_Fee = taxslab?.deductible_Fee;
      income_tax_payable = taxslab?.income_tax_payable;
      totalTaxableIncome =
        taxableIncome *
          (income_tax_payable === 0 ? 1 : income_tax_payable / 100) -
        deductible_Fee;
    } else {
      totalTaxableIncome = 0;
    }
    grossSalary = totalAllowance + employee.EmployeeInfos[0]?.basicSalary;
    loans.forEach((loan) => (totalLoan += loan?.amount));
    overallTotalDeduction =
      totalLoan +
      totalTaxableIncome +
      totalDeduction +
      employee.EmployeeInfos[0]?.basicSalary * ((employee_pension * 1) / 100) +
      employee.EmployeeInfos[0]?.basicSalary *
        ((employee_providentFund * 1) / 100);
    const payrollData = {
      grossSalary: grossSalary.toFixed(2),

      basicSalary: employee.EmployeeInfos[0]?.basicSalary,
      taxableIncome: taxableIncome,
      incomeTax: totalTaxableIncome.toFixed(2),
      totalDeduction: overallTotalDeduction.toFixed(2),
      totalAllowance,
      employee_pension_amount: Number(
        employee.EmployeeInfos[0]?.basicSalary * ((employee_pension * 1) / 100)
      ).toFixed(2),
      employer_pension_amount: (
        employee.EmployeeInfos[0]?.basicSalary *
        ((employer_pension * 1) / 100)
      ).toFixed(2),
      NetSalary: (grossSalary - overallTotalDeduction)
        // totalExempted

        .toFixed(2),

      status: "processed",
    };
    const data = await Payroll.create({
      ...payrollData,
      PayrollDefinitionId: payrollDefinitionId,
      EmployeeId: employeeId,
    });
    await data.setCompany(Number(req.user.id));

    return 1;
  } catch (error) {
    return next(createError.createError(503, `error occur on some Employee `));
    // return res.status(404).json({
    //   message: `error occur on empliyee with ID= ${employeeId}`,
    // });
  }
}

exports.approvePayrolls = async (req, res, next) => {
  try {
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//PROCESSED PAYROLL
exports.getUnprocessedPayrollForSpecificMonthProcessedPayroll = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const currentMonthPayrolls = await PayrollDefinition.findOne({
      where: {
        CompanyId: CompanyId,
        id: id,
      },
    });

    if (!currentMonthPayrolls) {
      return next(createError.createError(404, "Payrolldefinition not found"));
    }
    const employees = await Employee.findAll({
      include: [
        { model: Position },
        {
          model: Payroll,
          // required: true,
          where: {
            PayrollDefinitionId: id, // Filter for payroll records of the specific month
            // required:true
          },
        },
      ],
    });

    const transformedEmployees = employees.map((employee) => {
      const {
        id,
        fullname,
        image,
        sex,
        date_of_birth,
        role,
        nationality,
        marriageStatus,
        employee_id_number,
        email,
        phoneNumber,
        optionalNumber,
        id_image,
        id_type,
      } = employee;

      const positions = employee.Positions
        ? {
            positionName: employee?.Positions[0].positionName,
          }
        : {};

      // Extract necessary fields from the Payroll object
      const payrollInfo = employee.Payroll
        ? {
            grossSalary: employee.Payroll.grossSalary,
            basicSalary: employee.Payroll.basicSalary,
            taxableIncome: employee.Payroll.taxableIncome,
            incomeTax: employee.Payroll.incomeTax,
            totalDeduction: employee.Payroll.totalDeduction,
            totalAllowance: employee.Payroll.totalAllowance,
            NetSalary: employee.Payroll.NetSalary,
            employee_pension_amount: employee.Payroll.employee_pension_amount,
            employer_pension_amount: employee.Payroll.employer_pension_amount,
            status: employee.Payroll.status,
            isPaid: employee.Payroll.isPaid,
          }
        : {};

      return {
        id,
        fullname,
        ...positions,
        image,
        sex,
        date_of_birth,
        role,
        nationality,
        marriageStatus,
        employee_id_number,
        email,
        phoneNumber,
        optionalNumber,
        id_image,
        id_type,
        ...payrollInfo,
      };
    });

    return res.status(200).json({
      status: "true",

      data: transformedEmployees,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//PROCESSED PAYROLL
exports.getProcessedPayroll = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const currentMonthPayrolls = await PayrollDefinition.findAll({
      where: {
        CompanyId: req.user.id,
        startDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    // return res.json(currentMonthPayrolls);
    // return res.json(currentMonthPayrolls?.[0]?.id);

    if (currentMonthPayrolls.length === 0) {
      return res.status(204).json({
        message: "No payrolls defined for this month",
      });
    }

    const employees = await Employee.findAll({
      include: [
        { model: Position },
        {
          model: Payroll,
          // required: true,
          where: {
            PayrollDefinitionId: currentMonthPayrolls?.[0]?.id, // Filter for payroll records of the specific month
            // required:true
          },
        },
      ],
    });

    const transformedEmployees = employees.map((employee) => {
      const {
        id,
        fullname,
        image,
        sex,
        date_of_birth,
        role,
        nationality,
        marriageStatus,
        employee_id_number,
        email,
        phoneNumber,
        optionalNumber,
        id_image,
        id_type,
      } = employee;

      const positions = employee.Positions
        ? {
            positionName: employee?.Positions[0].positionName,
          }
        : {};

      // Extract necessary fields from the Payroll object
      const payrollInfo = employee.Payroll
        ? {
            grossSalary: employee.Payroll.grossSalary,
            basicSalary: employee.Payroll.basicSalary,
            taxableIncome: employee.Payroll.taxableIncome,
            incomeTax: employee.Payroll.incomeTax,
            totalDeduction: employee.Payroll.totalDeduction,
            totalAllowance: employee.Payroll.totalAllowance,
            NetSalary: employee.Payroll.NetSalary,
            employee_pension_amount: employee.Payroll.employee_pension_amount,
            employer_pension_amount: employee.Payroll.employer_pension_amount,
            status: employee.Payroll.status,
            isPaid: employee.Payroll.isPaid,
          }
        : {};

      return {
        id,
        fullname,
        ...positions,
        image,
        sex,
        date_of_birth,
        role,
        nationality,
        marriageStatus,
        employee_id_number,
        email,
        phoneNumber,
        optionalNumber,
        id_image,
        id_type,
        ...payrollInfo,
      };
    });

    return res.status(200).json({
      status: "true",

      data: transformedEmployees,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//PROCESSED PAYROLL

//UNPROCESSED PAYROLL
exports.getUnprocessedPayroll = async (req, res, next) => {
  try {
    const payrollDefinitionId = req.params.id;
    if (!payrollDefinitionId) {
      return next(createError.createError(404, "Please specify the month"));
    }

    const payrollDefinition = await PayrollDefinition.findOne({
      where: { id: payrollDefinitionId },
    });

    if (!payrollDefinition) {
      return next(createError.createError(404, "Month not found"));
    }

    // Step 1: Get all EmployeeIds with payroll for the specified PayrollDefinitionId
    const processedPayrolls = await Payroll.findAll({
      where: { PayrollDefinitionId: payrollDefinitionId },
      attributes: ["EmployeeId"], // Only select the EmployeeId
    });

    // Extract EmployeeIds from the processedPayrolls
    const processedEmployeeIds = processedPayrolls.map(
      (payroll) => payroll.EmployeeId
    );

    // Step 2: Fetch unprocessed employees
    const employees = await Employee.findAll({
      where: {
        hireDate: {
          [Sequelize.Op.lte]: payrollDefinition.endDate, // hireDate must be less than or equal to payrollEndDate
        },
        CompanyId: req.user.id, // Filter by company
        id: {
          [Sequelize.Op.notIn]: processedEmployeeIds, // Exclude processed EmployeeIds
        },
      },
      include: [
        {
          model: Position,
        },
      ],
    });

    const transformedEmployees = employees.map((employee) => {
      const {
        id,
        fullname,
        image,
        sex,
        date_of_birth,
        role,
        nationality,
        marriageStatus,
        employee_id_number,
        email,
        phoneNumber,
        optionalNumber,
        id_image,
        id_type,
      } = employee;

      const positions = employee.Positions
        ? {
            positionName: employee?.Positions[0].positionName,
          }
        : {};

      // Extract necessary fields from the Payroll object
      const payrollInfo = employee.Payroll
        ? {
            grossSalary: employee.Payroll.grossSalary,
            basicSalary: employee.Payroll.basicSalary,
            taxableIncome: employee.Payroll.taxableIncome,
            incomeTax: employee.Payroll.incomeTax,
            totalDeduction: employee.Payroll.totalDeduction,
            totalAllowance: employee.Payroll.totalAllowance,
            NetSalary: employee.Payroll.NetSalary,
            employee_pension_amount: employee.Payroll.employee_pension_amount,
            employer_pension_amount: employee.Payroll.employer_pension_amount,
            status: employee.Payroll.status,
            isPaid: employee.Payroll.isPaid,
          }
        : {};

      return {
        id,
        fullname,
        ...positions,
        image,
        sex,
        date_of_birth,
        role,
        nationality,
        marriageStatus,
        employee_id_number,
        email,
        phoneNumber,
        optionalNumber,
        id_image,
        id_type,
        ...payrollInfo,
      };
    });
    return res.status(200).json({
      status: "success",
      data: transformedEmployees,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//PROCESSED PAYROLL
exports.getApprovedPay = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const currentMonthPayrolls = await PayrollDefinition.findAll({
      where: {
        CompanyId: req.user.id,
        startDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    // return res.json(currentMonthPayrolls);
    // return res.json(currentMonthPayrolls?.[0]?.id);

    if (currentMonthPayrolls.length === 0) {
      return res.status(204).json({
        message: "No payrolls defined for this month",
      });
    }

    const employees = await Employee.findAll({
      include: [
        { model: Position },
        {
          model: Payroll,
          // required: true,
          where: {
            status: "approved",
            isPaid: false,
            PayrollDefinitionId: currentMonthPayrolls?.[0]?.id, // Filter for payroll records of the specific month
            // required:true
          },
        },
      ],
    });

    const transformedEmployees = employees.map((employee) => {
      const {
        id,
        fullname,
        image,
        sex,
        date_of_birth,
        role,
        nationality,
        marriageStatus,
        employee_id_number,
        email,
        phoneNumber,
        optionalNumber,
        id_image,
        id_type,
      } = employee;

      const positions = employee.Positions
        ? {
            positionName: employee?.Positions[0].positionName,
          }
        : {};

      // Extract necessary fields from the Payroll object
      const payrollInfo = employee.Payroll
        ? {
            grossSalary: employee.Payroll.grossSalary,
            basicSalary: employee.Payroll.basicSalary,
            taxableIncome: employee.Payroll.taxableIncome,
            incomeTax: employee.Payroll.incomeTax,
            totalDeduction: employee.Payroll.totalDeduction,
            totalAllowance: employee.Payroll.totalAllowance,
            NetSalary: employee.Payroll.NetSalary,
            employee_pension_amount: employee.Payroll.employee_pension_amount,
            employer_pension_amount: employee.Payroll.employer_pension_amount,
            status: employee.Payroll.status,
            isPaid: employee.Payroll.isPaid,
            isPaid: employee.Payroll.isPaid,
            processId: employee.Payroll.id,
          }
        : {};

      return {
        id,
        fullname,
        ...positions,
        image,
        sex,
        date_of_birth,
        role,
        nationality,
        marriageStatus,
        employee_id_number,
        email,
        phoneNumber,
        optionalNumber,
        id_image,
        id_type,
        ...payrollInfo,
      };
    });

    return res.status(200).json({
      status: "true",
      data: transformedEmployees,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.downloadEmployeeTemplate = async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("EmployeeTemplate");

    // Add headers to the worksheet
    worksheet.columns = [
      { header: "Name", key: "Name", width: 30 },
      { header: "Position", key: "Position", width: 23 },
      { header: "PhoneNumber", key: "PhoneNumber", width: 23 },
      { header: "BankName", key: "BankName", width: 23 },
      { header: "AccountNumber", key: "AccountNumber", width: 23 },
      { header: "Email", key: "Email", width: 30 },
    ];

    // Format the header row
    worksheet.getRow(1).font = {
      bold: true,
      size: 14, // Increase the size for the header
      color: { argb: "FFFFFF" }, // White color
    };

    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4F81BD" }, // Background color (blue)
    };

    // Set the response headers to download the file
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=employee_template.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Write the Excel file to the response
    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    next(error);
  }
};
