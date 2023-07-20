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
    const approvement = await Payroll.findAll({
      where: {
        PayrollDefinitionId: id,
      },
    });
    if (!approvement) {
      return res.status(404).json({ message: "Approvement not found" });
    }
   res.json(approvement)
    
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
          const eachPayrollStatus=payrolls.status;

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

        } else if (amIMasterApprover) {
          //check payroll is approved
          const isApproved = await Payroll.findOne({
            where: {
              id: payrollId,
              status: 'approved',
            },
          });
          const isActivated = await Payroll.findOne({
            where: {
              id: payrollId,
              status: 'active',
            },
          });
          if(isActivated){
            return res.json("already activated")
          }
          if (!isApproved) {
           return res.json("not approved")
          }
          await isApproved.update({ status: 'active' });
          return res.json("payroll activated  successfully");
        }
      }
    } else {
      return res.json("your approval method is not active");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getApprovementByPayrollId = async (req, res) => {
  const { id } = req.params;
  try {
    const approvement = await Payroll.findAll({
      where: {
        PayrollDefinitionId: id,
      },
      attributes: ['id'],
      raw: true,
    });
    
    if (!approvement) {
      return res.status(404).json({ message: "Approvement not found" });
    }
    
    
    const payrollIds = approvement.map(item => item.id);

    const payrolls = await EmployeePayrollApprovement.findAll({
      where: {
        id: {
          [Op.in]: payrollIds,
        },
      },
    });

    res.json(payrolls);
    
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



const arrayApproveApprovement = async (req, res) => {
  // Define constant variables here for this endpoint
  const companyId = Number(req.user.id); // Company ID
  const payrollIds = req.body.Payrolls; // Array of Payroll IDs
  const approverId = Number(req.body.approverId);
  const results = [];
  try {
    // Iterate over the array of payroll IDs
    for (const payrollId of payrollIds) {
      if (isNaN(payrollId) || payrollId === NaN) {
        console.log(`Invalid payroll ID: ${payrollId}`);
        console.log(`Invalid payroll ID: ${payrollId}`);
        continue; // Skip to the next iteration
      }
      console.log("payrollids", payrollIds);
      try {
        // Check if payroll exists and is processed
        const payroll = await Payroll.findOne({
          where: {
            id: payrollId,
          },
        });

        console.log(`Payroll ${payroll}`);

        if (!payroll) {
          results.push(`No such payroll created: ${payrollId}`);
          continue; // Skip to the next iteration
        }

        const employeeId = Number(payroll.EmployeeId);

        // Approval method
        const approvalMethods = await ApprovalMethod.findOne({
          where: {
            CompanyId: companyId,
            isActive: true,
          },
        });

        // Is there a master approval?
        const isThereMaster = await ApprovalMethod.findOne({
          where: {
            CompanyId: companyId,
            isActive: true,
            isThereMasterApprover: true,
          },
        });

        if (!approvalMethods) {
          results.push(
            "This company has no active approval method. Please define one."
          );
          continue; // Skip to the next iteration
        }

        // Does this payroll processed/rejected?
        const payrolls = await Payroll.findOne({
          where: {
            id: payrollId,
          },
        });

        if (!payrolls) {
          results.push("Payroll record not found");
          continue; // Skip to the next iteration
        }

        // What is the status of the definition?
        const payrollDefinitionId = payrolls.PayrollDefinitionId;

        const payrollDefinition = await PayrollDefinition.findOne({
          attributes: ["status"],
          where: {
            id: payrollDefinitionId,
          },
        });

        // Am I an approver?
        const iAmApprover = await Approver.findOne({
          where: {
            id: approverId,
            isActive: true,
          },
        });

        if (!iAmApprover) {
          results.push("Access denied. You are not an active approver.");
          continue; // Skip to the next iteration
        }

        const approverLevel = iAmApprover.level;

        // Am I a master approver?
        const iAmMasterApprover = await Approver.findOne({
          where: {
            id: approverId,
            isActive: true,
            isMaster: true,
          },
        });

        // Checking for company approval method
        const hasActiveApprovalMethods = !!approvalMethods;
        const isMasterApproverAvailable = !!isThereMaster;
        const companyApprovalMethod = approvalMethods.approvalMethod;
        const companyApprovalLevel = approvalMethods.approvalLevel;
        const companyMinimumApprover = approvalMethods.minimumApprover;
        const isComplete = approvalMethods.isCompleted;

        if (!isComplete) {
          results.push(
            "The approval method is not completed. Contact your admin."
          );
          continue; // Skip to the next iteration
        }

        // Check for payroll
        const isPayrollProcessed = !!payroll;

        // Checking for payroll definition
        const isPayrollDefinitionOrdered =
          payrollDefinition && payrollDefinition.status === "ordered";

        // Checking on approver
        const amIActiveApprover = !!iAmApprover;
        const amIMasterApprover = !!iAmMasterApprover;

        // Check if approved by me
        const employepayrollapprove = await EmployeePayrollApprovement.count({
          where: {
            ApproverId: approverId,
            PayrollId: payrollId,
          },
        });

        if (employepayrollapprove >= 1) {
          results.push("You have already approved this payroll.");
          continue; // Skip to the next iteration
        }

        // Perform the approval algorithm
        if (hasActiveApprovalMethods) {
          // Check if payroll is ordered
          if (!isPayrollDefinitionOrdered) {
            results.push("Sorry, this payroll is not ordered yet!");
            continue; // Skip to the next iteration
          }

          // Check if I am an active approver
          if (!amIActiveApprover) {
            results.push(
              "Sorry, your account does not have the necessary permissions to proceed."
            );
            continue; // Skip to the next iteration
          }

          // Check if the company has a master approver
          if (!isMasterApproverAvailable) {
            // Check the company's approval method
            if (companyApprovalMethod === "hierarchy") {
              // Call hierarchical method
              const eachPayrollStatus = payrolls.status;
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
              results.push(herreturn);
            } else if (companyApprovalMethod === "horizontal") {
              // Call horizontal method
              const eachPayrollStatus = payrolls.status;
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
              results.push(horreturn);
            } else {
              results.push("Sorry, undefined approval method.");
            }
          } else {
            // Check if I am a master approver
            if (!amIMasterApprover) {
              // Check the company's approval method
              if (companyApprovalMethod === "hierarchy") {
                // Call hierarchical method
                const eachPayrollStatus = payrolls.status;
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
                results.push(herreturn);
              } else if (companyApprovalMethod === "horizontal") {
                // Call horizontal method
                const eachPayrollStatus = payrolls.status;
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
                results.push(horreturn);
              } else {
                results.push("Sorry, undefined approval method.");
              }
            } else if (amIMasterApprover) {
              // Check if the payroll is already approved
              const isApproved = await Payroll.findOne({
                where: {
                  id: payrollId,
                  status: "approved",
                },
              });

              const isActivated = await Payroll.findOne({
                where: {
                  id: payrollId,
                  status: "active",
                },
              });

              if (isActivated) {
                results.push("Already activated.");
                continue; // Skip to the next iteration
              }

              if (!isApproved) {
                results.push("Not approved.");
                continue; // Skip to the next iteration
              }

              await isApproved.update({ status: "active" });

              results.push("Payroll activated successfully.");
            }
          }
        } else {
          results.push("Your approval method is not active.");
        }
      } catch (error) {
        console.error(`Error processing payroll with ID ${payrollId}:`, error);
        continue; // Skip to the next iteration
      }
    }

    console.log("For loop finished");
    return res.json(results);
  } catch (error) {
    console.error(error);
    // return res.status(500).json({ message: 'Internal server error' });
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
  // Do hierarchical method
  if (!isPayrollDefinitionOrdered) {
    return "This payroll has not been ordered yet.";
  }

  const allowedStatuses = ["ordered", "processed"];
  if (eachPayrollStatus === "approved") {
    return "This payroll has already been approved.";
  } else if (allowedStatuses.includes(eachPayrollStatus)) {
    if (Number(approverLevel) !== 1) {
      return "The level 1 approver should approve first.";
    }

    const updatePayroll = await Payroll.findOne({
      where: {
        id: payrollId,
      },
    });

    if (!updatePayroll) {
      return "Payroll record not found.";
    }

    const eachPayrollStatus = "pending";
    const employeestatus = "approved";
    const level = 1;
    const approvedDate = new Date();

    const approveResult = await handlePayrollApprove(
      payrollId,
      eachPayrollStatus,
      employeestatus,
      level,
      approvedDate,
      approverId,
      employeeId,
      companyId
    );

    return `Payroll approved successfully. Level: ${level}`;
  } else if (eachPayrollStatus === "pending") {
    if (Number(approverLevel) !== 2) {
      if (Number(approverLevel) === 1) {
        return "This payroll is already approved at your level.";
      } else if (Number(approverLevel) === 3) {
        const isTwoApprove = await EmployeePayrollApprovement.count({
          where: {
            level: 2,
            PayrollId: payrollId,
          },
        });

        if (isTwoApprove < 1) {
          return "Level 2 should approve before you.";
        }

        const updatePayroll = await Payroll.findOne({
          where: {
            id: payrollId,
          },
        });

        if (!updatePayroll) {
          return "Payroll record not found.";
        }

        const eachPayrollStatus = "approved";
        const employeestatus = "approved";
        const level = 3;
        const approvedDate = new Date();

        const approveresult = await handlePayrollApprove(
          payrollId,
          eachPayrollStatus,
          employeestatus,
          level,
          approvedDate,
          approverId,
          employeeId,
          companyId
        );

        return `Payroll approved successfully. Level: ${level}`;
      } else {
        return "Something went wrong. Please try again.";
      }
    } else if (Number(approverLevel) === 2) {
      if (Number(companyApprovalLevel) === 2) {
        const updatePayroll = await Payroll.findOne({
          where: {
            id: payrollId,
          },
        });

        if (!updatePayroll) {
          return "Payroll record not found.";
        }

        const eachPayrollStatus = "approved";
        const employeestatus = "approved";
        const level = 2;
        const approvedDate = new Date();

        const approveresult = await handlePayrollApprove(
          payrollId,
          eachPayrollStatus,
          employeestatus,
          level,
          approvedDate,
          approverId,
          employeeId,
          companyId
        );

        return `Payroll approved successfully. Level: ${level}`;
      } else if (Number(companyApprovalLevel) === 3) {
        const updatePayroll = await Payroll.findOne({
          where: {
            id: payrollId,
          },
        });

        if (!updatePayroll) {
          return "Payroll record not found.";
        }

        const eachPayrollStatus = "pending";
        const employeestatus = "approved";
        const level = 2;
        const approvedDate = new Date();

        const approveresult = await handlePayrollApprove(
          payrollId,
          eachPayrollStatus,
          employeestatus,
          level,
          approvedDate,
          approverId,
          employeeId,
          companyId
        );

        return `Payroll approved successfully. Level: ${level}`;
      }
    }
  } else {
    return "Undefined payroll status.";
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
) {
  if (!isPayrollDefinitionOrdered) {
    return "This payroll has not been ordered yet.";
  }

  const isMinimumApproved = await EmployeePayrollApprovement.count({
    where: {
      PayrollId: payrollId,
    },
  });

  const compLevel = Number(companyMinimumApprover);
  const approved = Number(isMinimumApproved);
  const isLast = approved + 1;

  if (approved >= compLevel) {
    return "This payroll has already been approved.";
  } else if (isLast < compLevel) {
    const updatePayroll = await Payroll.findOne({
      where: {
        id: payrollId,
      },
    });

    if (!updatePayroll) {
      return "Payroll record not found.";
    }

    const eachPayrollStatus = "pending";
    const employeestatus = "approved";
    const level = 1;
    const approvedDate = new Date();

    const approveresult = await handlePayrollApprove(
      payrollId,
      eachPayrollStatus,
      employeestatus,
      level,
      approvedDate,
      approverId,
      employeeId,
      companyId
    );

    return `Payroll approved successfully. Level: ${level}`;
  } else if (isLast === compLevel) {
    const updatePayroll = await Payroll.findOne({
      where: {
        id: payrollId,
      },
    });

    if (!updatePayroll) {
      return "Payroll record not found.";
    }

    const eachPayrollStatus = "approved";
    const employeestatus = "approved";
    const level = 1;
    const approvedDate = new Date();

    const approveresult = await handlePayrollApprove(
      payrollId,
      eachPayrollStatus,
      employeestatus,
      level,
      approvedDate,
      approverId,
      employeeId,
      companyId
    );

    return `Payroll approved successfully. Level: ${level}`;
  } else {
    return "Some error occurred.";
  }
}

async function handlePayrollApprove(
  payrollId,
  eachPayrollStatus,
  employeestatus,
  level,
  approvedDate,
  approverId,
  employeeId,
  companyId
) {
  const payroll = await Payroll.findByPk(payrollId);

  if (!payroll) {
    return "Payroll not found.";
  }

  await payroll.update({ status: eachPayrollStatus });

  const newApprovement = await EmployeePayrollApprovement.create({
    status: employeestatus,
    remark: "",
    level: level,
    approvedDate: approvedDate,
    PayrollId: payrollId,
    ApproverId: approverId,
    EmployeeId: employeeId,
    CompanyId: companyId,
  });

  return {
    message: "Payroll activated successfully.",
    payroll: payroll,
    approvement: newApprovement,
  };
}

// const rejectPayroll = async(req,res,next)=>{
//   const companyId = Number(req.user.id); // Company ID
//   const payrollIds = Number(req.body.Payrolls); // Array of Payroll IDs
//   const approverId = Number(req.body.approverId);
//   const results = [];

//   try {
//     // check if company has active approval method

//     const activeApprovalMethod= await ApprovalMethod.findOne({where:{
//       CompanyId:companyId,
//       isActive:true
//     }})

//     if(!activeApprovalMethod){
//       return res.json("your company has no active approval method defined ccontact admin!")
//     }
//     //check if i am active approver

//     const activeApprover = await Approver.findOne({
//       where:{
//         id:approverId,
//         isActive:true
//       }
//     })
//     if(!activeApprover){
//       return res.json("you are not an active approver")
//     }
//     //check if payroll there
//     const thisPayroll = await Payroll.findOne({
//       where:{
//         id:payrollIds
//       }
//     })
//     if(!thisPayroll){
//       return res.json("no such payroll is created ")
//     }
//     //update it form employeement 
//     const recordToUpdate = await  Payroll.findOne({ where: { id:payrollIds } });
//     const recordToUpdateOnApprovement = await  EmployeePayrollApprovement.findOne({ where: { PayrollId:payrollIds } });
//     // Check if records were found
//     if (!recordToUpdate || !recordToUpdateOnApprovement) {
//       return res.status(404).json('Records not found.');
//     }
//       // Update the record with the new 
//       await recordToUpdateOnApprovement.update({status:'rejected',rejectedBy:approverId,remark:'revice allowance'})
//       await recordToUpdate.update({status:'rejected'});

//       // return res.json(`${recordToUpdate.id} Record updated successfully!`);
//       return res.json({recordToUpdate:recordToUpdate,recordToUpdateOnApprovement:recordToUpdateOnApprovement})
//   } catch (error) {
//     return res.json(error);
//   }
// }

const rejectPayroll = async (req, res, next) => {
  const companyId = Number(req.user.id); // Company ID
  const payrollIds = Array.isArray(req.body.Payrolls) ? req.body.Payrolls : [Number(req.body.Payrolls)]; // Convert to an array
  const approverId = Number(req.body.approverId);
  const results = [];

  try {
    // check if company has active approval method
    const activeApprovalMethod = await ApprovalMethod.findOne({
      where: {
        CompanyId: companyId,
        isActive: true,
      },
    });

    if (!activeApprovalMethod) {
      return res.json("Your company has no active approval method defined. Contact the admin!");
    }

    // check if I am an active approver
    const activeApprover = await Approver.findOne({
      where: {
        id: approverId,
        isActive: true,
      },
    });

    if (!activeApprover) {
      return res.json("You are not an active approver.");
    }

    // Process each payroll ID in the array
    for (const payrollId of payrollIds) {
      // Check if payroll exists
      const thisPayroll = await Payroll.findOne({
        where: {
          id: payrollId,
        },
      });

      if (!thisPayroll) {
        results.push({ payrollId, status: 'not found' });
      } else {
        // Update EmployeePayrollApprovement record
        const recordToUpdateOnApprovement = await EmployeePayrollApprovement.findOne({
          where: {
            PayrollId: payrollId,
          },
        });

        if (!recordToUpdateOnApprovement) {
          results.push({ payrollId, status: 'approvement record not found' });
        } else {
          // Update the records with the new status and other details
          await recordToUpdateOnApprovement.update({ status: 'rejected', rejectedBy: approverId, remark: 'revice allowance' });
          await thisPayroll.update({ status: 'rejected' });

          results.push({ payrollId, status: 'rejected', rejectedBy: approverId, remark: 'revice allowance' });
        }
      }
    }

    return res.json(results);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating payrolls.' });
  }
};





module.exports = {
  getAllApprovements,
  rejectPayroll,
  getApprovementById,
  createApprovement,
  updateApprovement,
  deleteApprovement,
  arrayApproveApprovement,
  getApprovementByPayrollId
};
