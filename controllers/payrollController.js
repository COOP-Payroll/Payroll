const { Worker } = require("worker_threads");
const PayrollDefinition = require("../models/payrollDefinition");
// const Payroll = require("../models/Payroll");
const Employee = require("../models/employee");
const WebSocket = require("ws");
const moment = require("moment");
const { Op } = require("sequelize");
const Grade = require("../models/grade.js");
const Allowance = require("../models/allowance.js");
const AllowanceDefinition = require("../models/allowanceDefinition");
const Deduction = require("../models/deduction");
const DeductionDefinition = require("../models/deductionDefinition.js");
const createError  = require("../utils/error.js");
const EmployeeGrade = require("../models/EmployeeGrade.js");
const Projects = require("../models/projects.js");
const AdditionalPay = require("../models/additionalPay.js");
const AdditionalPayDefinition = require("../models/additionalPayDefinition.js");
const AdditionalDeduction = require("../models/additionalDeduction.js");
const AdditionalDeductionDefinition = require("../models/additionlDeductionDefinition.js");
const AdditionalAllowance = require("../models/additionalAllowance.js");
const AdditionalAllowanceDefinition = require("../models/additionalAllowanceDefinition.js");
const Company = require("../models/company.js");
const EmployeeInfo = require("../models/employeInfo.js");
const Position = require("../models/position.js");
const EmployeePosition = require("../models/employeePosition.js");
const Department = require("../models/department.js");
const EmployeeDepartment = require("../models/EmployeeDepartment.js");
const Loan = require("../models/loan.js");
const Taxslab = require("../models/taxslab.js");
const Pension = require("../models/pension.js");
const ProvidentFund = require("../models/providentFund.js");
const Sponsor = require("../models/sponsor.js");
const ProjectEmployee = require("../models/project-employee.js");
const ProjectEmployeeHistory = require("../models/projectEmployeeHistory.js");
const Payroll = require("../models/Payroll.js");
let totalWorkers = 0;
let completedWorkers = 0;
let clients = [];

const runWorker = (employeeId, req, payrollDefinitionId) => {

  const worker = new Worker("./controllers/newWorker.js", {
    workerData: { user: req.user.id, employeeId, payrollDefinitionId },
  });

  const handleProgress = (message) => {
    console.log("first message", message);
    completedWorkers++;
    const progress = ((completedWorkers / totalWorkers) * 100).toFixed(2);
    const data = JSON.stringify({
      progress: progress,
      type: "progress",
      value: message.payroll,
    });

    clients.forEach((client) => {
      client.send(data);
    });

    if (completedWorkers === totalWorkers) {
      const completedMessage = JSON.stringify({ type: "completed" });
      clients.forEach((client) => {
        client.send(completedMessage);
      });
      completedWorkers = 0;
    }
  };

  const handleError = (error) => {
    completedWorkers++;
    let errorMessage = `An error occurred while calculating payroll for ${employeeId}`;

    if (error.name === "SequelizeForeignKeyConstraintError") {
      errorMessage = `${employeeId} employee does not exist!`;
    }
    const progress = ((completedWorkers / totalWorkers) * 100).toFixed(2);
    const data = JSON.stringify({
      progress: progress,
      type: "failed",
      error: errorMessage,
      value: error.payroll,
    });

    clients.forEach((client) => {
      client.send(data);
    });

    if (completedWorkers === totalWorkers) {
      const completedMessage = JSON.stringify({ type: "completed" });
      clients.forEach((client) => {
        client.send(completedMessage);
      });
      completedWorkers = 0;
    }
  };

  worker.on("message", handleProgress);
  worker.on("error", handleError);
};

