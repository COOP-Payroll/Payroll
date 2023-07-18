const EmployeePayrollApprovement  = require("../models/employeePayrollApprovement");
const { Op } = require("sequelize");
//define model needed here {approvamethod}
const ApprovalMethod = require('../models/approvalMethod')
const Payroll = require('../models/Payroll')
const PayrollDefinition = require('../models/payrollDefinition');
const Approver = require("../models/approver");
const Employee = require("../models/employee");

// Controller actions
const getAllApprovements = async (req, res) => {
  try {
     const approvements = await EmployeePayrollApprovement.findAll();
    res.json(approvements);
    console.log("approvements")

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getApprovementById = async (req, res) => {
  const { id } = req.params;
  try {
    const approvement = await EmployeePayrollApprovement.findByPk(id);
    if (!approvement) {
      return res.status(404).json({ message: "Approvement not found" });
    }
    res.json(approvement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createApprovement = async (req, res) => {
  // Define constant variable here for this endpoint
  const companyId = Number(req.user.id); // Company ID
  const payrollId = Number(req.body.Payrolls);
  const approverId = Number(req.body.approverId);
  
  try {
    //check if payroll exitst and processed
    const payroll = await Payroll.findOne({
      where: {
        id: payrollId,
        // status: "processed",
      },
    });
    if(!payroll){
      return "no such a payroll created"
    }
    const employeeId=Number(payroll.EmployeeId)
    
    //approval method
    const approvalMethods = await ApprovalMethod.findOne({
      where: {
        CompanyId: companyId,
        isActive: true,
      },
    });

    //is master approval
    const isThereMaster = await ApprovalMethod.findOne({
      where: {
        CompanyId: companyId,
        isActive: true,
        isThereMasterApprover: true,
      },
    });

    if(approvalMethods===null || approvalMethods===undefined){
      return res.json("this company has no active approval method pleaase define one ")
    }
   
    //does this payroll processed//rejected
    const payrolls = await Payroll.findOne({
        where: {
          id: payrollId,
        }
    });
    if (!payrolls) {
      return'Payroll record not found';
    }
    
 
   
    //what is status of definition
    const payrollDefinitionId = payrolls.PayrollDefinitionId;

    const payrollDefinition = await PayrollDefinition.findOne({
      attributes: ["status"],
      where: {
        id: payrollDefinitionId,
      },
    });

    //am i approver
    const iAmApprover = await Approver.findOne({
      where: {
        id: approverId,
        isActive: true,
      },
    });
    if(iAmApprover===null || iAmApprover===undefined){
      return res.json("access denied, you are not active approver")
    }
    const approverLevel= iAmApprover.level;
    //am i master approver
    const iAmMasterApprover = await Approver.findOne({
      where: {
        id: approverId,
        isActive: true,
        isMaster: true,
      },
    });


    //checking for company approval method
    const hasActiveApprovalMethods =
      approvalMethods !== null && approvalMethods !== undefined;
    const isMasterApproverAvailable =
      isThereMaster !== null && isThereMaster !== undefined;
    const companyApprovalMethod = approvalMethods.approvalMethod;
    const companyApprovalLevel = approvalMethods.approvalLevel;
    const companyMinimumApprover = approvalMethods.minimumApprover;
    const isComplete = approvalMethods.isCompleted;
    if(isComplete!==true){
      return res.json("the appoval method is not completed contact your admin ");
    }

    //checkjing for payroll
    const isPayrollProcessed = payroll !== null && payroll !== undefined;

    //checking for payrolldefinition
    const isPayrollDefinitionOrdered =
      payrollDefinition !== null && payrollDefinition !== undefined;
    const payrollDefinitionStatus = payrollDefinition.status;
    //checking on approver
    const amIActiveApprover = iAmApprover !== null && iAmApprover !== undefined;
    const amIMasterApprover =
      iAmMasterApprover !== null && iAmMasterApprover !== undefined;
    //check if approved by me
   
    const employepayrollapprove = await EmployeePayrollApprovement.count({
      where: {
        ApproverId: approverId,
        PayrollId: payrollId
      }
    });
    if(employepayrollapprove>=1){
      return res.json("you already approved this")
    }
  //do algorithm now 
    if (hasActiveApprovalMethods) {
      //check if payroll ordered
      if (payrollDefinitionStatus !== "ordered") {
        return res.json("sorry,this payroll is not ordered yet!");
      }
      //check if i am active
      if (!amIActiveApprover) {
        return res.json(
          "sorry, Your account does not have the necessary permissions to proceed"
        );
      }
      //check if company has master approver
      if (!isMasterApproverAvailable) {
        //check approval method of company
        
        if (companyApprovalMethod === "hierarchy") {
          //call herarchical method
          const eachPayrollStatus=payrolls.status;
          
          const herreturn = await handleHierarchicalApprove(
            companyId,
            companyMinimumApprover,
            companyApprovalLevel,
            eachPayrollStatus,
            isPayrollDefinitionOrdered,
            payrollId,
            approverId,
            approverLevel,
            employeeId
          );
          return res.json(herreturn);
        } else if (companyApprovalMethod === "horizontal") {
          //call horizontal method
          const horreturn = await handleHorizontalApprove(
            companyId,
            companyMinimumApprover,
            companyApprovalLevel,
            eachPayrollStatus,
            isPayrollDefinitionOrdered,
            payrollId,
            approverId,
            approverLevel,
            employeeId
          );
          return res.json(horreturn);
        } else {
          return res.json("sorry, undefined approval method");
        }
      } else {
        //check if i am master approver
        
        if (!amIMasterApprover) {
          //check approval method of company
          if (companyApprovalMethod === "hierarchy") {
            //call herarchical method
            
            const herreturn = await handleHierarchicalApprove(
              companyId,
              companyMinimumApprover,
              companyApprovalLevel,
              eachPayrollStatus,
              isPayrollDefinitionOrdered,
              payrollId,
              approverId,
              approverLevel,
              employeeId
            );
            return res.json(herreturn);
          } else if (companyApprovalMethod === "horizontal") {
            //call herarchical method
            const horreturn = await handleHorizontalApprove(
              companyId,
              companyMinimumApprover,
              companyApprovalLevel,
              isPayrollProcessed,
              isPayrollDefinitionOrdered,
              payrollId,
              approverId,
              approverLevel,
              employeeId
            );
            return res.json(horreturn);
          } else {
            return res.json("sorry, undefined approval method");
          }

        } else if (amIMasterApprover) {
          //check payroll is approved
          
        }
      }
    } else {
      return res.json("your approval method is not active");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function handleHierarchicalApprove(
  companyId,
  companyMinimumApprover,
  companyApprovalLevel,
  eachPayrollStatus,
  isPayrollDefinitionOrdered,
  payrollId,
  approverId,
  approverLevel,
  employeeId
) {
  
  // payrollId=payrollId;
  console.log(eachPayrollStatus)
  //do prove hierarchy method
  if (!isPayrollDefinitionOrdered) {
    return "this payroll not ordered";
  }
  //check if status is ordered or rejected
  const allowedStatuses = ["ordered", "processed"];
  if (eachPayrollStatus === "approved") {
    //do if already approved
    return "this payroll already approved";
  } else if (allowedStatuses.includes(eachPayrollStatus)) {
    
    //check if you are level one
    if (Number(approverLevel) !== 1) {
      return "level 1 approver should approve first";
    }
    //approve on employeepayroll and pend on payroll
    const updatePayroll = await Payroll.findOne({
      where: {
        id: payrollId,
      },
    });
    if (!updatePayroll) {
      return "Payroll record not found";
    }
    // Modify the payroll record properties
    payrollId =payrollId
    const eachPayrollStatus = 'pending'
    const employeestatus = 'approved'
    const level = 1
    const approvedDate = new Date()
    
    console.log(companyId)
    // call approve handler
    const approveResult = handlePayrollApprove(payrollId,eachPayrollStatus,employeestatus,level,approvedDate,approverId,employeeId,companyId);
    return approveResult;

  } else if (eachPayrollStatus === "pending") {
   
    //check if approver is not level 2
    if(Number(approverLevel) !==2){
      if (Number(approverLevel) === 1) {
        return "payroll is approved at your level"
      } else if (Number(approverLevel) === 3) {
        //check if approver level  approved it 
        const isTwoApprove = EmployeePayrollApprovement.count({
          where:{
            level:2,
            PayrollId:payrollId,
          }
        })
        if(isTwoApprove<1){
          return "level 2 should approve before you"
        }
        //get to handle for level three 
        const updatePayroll = await Payroll.findOne({
          where: {
            id: payrollId,
          },
        });
        if (!updatePayroll) {
          return "Payroll record not found";
        }
        // Modify the payroll record properties
        payrollId =payrollId
        const eachPayrollStatus = 'approved'
        const employeestatus = 'approved'
        const level = 3
        const approvedDate = new Date()

        const approveresult=handlePayrollApprove(payrollId,eachPayrollStatus,employeestatus,level,approvedDate,approverId,employeeId,companyId);
        return approveresult;

      }else{
        return "something went wrong please try again"
      }
    }else if(Number(approverLevel)===2){
      //check for company approval level
      if(Number(companyApprovalLevel)===2){
            //approve on employeepayroll and approve on payroll
        const updatePayroll = await Payroll.findOne({
          where: {
            id: payrollId,
          },
        });
        if (!updatePayroll) {
          return "Payroll record not found";
        }
        // Modify the payroll record properties
        payrollId =payrollId
        const eachPayrollStatus = 'approved'
        const employeestatus = 'approved'
        const level = 2
        const approvedDate = new Date()

        const approveresult=handlePayrollApprove(payrollId,eachPayrollStatus,employeestatus,level,approvedDate,approverId,employeeId,companyId);
        return approveresult;
      }else if(Number(companyApprovalLevel)===3){
          //approve on employeepayroll and approve on payroll
        const updatePayroll = await Payroll.findOne({
          where: {
            id: payrollId,
          },
        });
        if (!updatePayroll) {
          return "Payroll record not found";
        }
        // Modify the payroll record properties
        payrollId =payrollId
        const eachPayrollStatus = 'pending'
        const employeestatus = 'approved'
        const level = 2
        const approvedDate = new Date()

        const approveresult=handlePayrollApprove(payrollId,eachPayrollStatus,employeestatus,level,approvedDate,approverId,employeeId,companyId);
        return approveresult;
      }
    }

  } else{
    return {message:"undefined payroll status"};
  }
}

async function handleHorizontalApprove(
  companyId,
  companyMinimumApprover,
  companyApprovalLevel,
  eachPayrollStatus,
  isPayrollDefinitionOrdered,
  payrollId,
  approverId,
  approverLevel,
  employeeId
){
  return {
    message: "handle horizontal any way",
    companyMinimumApprover: companyMinimumApprover,
    companyApprovalLevel: companyApprovalLevel,
    isPayrollProcessed: isPayrollProcessed,
    isPayrollDefinitionOrdered: isPayrollDefinitionOrdered,
    payrollId: payrollId,
    approverId: approverId,
    approverLevel: approverLevel,
  };
}
async function handlePayrollApprove(payrollId,eachPayrollStatus,employeestatus,level,approvedDate,approverId,employeeId,companyId){
      // const payrollId=payrollId
      // const eachPayrollStatus= eachPayrollStatus
      // const employeestatus= employeestatus
      // const level= level
      // const approvedDate= approvedDate

     // Find the employee record by ID
     console.log("companyId")
    const payroll = await Payroll.findByPk(payrollId);
    if (!payroll) {
      return'Employee not found';
    }
    
    await payroll.update({ status: eachPayrollStatus });
    // Create a new EmployeePayrollApprovement record associated with the updated payroll
     const newApprovement = await EmployeePayrollApprovement.create({
      status: employeestatus,
      remark: "",
      level: level,
      approvedDate: approvedDate,
      PayrollId: payrollId,
      ApproverId:approverId,
      EmployeeId:employeeId,
      CompanyId:companyId
    });

    return {approvement:newApprovement,payroll:payroll}
}

const updateApprovement = async (req, res) => {
  
  try {
    const approvement = await EmployeePayrollApprovement.findByPk(id);
    if (!approvement) {
      return res.status(404).json({ message: "Approvement not found" });
    }
    res.json("update approve")
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteApprovement = async (req, res) => {
  
  try {
    const approvement = await EmployeePayrollApprovement.findByPk(id);
    if (!approvement) {
      return res.status(404).json({ message: "Approvement not found" });
    }
    
    res.status(204).json("deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllApprovements,
  getApprovementById,
  createApprovement,
  updateApprovement,
  deleteApprovement,
};
