const Grade = require("../models/grade.js");

// const AllowanceDefinition = require("../models/allowanceDefinition.js");

const DeductionDefinition = require("../models/deductionDefinition.js");

const Pension = require("../models/pension");
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
const AdditionalPayDefinition=require("../models/additionalPayDefinition.js");
const AdditionalPay=require("../models/additionalPay.js")
const PayrollDefinition = require("../models/payrollDefinition");
const EmployeeGrade = require("../models/EmployeeGrade");
const { run } = require("../utils/checkSubscriptionPlan.js");
const { child } = require("winston");
const { error } = require("shelljs");

exports.createPayroll1 = async (req, res,next) => {
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

    const errors = [];
    let payrollCount = 0;
    await payrolldef.update({ status: "ordered" });
    for (const employeeId of employeeIds) {
      try {
        const payroll = await Payroll.findOne({
          where: {
            EmployeeId: employeeId,
            PayrollDefinitionId: payrollDefinitionId,
          },
        });

        if (payroll) {
          return res
            .status(200)
            .json({ message: "payroll run for employee " + employeeId });
        }
        const resp = await runPayroll(req, res, {
          employeeId,
          company,
          payrollDefinitionId,
        });
        // console.log("response", resp);
        // if (payroll) {
        //   await payroll.destroy();
        //   payrolldef.totalNoOfEmployee =
        //     Number(payrolldef.totalNoOfEmployee) - 1;
        //   payrolldef.totalNoOfprocessedEmployee =
        //     Number(payrolldef.totalNoOfprocessedEmployee) - 1;
        //   await payrolldef.save();
        // }

        // const payrollData = {
        //   PayrollDefinitionId: payrollDefinitionId,
        //   EmployeeId: employeeId,
        // };
        // console.log("payroll Data", payrollData);
        // await Payroll.create(payrollData);
        // payrollCount++;
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      console.log("error", errors);
      return res
        .status(500)
        .json({ msg: "There is a problem creating payroll", errors });
    }
    ///
    // // Update total payroll count in the database
    // payrolldef.totalNoOfEmployee =
    //   Number(payrolldef.totalNoOfEmployee) + Number(payrollCount);
    // await payrolldef.save();

    return res.status(201).json({ msg: "Payroll created successfully!  " });
  } catch (error) {
    console.log("err", error);
    return res
      .status(500)
      .json({ msg: "Error occurred while creating payroll:", error });
  }
};

exports.getPayrollByPayrollDefId = async (req, res,next) => {
  try {
    const { id } = req.params;
    const payrollDef = await PayrollDefinition.findByPk(id);
    if (!payrollDef)
      return res.status(404).json({ message: "Payroll not found" });
    const payrolls = await Payroll.findAll({
      where: { PayrollDefinitionId: id },
      include: [Employee, PayrollDefinition],
    });

    return res.json({ count: payrolls.length, payrolls });
  } catch (error) {
    next(error)
  }
};

exports.getNonPayrollEmployee = async (req, res,next) => {
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
  next(error)
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
      return res.json({
        message: "updated successfully",
        payroll,
      });
    }
  } catch (error) {
    console.log("first", error);
    next(error)
  }
};

exports.getAll = async (req, res) => {
  try {
  } catch (error) {
    console.log("error", error);
  }
};
async function runPayroll(
  req,
  res,
  { employeeId, company, payrollDefinitionId }
) {
  console.log("company", company);
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
          companyId: company,
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
      where: { companyId: company, isActive: true },
    });
    console.log("taxslabs",taxslabs);
    let totalDeduction = 0;
    let totalAllowance = 0;
    let totalTaxable = 0;
    let income_tax_payable = 0;
    let deductible_Fee = 0;
    let totalExempted = 0;
    let totalTaxableIncome = 0;
    let overallTotalDeduction = 0;
    let totalLoan = 0;
    let totalAdditionalPay=0;
    // Calculate total allowances
    allowances?.forEach((allowance) => {
      totalAllowance += Number(allowance.amount);
      console.log(
        "exemted amount: ",
        allowance?.AllowanceDefinition.isExempted
      );
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
    additionalPay.forEach((additionalPay)=>{
    totalAdditionalPay+= Number(additionalPay?.amount)
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
    console.log("addional pay",additionalPay)
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
    // console.log("payroll Data", payrollData);
    const data = await Payroll.create({
      ...payrollData,
      PayrollDefinitionId: payrollDefinitionId,
      EmployeeId: employeeId,
    });
  
    console.log("payroll data", payrollData);
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
    console.log("from runpayroll ", error);
    return res.status(404).json({
      message: `error occur on empliyee with ID= ${employeeId}`,
    });
  }
}

exports.getNonPayrollEmployee1 = async (req, res) => {
  try {
    const { id } = req.params;
    const payrollDef = await PayrollDefinition.findByPk(id);
    if (!payrollDef)
      return res.status(404).json({ error: "payroll not found" });
    const employees = await Employee.findAll({
      include: [
        {
          model: Payroll,
          required: false,
          where: {
            PayrollDefinitionId: id, // Filter for payroll records of the specific month
          },
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
    return res.status(200).json({ count: employees.length, employees });
  } catch (error) {
    res.json(error);
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
      },
    });

    const existingEmployeeIds = employees.map((employee) => employee.id);
    console.log("existiongEmployeeIds: " + existingEmployeeIds);
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
          console.log("Error in employee payroll deselection:", error);
          next(error);
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
    console.log("error", error);
    next(error);
  }
};
