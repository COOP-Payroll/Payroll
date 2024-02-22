const Grade = require("../models/grade.js");

// const AllowanceDefinition = require("../models/allowanceDefinition.js");

const DeductionDefinition = require("../models/deductionDefinition.js");
const { Op } = require("sequelize");
const sequelize = require('../database/db');
const { Sequelize } = require('sequelize');
const Pension = require("../models/pension");
const ProvidentFund=require("../models/providentFund.js")
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

exports.createPayroll1 = async (req, res,next) => {
  try {
    const isProjectBased=req.user.isProjectBased;
    const { payrollDefinitionId, employeeIds } = req.body;

    const employeeID =employeeIds.map(id => parseInt(id));
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
        error: "employee not found",
        employees: nonExistingEmployeeIds,
      });
    }
    const errors = [];
    if(isProjectBased){
      const isTotalPercentEqual100= employees.every(employee => employee?.totalPercent === 100);
       if(!isTotalPercentEqual100){
         return next(createError.createError(400, "Some employees have not been fully assigned projects. Please ensure all employees are assigned projects totaling 100%."));
       }

       const payroll = await Payroll.findOne({
        where: {
          EmployeeId: employeeID,
          PayrollDefinitionId: payrollDefinitionId,
        },
      });

      if (payroll != null) {
        // return res.json("data")
        return next(createError.createError(409, "Payroll has already been run for one or more employees1."));
       
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
    if(!isProjectBased){
    let payrollCount = 0;
    await payrolldef.update({ status: "ordered" });
    for (const employeeId of employeeID) {
      try {
        const payroll = await Payroll.findOne({
          where: {
            EmployeeId: employeeID,
            PayrollDefinitionId: payrollDefinitionId,
          },
        });

        if (payroll != null) {
          // return res.json("data")
          return next(createError.createError(409, "Payroll has already been run for one or more employees."));
         
        }

        const resp = await runPayroll(req, res, {
          employeeId,
          company,
          payrollDefinitionId,
        });
    
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      console.log("error", errors);
      return next(createError(500, "There is a problem creating payroll " ));
    
    }
    ///
    // // Update total payroll count in the database
    // payrolldef.totalNoOfEmployee =
    //   Number(payrolldef.totalNoOfEmployee) + Number(payrollCount);
    // await payrolldef.save();

   
  }

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
      return res.status(200).json({
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
    await data.setCompany(Number(req.user.id))
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
    console.log("0i mhere from")
    const employees = await Employee.findAll({
    
      where:{CompanyId: req.user.id},
      include: [
        {
          model: Payroll,
          required: false,
          where: {
            PayrollDefinitionId: id, // Filter for payroll records of the specific month
          },
        },
        {
          model: EmployeeInfo,
          // attributes:['id',"basicSalary","grossEarning"],
          where: { isActive: true },
          required: false
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
          model: AccountInfo,
          where:{isActive:true},
          required: false,
          // attributes:['accountNumber','id']
        },
        {
          model: Loan,
          required: false
        },
       
        {
          model: AdditionalAllowances,
          include: [AdditionalAllowanceDefinition]
        },
        {
          model: AdditionalDeduction,
          include: [AdditionalDeductionDefinition]
        }
      ],
      where: {
        "$Payroll.id$": null, // Filter for records where the payroll ID is null
        CompanyId:req.user.id
      },
    });
    return res.status(200).json({ count: employees.length, employees });
  } catch (error) {
    res.status(500).json(error);
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
        id: employeeID,
      },
    });
    const existingEmployeeIds = employees.map((employee) => employee.id);
    console.log("existiongEmployeeIds: " + existingEmployeeIds);
    const nonExistingEmployeeIds = employeeID.filter(
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
      employeeID.map(async (employeeId) => {
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


exports.getNotApprovedPayroll= async (req,res,next)=>{
  try {
 
const approver= await Approver.findOne({
  where:{EmployeeId:req.user.id,
  isActive:true},
  include:{
    model: ApprovalMethod,
    as:"ApprovalMethod",
    where:{
      CompanyId:req.user.CompanyId,
      isActive:true,
    }

  }
})

if(approver?.ApprovalMethod === null){
  return next(createError.createError(400,'Define approval method first'))
}

const currentDate = new Date();
const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

const currentMonthPayrolls = await PayrollDefinition.findAll({
  where: {
    CompanyId: req.user.CompanyId,
    [Op.or]: [
      {
        startDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
        endDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      {
        startDate: {
          [Op.lt]: startOfMonth,
        },
        endDate: {
          [Op.gte]: startOfMonth,
        },
      },
    ],
  },
});

console.log("current month", currentMonthPayrolls.length);

if (currentMonthPayrolls.length === 0) {
  return res.status(204).json({
    message: "No payrolls defined for this month",
  });
} 
// return res.json({data:currentMonthPayrolls?.[0].id})
if(approver?.ApprovalMethod?.approvalMethod === 'horizontal'){
  const minimumApprovers=Number(approver.ApprovalMethod.minimumApprover);
  if(approver.isMaster){
    const payrolls = await Payroll.findAll({
      where:{
        status: {
          [Op.not]: ['approved','rejected'],  // Exclude payrolls with status 'approved'
        },
        PayrollDefinitionId:currentMonthPayrolls?.[0]?.id
      },
      include: [
                { model:Employee,
           attributes: ['id', 'fullname'] 
           
         },
           
        {
          model: EmployeePayrollApprovement,
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.literal('*')), 'approvalCount'],
          ],
          where: {
            status: 'approved',
          },
          required: false, // Keep this line
          duplicating: false,
        },
      ],
      group: ['Payroll.id'], // Add this line
      having: Sequelize.literal(`COUNT("EmployeePayrollApprovements"."id") = ${minimumApprovers}`),
      raw: true,
    });

    return res.status(200).json({
      success:true,
      data:payrolls
    })
  }




  const payrolls = await Payroll.findAll({
    where:{
      status: {
        [Op.not]: ['approved','rejected'],  // Exclude payrolls with status 'approved'
      },
      PayrollDefinitionId:currentMonthPayrolls?.[0]?.id
    },
    include: [
     { model:Employee,
      attributes: ['id', 'fullname'] 
    },
      {
        
                     
        model: EmployeePayrollApprovement,
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.literal('*')), 'approvalCount'],
        ],
        where: {
          status: 'approved',
        },
        required: false, // Keep this line
        duplicating: false,
      },
    ],
    group: ['Payroll.id'], // Add this line
    having: Sequelize.literal(`COALESCE(COUNT("EmployeePayrollApprovements"."id"), 0) < ${minimumApprovers}`),
    raw: true,
  });

  return res.status(200).json({
    success:true,
    data:payrolls
  })

  
return res.status(200).json({
  success:true,
  data:payrolls
})

}
if(approver?.ApprovalMethod?.approvalMethod === 'hierarchy'){
  const approvalLevel=Number(approver?.level);
  
  const companyApprovalLevel=approver?.ApprovalMethod?.approvalLevel;
  if(approver.isMaster){
    const payrolls = await Payroll.findAll({
      where:{
        status: {
          [Op.not]: ['approved','rejected'],  // Exclude payrolls with status 'approved'
        },
        PayrollDefinitionId:currentMonthPayrolls?.[0]?.id
      },
      include: [

        
          { model:Employee,
           attributes: ['id', 'fullname'] 
           
         },
           


        {
          model: EmployeePayrollApprovement,
           where: {
            status: 'approved',
            level:companyApprovalLevel
          },
          required: true, // Keep this line
          duplicating: false,
        },
      ],
      raw: true,
    });
  
    return res.status(200).json({
      success:true,
      data:payrolls
    })
  }
if(approvalLevel === 1){
  const payrolls= await Payroll.findAll({
    where: {
      status: {
        [Op.not]: ['approved','rejected'],  // Exclude payrolls with status 'approved'
      },
      PayrollDefinitionId:currentMonthPayrolls?.[0]?.id,
      id: {
        [Sequelize.Op.notIn]: Sequelize.literal(
          '(SELECT "PayrollId" FROM "EmployeePayrollApprovements")'
        ),
      },
    },
    include:[
      { model:Employee,
       attributes: ['id', 'fullname'] 
       
     }
       ]
  });
  // const payrolls = await Payroll.findAll({
  //   where:{
  //     status: {
  //       [Op.not]: ['approved','rejected'],  // Exclude payrolls with status 'approved'
  //     },
  //   },
  //   include: [
  //     {
  //       model: EmployeePayrollApprovement,
  //        where: {
  //         status: 'approved',
  //         level:1
  //       },
  //       required: true, // Keep this line
  //       duplicating: false,
  //     },
  //   ],
  //   raw: true,
  // });


  return res.status(200).json({
    success:true,
    data:payrolls
  })
}
else{
  const payrolls = await Payroll.findAll({
    where:{
      status: {
        [Op.not]: ['approved','rejected'],  // Exclude payrolls with status 'approved'
      },
    },
    include: [
      {
        model: EmployeePayrollApprovement,
         where: {
          status: 'approved',
          level:approvalLevel-1
        },
        required: true, // Keep this line
        duplicating: false,
      },
    ],
    raw: true,
  });

  return res.status(200).json({
    success:true,
    data:payrolls
  })

}
 

  
}

  } catch (error) {
    console.log("error", error);
    return next(createError.createError(500,"Internal server error"))
    
  }
}

