const PayrollApprovement = require('../models/payrollApprovement');
const Approver = require('../models/approver')
const ApprovalMethod = require("../models/approvalMethod");
const PayrollDefinition = require('../models/payrollDefinition');
//reusable function for payroll approvement
async function handlePayrollApproval(payrollId, approverId, level, status,payrollStatus) {
    try {
      const approve1 = await PayrollApprovement.create({
        level,
        status,
    });
    const PayrollDefinitionId =payrollId;
    const  ApproverId =approverId;
      const payroll = await PayrollDefinition.findByPk(payrollId);
      if (!payroll) {
        throw new Error("Payroll not defined");
      }
      payroll.status = payrollStatus;
      await payroll.save();
      //await approve1.save();
      await approve1.setPayrollDefinition(PayrollDefinitionId);
      await approve1.setApprover(ApproverId);
      console.log("approved sucessfully", approve1);
      return {
        message:"successfully approved",
        change:approve1,
        ApprovedPayrollId:payroll,
      }
      
    } catch (error) {
      console.log("An error occurred:", error.message);
      throw error;
    }
  };
//approve for horizontal one 
async function handleHorizontalApprove(payrollId, approverId,minimumApprover,approverLevel,approverRole,payrollStatus) {
    // const PayrollApprovementId =payrollId;
    // const ApproverId  = approverId
    try {
    const approvedBy = await PayrollApprovement.count({
      where: { PayrollDefinitionId: payrollId },
    });
    const leftApprover = minimumApprover - approvedBy;

    if (minimumApprover > approvedBy) {
      const isLastApprover = leftApprover - 1;

      if (isLastApprover === 0) {
        const payroll = await PayrollDefinition.findByPk(payrollId);
        if (!payroll) {
          return { message: "Payroll not found" }
        }
            //approve for last 
            console.log("approve now  to last approver")
            const status= "approved";
            const level=0;
            const payrollStatus='approved'
            console.log("sent to last approver")
            const result = await handlePayrollApproval(payrollId, approverId, level, status,payrollStatus)
            console.log(result)
      } else {
        const payroll = await PayrollApprovement.findByPk(payrollId);
        if (!payroll) {
          return {message: "Payroll not found"} 
        }

        //approve for other 
        console.log("approve now  to last approver")
        const status= "approved";
        const level=0;
        const payrollStatus='pending'
        console.log("sent to last approver")
        const result = await handlePayrollApproval(payrollId, approverId, level, status,payrollStatus)
        console.log(result)
      }
    } else {
      return "it is already approved";
    }
  } catch (error) {
    console.log("An error occurred:", error.message);
    throw error;
  }
     
  };

  //approve for hierarchy 
async function handleHierarchicalApprove(payrollId, approverId,companyApprovalLevel,approverLevel,approverRole,payrollStatus) {
    try {
        if(payrollStatus==='created'){
            
            console.log("this payroll is not ordered yet ");
            return {Message:"this payroll is not ordered yet" }
        }else if(payrollStatus==='approved'){
            console.log("approved ");
            return  "it is already approved"
        }else if(payrollStatus==='ordered'){
            // console.log("ordered ");
             const appLevel=Number(approverLevel);
            if(appLevel !==1){
                
                const whoseTurn = await Approver.findOne({ where: { level: 1 } });
                
                console.log(approverLevel)
                console.log(`${whoseTurn.role} should approve before`)
                return 
                    {message: `${whoseTurn.role} should approve before`}
            
            }else{
                //approve for level one 
                console.log("approve now")
                const status= "approved";
                const level=1;
                const payrollStatus='pending'
                console.log("sent to approve 1")
                
                const result = await handlePayrollApproval(payrollId, approverId, level, status,payrollStatus)
                //console.log(payrollId,approverId,level,status,payrollStatus,"goto level 1")
            }
        }else if(payrollStatus==='pending'){
            const payrollApprovalCount = await PayrollApprovement.count({
                where: {
                    level: 2,
                    PayrollDefinitionId: payrollId,
                    status: "approved",
                },
            });
            if(payrollApprovalCount<1){
                if(Number(approverLevel)!==2){
                    if(approverLevel===1){
                        return {message:"payroll alraldy approved at your level "}
                    }else if(Number(approverLevel)===3){
                        return {message: `${whoseTurn.role} should approve before you`,}
                    }else{
                        return {message: "unknown level of approver",}
                    }
                }else{
                    //approve for level  two 
                    console.log("approve now for two ")
                    const status= "approved";
                    const level=2;
                    const payrollStatus='pending'
                    console.log("sent to approve 2")
                    if(companyApprovalLevel===3){
                        const payrollStatus='pending'
                        const result = await handlePayrollApproval(payrollId, approverId, level, status,payrollStatus)
                    }else if(companyApprovalLevel===2){
                        const payrollStatus='approved'
                        const result = await handlePayrollApproval(payrollId, approverId, level, status,payrollStatus)
                    }else{
                        console.log("approval level of company is out of scope")
                    }
                }
            }else if(Number(approverLevel)===3){
                //approve for level  two 
                console.log("approve now for three ")
                const status= "approved";
                const level=3;
                const payrollStatus='approved'
                console.log("sent to approve 3")
                const result = await handlePayrollApproval(payrollId, approverId, level, status,payrollStatus)
                console.log(result) 

            }else{
                console.log("approved at your level already")
            }
        }else{
            return "something is wrong unknown status "
        }
    
    } catch (error) {
        console.log({ error: error})
        return {error:error}
    }
    
  };
// const payrollApprovement = await PayrollApprovement.create(req.body);
// const result = await handlePayrollApproval(payrollId, approverId, level, status);
// console.log(result);
// res.status(201).json(payrollApprovement);
// Create a new payrollApprovement