exports.createPayroll = async (req, res) => {
  const { payrollDefinitionId, employeeIds } = req.body;
  const payrolldef = await PayrollDefinition.findByPk(payrollDefinitionId);
  totalWorkers = employeeIds.length;

  if (!payrolldef) {
    return res.status(404).json({ error: "payroll is not defined" });
  }

  res.writeHead(200, {
    "Content-Type": "text/plain",
  });

  const ws = new WebSocket.Server({ port: 8080 });


 
// console.log("websocket",ws);
  ws.on("connection", (client) => {
    console.log("hey");
    clients.push(client);
    client.on("close", () => {
      clients = clients.filter((c) => c !== client);
    });
  });

  res.on("close", () => {
    ws.close();
  });
  // employeeIds.forEach((employeeId) => console.log("employeeId", employeeId));

  employeeIds.forEach((employeeId) =>
    runWorker(employeeId, req, payrollDefinitionId)
  );

  if (completedWorkers === totalWorkers) {
    const completedMessage = JSON.stringify({ type: "completed" });
    clients.forEach((client) => {
      client.send(completedMessage);
    });
    completedWorkers = 0;
  }
};

exports.getAllPayrollByCompanyId = async (req, res) => {
  const { id } = req.params;
  const payrollDef = await PayrollDefinition.findByPk(id);
  if (!payrollDef) return res.status(404).json({ error: "payroll not found" });
  const payrolls = await Payroll.findAll({
    where: { PayrollDefinitionId: Number(id) },
    include: [Employee, PayrollDefinition],
  });
  return res.status(200).json({
    count: payrolls.length,
    payrolls,
  });
};