exports.projectBasedPayroll= async(req,res,next)=>{

  // const transaction = await sequelize.transaction();
  try {
  const CompanyId= req.user.role ==="companyAdmin"? req.user.id:req.user.CompanyId;
    const {payrollDefinitionId,employeeIds}= req.body;
 const payrollDefinition = await PayrollDefinition.findByPk(payrollDefinitionId);

 if(!payrollDefinition){
  return next(createError.createError(404,"PayrollDefinition Not found"))
 }
    const employees = await Employee.findAll({
      where: {
        id: Number(employeeIds),
        CompanyId:CompanyId
      },include: [
        
        {
          model: Company,
          required: false,
          attributes:['id','companyCode','organizationName','numberOfEmployees','role','status']
        },

        {
          model: EmployeeInfo,
          required: false,
          where:{  isActive: true,}
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
            // where:{isActive:true}     
          },
          include:[Sponsor]
        },
       
        // {
        //   model: AccountInfo,
        //   required: false,
        //   where:{isActive:true}
        // },
      
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
        //   model: CustomRole,
        //   include: [Permission],
        // },
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
   // Check if all requested employees were found
   if (employees.length < employeeIds.length) {
    // Determine which employee(s) are missing
    const foundEmployeeIds = employees.map(employee => employee.id);
    const missingEmployeeIds = employeeIds.filter(id => !foundEmployeeIds.includes(id));

    console.error('One or more employees not found:', missingEmployeeIds);
    return next(createError.createError(404,"One or more employees not found"))
  }


  const pension =await Pension.findOne({
    where:{
      CompanyId:CompanyId,
      isActive:true
    }
  })
  const taxslabs = await Taxslab.findAll({
    where: {
      CompanyId: CompanyId,
      isActive: true
    }
  });
 
// let selectedSlab=null
// let income_tax_payable=0;
//   for (const slab of taxslabs) {
//     if (50000 >= slab.from_Salary && 50000 <= slab.to_Salary) {
//       selectedSlab=slab
//       income_tax_payable = slab.income_tax_payable;
//       deductible_Fee = slab.deductible_Fee;
//       break;
//     }
//   }
//   return res.json(selectedSlab);
  const employee_pension = pension?.employeeContribution ?? 0;
  const employer_pension = pension?.employerContribution ?? 0;
  

  const payrollRecords = employees.map(employee => {
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
    let additionalAllowance=0
    let taxableIncome=0;
    let grossEarning= 0;
    let selectedSlab=null
    let tax=0;
    taxableIncome=employee?.EmployeeInfos[0]?.basicSalary; 
    for (const slab of taxslabs) {
      if (taxableIncome >= slab.from_Salary && taxableIncome <= slab.to_Salary) {
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
      employee.Grades[0].Allowances.forEach(allowance => {
          totalAllowance += parseFloat(allowance.amount);
        });
      employee.Grades[0].Deductions.forEach(deduction => {
        totalDeduction += parseFloat(deduction.amount);
      });
    }
    if(employee.AdditionalAllowances.length>0){

      employee.AdditionalAllowances.forEach(allowance => {
        additionalAllowance += parseFloat(allowance.amount);
      });
    }
    if(employee.Loan){
  employee.Loan.forEach(loan => {
    totalLoan += parseFloat(loan.amount);
  });
  
 
 

    }

    return {
      employeeId: employee.id,
      payrollDefinitionId: payrollDefinition.id,
      amount: payrollAmount,
      totalAllowance: totalAllowance,
      totalDeduction:totalDeduction,
      additionalAllowance:additionalAllowance,
      totalLoan:totalLoan,
      taxableIncome: taxableIncome,
      grossEarning:employee?.EmployeeInfos[0]?.basicSalary+ totalAllowance+totalAdditionalPay + ((employee?.EmployeeInfos[0]?.basicSalary)*employer_pension/100)+additionalAllowance,
      employerContribution:(employee?.EmployeeInfos[0]?.basicSalary)*(employer_pension/100),
      additionalAllowance:additionalAllowance,
      deductible_Fee:deductible_Fee,
      income_tax_payable:income_tax_payable,
    };
  });


// const result = await runPayrollForProjectBased(req, res, { employeeIds, CompanyId, payrollDefinitionId });
return res.status(200).json({ success: true, payrollRecords  });

  } catch (error) {
    // await transaction.rollback();
    console.log(error)
     return next(createError.createError(500,"Internal server error"))    
  }
}


// async function runPayrollForProjectBased(
//   req,
//   res,
//   { employeeId, company, payrollDefinitionId }
// ) {
//   console.log("company", company);
// try {
  
// } catch (error) {
//   console.log(error)
//   return next(createError.createError(500,"Internal server error"))
  
// }
// }


async function runPayrollForProjectBased(
  req,
  res,
  { employeeId, company, payrollDefinitionId }
) {
  console.log("company", company);
  const transaction = await sequelize.transaction();
  
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
      console.log( "exemted amount: ",
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
    await Payroll.bulkCreate(payrollRecords, { transaction });

    // Commit the transaction
    await transaction.commit();

    console.log("Payroll processed successfully");
    return 1;
  } catch (error) {
    // Rollback the transaction if an error occurs
    await transaction.rollback();

    console.error("Error processing payroll:", error);
    return res.status(500).json({
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
  console.log("company", company);
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
      
      ProvidentFund.findOne({where: {
        CompanyId: company,
        isActive: true,
      },}),
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
    const employee_providentFund= providentFund?.employeeContribution??0;
    const employer_providentFund= providentFund?.employerContribution??0;

    const taxslabs = await Taxslab.findAll({
      where: { CompanyId: company, isActive: true },
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
    let taxableIncome=0;
    let grossSalary=0;

   taxableIncome= employee.EmployeeInfos[0]?.basicSalary,

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

    totalAllowance+=employee?.EmployeeInfos[0]?.basicSalary * ((employer_pension * 1) / 100).toFixed(2)
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
      taxableIncome *
          (income_tax_payable === 0 ? 1 : income_tax_payable / 100) -
        deductible_Fee;
    } else {
      totalTaxableIncome = 0;
    }
  grossSalary= totalAllowance +
  employee.EmployeeInfos[0]?.basicSalary ;
    loans.forEach((loan) => (totalLoan += loan?.amount));
    overallTotalDeduction =
      totalLoan +
      totalTaxableIncome +
      totalDeduction +
      employee.EmployeeInfos[0]?.basicSalary * ((employee_pension * 1) / 100)+
      employee.EmployeeInfos[0]?.basicSalary * ((employee_providentFund * 1) / 100);
    const payrollData = {
      grossSalary:grossSalary.toFixed(2),

      basicSalary: employee.EmployeeInfos[0]?.basicSalary,
      taxableIncome: taxableIncome,
      incomeTax:       totalTaxableIncome.toFixed(2),
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
        grossSalary -
        overallTotalDeduction 
        // totalExempted 

      ).toFixed(2),

      status: "processed",
    };
    // console.log("payroll Data", payrollData);
    const data = await Payroll.create({
      ...payrollData,
      PayrollDefinitionId: payrollDefinitionId,
      EmployeeId: employeeId,
    });
    await data.setCompany(Number(req.user.id))
    console.log("payroll data", payrollData);

    return 1;
  } catch (error) {
    console.log("from runpayroll ", error);

    return next(createError.createError(500,`error occur on empliyee with ID= ${employeeId}`))
    // return res.status(404).json({
    //   message: `error occur on empliyee with ID= ${employeeId}`,
    // });
  }
}