const createPayrollApprovement = async (req, res) => {
        const payrollId = req.body.payrollId;
        const approverId = req.body.approverId;

    try {
        //grap required information 1 approval method of company  2 appreover info 3 payroll information
        const payroll = await PayrollDefinition.findOne({
            where: { id: payrollId },
        });
        const CompanyIdPayroll = payroll.CompanyId;
        const payrollStatus    = payroll.status;

        console.log(CompanyIdPayroll,payrollStatus,"payroll")
        //approval method 
        const approvalMethod = await ApprovalMethod.findOne({
            where: { id: payrollId },
        });
        const minimumApprover          = approvalMethod.minimumApprover;
        const isThereMasterApprover     = approvalMethod.isThereMasterApprover
        const companyApprovalMethod     = approvalMethod.approvalMethod;
        const isApprovalMethodCompleted = approvalMethod.isCompleted;
        const companyApprovalLevel      = approvalMethod.approvalLevel;
        console.log(companyApprovalLevel,companyApprovalMethod,isApprovalMethodCompleted,"approval method");
        //approver 
        const approver = await Approver.findOne({
            where: { id: approverId },
        });
        
        const approverLevel = approver?.level;
        const approverRole   = approver.role;
        const isApproverActive = approver.isActive;
        const isApproverMaster  = approver.isMaster;
        console.log("approver", isApproverActive,approverLevel)
        
        if(!isApprovalMethodCompleted){
            res.json(
                {
                    Message:"approval method set app is not completed! your admin should complete once ",
                }
            );
        }else{
            if(!isApproverActive){
                res.json("this account is not active to approve contact your admin");
            }else{
                if(!isThereMasterApprover){
                    //if no master approver 
                    if(companyApprovalMethod==='horizontal'){ 
                        const result = await handleHorizontalApprove(payrollId, approverId,minimumApprover,approverLevel,approverRole,payrollStatus );
                        console.log(" horizontal  result");
                    }else if(companyApprovalMethod==='hierarchy'){
                        const result = await handleHierarchicalApprove(payrollId, approverId,companyApprovalLevel,approverLevel,approverRole,payrollStatus );
                        console.log("hierarchy result");
                        //console(result);
                    }else{
                        return res.json({"error":error,
                                        Message:"undefined Approval method"
                    })
                    }
                }else{
                    //if master approval method there
                    if(!isApproverMaster){
                        if(companyApprovalMethod==='horizontal'){ 
                            const result = await handleHorizontalApprove(payrollId, approverId,minimumApprover,approverLevel,approverRole,payrollStatus );
                            console.log(" horizontal  result");
                        }else if(companyApprovalMethod==='hierarchy'){
                            const result = await handleHierarchicalApprove(payrollId, approverId,companyApprovalLevel,approverLevel,approverRole,payrollStatus );
                            console.log("hierarchy result");
                        }else{
                            return res.json({"error":error,
                                            Message:"undefined Approval method"
                        })
                        }
                    }else{
                        //do if the approver is master
                        try {
                            const isApproved = await PayrollDefinition.count({
                                where: {
                                CompanyId: CompanyIdPayroll,
                                id: payrollId,
                                status: "approved",
                                },
                            });
                        
                            if (isApproved < 1) {
                                return "Payroll should be approved first by other approver";
                            } else {
                                await PayrollDefinition.update(
                                { status: "active" },
                                {
                                    where: {
                                    id: payrollId,
                                    },
                                }
                                );
                        
                                return "Payroll is activated successfully";
                            }
                            } catch (error) {
                            console.log("An error occurred:", error.message);
                            throw error;
                            }

                    }
                }
            }

        }
        

    } catch (error) {
        console.log("An error occurred:", error.message);
    }
};

// Get all payrollApprovements
const getAllPayrollApprovements = async (req, res) => {
    
    const CompanyId= req.user.id;
    //console.log(CompanyId);
    try {
        const criteria = {
            where: { CompanyId },
          };
        const payrollApprovements = await PayrollApprovement.findAll();

        res.json({
            count:payrollApprovements.length,
            payrollApprovements:payrollApprovements
        });
    } catch (error) {
        console.error('Error getting payrollApprovements:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a specific payrollApprovement by ID
const getPayrollApprovementById = async (req, res) => {
   
  const { id } = req.params;
  try {
    const payrollApprovement = await PayrollApprovement.findByPk(id);
    if (payrollApprovement) {
      res.json(payrollApprovement);
    } else {
      res.status(404).json({ error: 'PayrollApprovement not found' });
    }
  } catch (error) {
    console.error('Error getting payrollApprovement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a specific payrollApprovement by ID
const updatePayrollApprovement = async (req, res) => {
    console.log("update id PayrollApprovement")
  const { id } = req.params;
  try {
    const payrollApprovement = await PayrollApprovement.findByPk(id);
    if (payrollApprovement) {
      await payrollApprovement.update(req.body);
      res.json(payrollApprovement);
    } else {
      res.status(404).json({ error: 'PayrollApprovement not found' });
    }
  } catch (error) {
    console.error('Error updating payrollApprovement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a specific payrollApprovement by ID
const deletePayrollApprovement = async (req, res) => {
    console.log("delete id PayrollApprovement")
  const { id } = req.params;
  try {
    const payrollApprovement = await PayrollApprovement.findByPk(id);
    if (payrollApprovement) {
      await payrollApprovement.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'PayrollApprovement not found' });
    }
  } catch (error) {
    console.error('Error deleting payrollApprovement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createPayrollApprovement,
  getAllPayrollApprovements,
  getPayrollApprovementById,
  updatePayrollApprovement,
  deletePayrollApprovement,
};
