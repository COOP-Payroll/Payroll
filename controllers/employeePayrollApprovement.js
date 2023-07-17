const { EmployeePayrollApprovement } = require("../models/employeePayrollApprovement");
const { Op } = require("sequelize");
//define model needed here {approvamethod}
const ApprovalMethod = require('../models/approvalMethod')
const Payroll = require('../models/Payroll')
const PayrollDefinition = require('../models/payrollDefinition');
const Approver = require("../models/approver");

// Controller actions
const getAllApprovements = async (req, res) => {
  try {
    // const approvements = await EmployeePayrollApprovement.findAll();
    res.json("approvements");
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
  const companyId = req.user.id; // Company ID
  const payrollId = req.body.Payrolls;
  const approverId = req.body.approverId;
  try {
    //check if payroll exitst and processed
    const payroll = await Payroll.findOne({
      where: {
        id: payrollId,
        status: "processed",
      },
    });

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
    //does this payroll processed
    const payrolls = await Payroll.findOne({
      attributes: ["PayrollDefinitionId"],
      where: {
        id: payrollId,
        status: "processed",
      },
    });
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
          return res.json("hieranchy");
        } else if (companyApprovalMethod === "horizontal") {
          return res.json("horizontal");
        } else {
          return res.json("sorry, ");
        }
      } else {
        //check if i am master approver
        if (!amIMasterApprover) {
          return res.json("i am not master approver");
        }else if(amIMasterApprover){
          return res.json("i am  master approver");
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