exports.getNonPayrollEmployee = async (req, res) => {
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

exports.getAllPayroll = async (req, res, next) => {
  try {
    const { payrollDefinitionId } = req.body;

    const getAllPayroll = await Payroll.findAll();

    res.status(200).json({
      count: getAllPayroll.length,
      getAllPayroll,
    });
  } catch (error) {
    console.error("Error creating company account info:", error);

 return next(createError.createError(500,"Internal server Error"))
  }
};


exports.getAllEmployeePayroll = async (req, res,next) => {
  try {
    const { id } = req.params;
    const payrollDef = await PayrollDefinition.findByPk(id);
    if (!payrollDef)
      return res.status(404).json({ error: "Payroll is not found" });
    // Fetch employees with and without payroll information for the specific month
    const employees = await Employee.findAll({
         include: [
        {
          model: Payroll,
          required: false,
          where: {
            PayrollDefinitionId: Number(id), // Filter for payroll records of the specific month
          },
        },
      ],
    });
    return res.json({
      status:"true",
     data: employees,
    });
  } catch (error) {
    console.log(error);
return next(createError.createError(500,"Internal server Error")
)

  }
};

exports.employeePaySlip = async (req, res, next) => {
  try {
    const id = req.params.id;
    const payrolls = await Payroll.findAll({
      where: { EmployeeId: id },
      //  include: [Employee, PayrollDefinition],
    });
    if (payrolls.length === 0) {
      return res.status(404).json("there is no payroll ");
    } else {
         res.status(200).json({
        count: payrolls.length,
        payrolls,
        createdDate: moment(payrolls[0].createdAt).format("YYYY-MM-DD"),
      });
    }
  } catch (error) {
    next(error);
  }
};


exports.payrollDraft= async(req,res,next)=>{
  try {
    const CompanyId=req.user.id;
    const Employees = await Employee.findAll({
      where: { CompanyId: req.user.id},
      include: [
       
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
          include:[Sponsor]
    
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
    

        {
          model: AdditionalAllowance,
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
const taxslabs= await Taxslab.findAll({
  where:{
    CompanyId:req.user.id,
    isActive:true
  }
})

const pension= await Pension.findOne({
  where:{
CompanyId:CompanyId,
isActive:true
  }
})
const providentFund= await ProvidentFund.findOne({
  where:{
    CompanyId:CompanyId,
    isActive:true
  }
})
const employee_pension = pension?.employeeContribution ?? 0;
const employer_pension = pension?.employerContribution ?? 0;

const employee_providentFund=providentFund.employeeContribution ?? 0;
const employer_providentFund=providentFund.employerContribution ?? 0;

// return res.json(pension)
    const data = Employees.map(employee => {

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
      // totalTaxable += Number(employee?.EmployeeInfos[0]?.basicSalary);
      for (const slab of taxslabs) {
        if (taxableIncome >= slab.from_Salary && taxableIncome <= slab.to_Salary) {
          selectedSlab = slab;
          income_tax_payable = slab.income_tax_payable;
          deductible_Fee = slab.deductible_Fee;
          break;
        }
      }
  
    
      const payrollAmount = employee?.EmployeeInfos[0]?.grossEarning;

      if (employee.Grades.length > 0) {
        employee.Grades[0].Allowances.forEach(allowance => {
            totalAllowance += parseFloat(allowance.amount);
          });
        employee.Grades[0].Deductions.forEach(deduction => {
          totalDeduction += parseFloat(deduction.amount);
        });
      }
      console.log(totalAllowance)
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

      totalAllowance+=  additionalAllowance+  employee.EmployeeInfos[0]?.basicSalary * ((employer_pension * 1) / 100)
      overallTotalDeduction =
      totalLoan +
      totalTaxableIncome +
      totalDeduction +
      employee.EmployeeInfos[0]?.basicSalary * ((employee_providentFund * 1) / 100)+
      employee.EmployeeInfos[0]?.basicSalary * ((employee_pension * 1) / 100);
      // Destructure the employee object excluding the password field
      const { password, ...Employees } = employee.dataValues;
      grossSalary= (      totalAllowance +
        employee.EmployeeInfos[0]?.basicSalary 
      ).toFixed(2)
      // If there are nested associations, remove passwords from them as well
      if (Employees.Companys) {
        sanitizedEmployee.Companys = sanitizedEmployee.Companys.map(info => {
          const { password, ...sanitizedInfo } = info.dataValues;
          return sanitizedInfo;
        });
      }
    
      // Similarly, sanitize other nested associations if needed
    
      return {...Employees,
        grossEarning:grossSalary   ,
        totalAllowance:totalAllowance,
        tax:totalTaxableIncome.toFixed(2),
        totalDeduction:overallTotalDeduction.toFixed(2)
        };
    });
    

    res.status(200).json({
      success:true,
     data
    });
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
  }
}


exports.payrollDraft1= async(req,res,next)=>{
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    
    const currentMonthPayrolls = await PayrollDefinition.findAll({
      where: {
        CompanyId: req.user.id,
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
    
    console.log("current month", currentMonthPayrolls);
    
    if (currentMonthPayrolls.length === 0) {
      return res.status(204).json({
        message: "No payrolls defined for this month",
      });
    } 

    // return res.json(currentMonthPayrolls[0]?.id)



    const payrollData= await Payroll.findAll({
      where:{
        CompanyId:req.user.id,
        PayrollDefinitionId:currentMonthPayrolls[0]?.id,
        status: {
          [Op.or]: ["processed", "pending"]
        },
        // 
        // isActive:true,

      },
      include:[
       { model:Employee,
        attributes: ['id', 'fullname'] 
        
      }
        ]
    })

    return res.status(200).json({
      success:true,
      data:payrollData
    })
  } catch (error) {
    return createError.createError(500,"Internal server error")
    
  }
}


exports.getPayrollPerProject= async (req,res,next)=>{
  try {

    const projectId= req?.params?.projectId
    const payrollDefinitionId=req?.body?.payrollDefinitionId;

    if(!payrollDefinitionId){
      return next(createError.createError(400, "payroll Definition id is required"))
    }


    // const payroll= await ProjectEmployee.findOne(
    // {
    // where:{ProjectId: projectId},
    // include: {
    //   model: Employee,
    //   attributes: { exclude: ['password'] },
    // }
    // }
    // )

    // const responseData = {
    //   fullname: payroll.Employee.fullname,
    //   email: payroll.Employee.email,
    //   gross: payroll.gross,
    // };

const payroll1= await Payroll.findAll({
  attributes:['id'],  
  where:{
    PayrollDefinitionId:payrollDefinitionId,
  },
  include:[
   { model:Employee,
    attributes:['id'],
     include: [
      {
        model:ProjectEmployee,
        where:{
          ProjectId:projectId
        },
        attributes:['id']
      },
      {
        model:ProjectEmployeeHistory,
        where:{
          ProjectId:projectId
        },
        attributes:['id']
      }
     ]
  }]
})



    return res.status(200).json({
      success:true,
      data:payroll1
    })
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error") )
  }
}