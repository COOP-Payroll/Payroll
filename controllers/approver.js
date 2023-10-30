const Approver = require("../models/approver");
const ApprovalMethod = require("../models/approvalMethod");
const Employee = require("../models/employee");

// Get all Approvers
exports.getAllApprovers = async (req, res) => {
  const CompanyId = req.user.id;
  console.log(CompanyId);
  const criteria = {
    where: { CompanyId: CompanyId },
  };
  try {
    const approvers = await Approver.findAll({
      ...criteria,
      include: 'Employee',
    });

    let employeeNames = [];
    if (approvers && approvers.length > 0) {
      employeeNames = approvers.map(approver => approver.Employee.fullname);
    }

    res.json({
      count: approvers.length,
      approvers: approvers,
      Names: employeeNames,
    });

  } catch (error) {
    console.error("Error retrieving Approvers:", error);
    res.status(500).json({ error: "Failed to retrieve Approvers" });
  }

};
//get all active approver
exports.getAllActiveApprovers = async (req, res) => {
  const CompanyId = req.user.id;
  console.log(CompanyId);
  const criteria = {
    where: { CompanyId: CompanyId, isActive: true },
  };
  try {
    const approvers = await Approver.findAll({
      ...criteria,
      include: 'Employee',
    });

    let employeeNames = [];
    if (approvers && approvers.length > 0) {
      employeeNames = approvers.map(approver => approver.Employee.fullname);
    }

    res.json({
      count: approvers.length,
      approvers: approvers,
      Names: employeeNames,
    });

  } catch (error) {
    console.error("Error retrieving Approvers:", error);
    res.status(500).json({ error: "Failed to retrieve Approvers" });
  }

};
//get all inactive approver
exports.getAllInActiveApprovers = async (req, res) => {
  const CompanyId = req.user.id;
  console.log(CompanyId);
  const criteria = {
    where: { CompanyId: CompanyId, isActive: false },
  };
  try {
    const approvers = await Approver.findAll({
      ...criteria,
      include: 'Employee',
    });

    let employeeNames = [];
    if (approvers && approvers.length > 0) {
      employeeNames = approvers.map(approver => approver.Employee.fullname);
    }

    res.json({
      count: approvers.length,
      approvers: approvers,
      Names: employeeNames,
    });

  } catch (error) {
    console.error("Error retrieving Approvers:", error);
    res.status(500).json({ error: "Failed to retrieve Approvers" });
  }

};
// Get a single Approver by ID
exports.getApproverById = async (req, res) => {
  const approverId = req.params.id;
  try {
    const approver = await Approver.findByPk(approverId);
    if (!approver) {
      return res.status(404).json({ error: "Approver not found" });
    }
    res.json(approver);
  } catch (error) {
    console.error("Error retrieving Approver:", error);
    res.status(500).json({ error: "Failed to retrieve Approver" });
  }
};
//get approver by employee id
exports.getApproverByEmployeeId = async (req, res) => {
  const approverEmployeeId = req.params.id;
  try {
    const approver = await Approver.findOne({
      where: { EmployeeId: approverEmployeeId },
      include: [{ model: Employee }]
    });
    
    if (!approver) {
      return res.status(404).json({ error: "Approver not found" });
    }
    res.status(200).json(approver);
  } catch (error) {
    console.error("Error retrieving Approver:", error);
    res.status(500).json({ error: "Failed to retrieve Approver" });
  }
};
//function used here tomanipulate the approved

async function saveApprover(
  CompanyId,
  EmployeeId,
  isActive,
  isMaster,
  role,
  level,
  ApprovalMethodId  
) {
  const approver = new Approver({ isActive, isMaster, role, level });
  await approver.save();
  await approver.setCompany(CompanyId);
  await approver.setEmployee(EmployeeId);
  await approver.setApprovalMethod(ApprovalMethodId)
  console.log("saved success fully bempl")
  const updateEmployeeRole = await Employee.update({role:'approver'}, {
    where: {id:EmployeeId },
  });

  console.log(updateEmployeeRole)
  console.log("saved success fully")
  return {
    approver:approver,
    message: "Successfully saved "
        };
}

// Create a new Approver
exports.createApprover = async (req, res) => {
  const CompanyId = req.user.id;
  
  const { level, role, isActive, isMaster, EmployeeId } = req.body;
  try {
    console.log("data sent",level, role, isActive, isMaster, EmployeeId);
    const approvalMethod = await ApprovalMethod.findOne({
      where: { CompanyId: req.user.id, isActive: true},
    });
    if(approvalMethod===null){
      console.log("company has no active approval method ")
      return res.json("company has no active approval method ")
    } else{
      
    //set each value of approval method to variable
    console.log(req.user.id)
    const companyId    = approvalMethod.CompanyId;
    const appMethod    = approvalMethod.approvalMethod;
    const appLevel     = approvalMethod.approvalLevel;
    const minimumApp   = approvalMethod.minimumApprover;
    const ifMaster     = approvalMethod.isThereMasterApprover;
    const ApprovalMethodId = approvalMethod.id;

    const approvalMethodCount = await ApprovalMethod.count({
      where: { CompanyId: req.user.id,isActive: true},
    });

    console.log(approvalMethodCount);
    //add company id to get employee
    const employeeCount = await Employee.count({
      where: { id:req.body.EmployeeId,CompanyId:req.user.id},
    });
    console.log("this employee is", employeeCount);

    const isSaved = await Approver.count({
      where: { CompanyId: req.user.id, EmployeeId: req.body.EmployeeId,isActive: true},
    });

    const settedApprover = await Approver.count({
      where: { CompanyId: req.user.id,isMaster:false, },
    });

    console.log("already setted", isSaved);
    if (isSaved >= 1) {
      res.json("this employee is already assigned as approver");
    } else if (approvalMethodCount < 1) {
      res.status(200).json("you should define approval method for this company");
    } else if (employeeCount < 1) {
      res
        .status(200)
        .json("this employee has no valid id register in employee list ");
    } else {
      console.log(companyId, appMethod, appLevel, minimumApp, ifMaster);
      if (ifMaster) {
        console.log("has master");
        const masterApproverCount = await Approver.count({
          where: {
            isMaster: true,
            CompanyId: req.user.id,
          },
        });
        console.log("master number", masterApproverCount);
        if (masterApproverCount >= 1 && req.body.isMaster === true) {
          console.log("master approver is setted already")
          return res.json("master approver is seeted already");
          
        } else if (masterApproverCount < 1 && req.body.isMaster === true) {
          //setapproval here
          const setMaster = await Approver.create({
            level,
            role,
            isMaster: true,
            isActive: true,
          });
          await setMaster.setApprovalMethod(ApprovalMethodId);
          await setMaster.setCompany(CompanyId);
          await setMaster.setEmployee(EmployeeId)
          //update  employe role
          const updateEmployeeRole = await Employee.update({role:"approver"}, {
            where: {id: EmployeeId},
          });
          return res
            .status(201)
            .json({
              updateEmployeeRole: updateEmployeeRole,
              messag: "master approval successfully setted",
            });
        } else if (req.body.isMaster === false) {
          console.log("wow its not master");
          if (appMethod === "horizontal") {
            console.log("horizontal approval");
            //count saved approver for this company except for master
            try {
              if (minimumApp === null) {
                return res.json("unknown minimum approver");
              } else if (minimumApp <= settedApprover) {
                //register this approver
                const saveHApprover = await Approver.create({
                  level: 0,
                  role: req.body.role,
                  isMaster: false,
                  isActive: true,
                });
                await saveHApprover.setApprovalMethod(ApprovalMethodId)
                await saveHApprover.setCompany(req.user.id);
                await saveHApprover.setEmployee(req.body.EmployeeId);
                //update  employe role
                const updateEmployeeRole = await Employee.update({role:"approver"}, {
                  where: {id: EmployeeId},
                });
                
                //update approval mehod 
                const updateResult = await ApprovalMethod.update({isCompleted:true}, {
                  where: {id: ApprovalMethodId},
                });
                
                console.log(updateResult)
                return res.json({
                  success:true,
                  approvalMethodId:updateResult,
                  updateEmployeeRole:updateEmployeeRole,
                  message:"successfully saved you can approve your payroll"
                  });
              } else if (minimumApp === settedApprover + 1) {
                const saveHApprover = await Approver.create({
                  level: 0,
                  role: req.body.role,
                  isMaster: false,
                  isActive: true,
                });
                await saveHApprover.setApprovalMethod(ApprovalMethodId)
                await saveHApprover.setCompany(req.user.id);
                await saveHApprover.setEmployee(req.body.EmployeeId);
                //update  employe role
                const updateEmployeeRole = await Employee.update({role:"approver"}, {
                  where: {id: EmployeeId},
                });
                //update approval method
                const updateResult = await ApprovalMethod.update({isCompleted:true}, {
                  where: {id: ApprovalMethodId},
                });
                console.log(updateResult)
                return res.json({
                  approvalmethod:updateResult,
                  updateEmployeeRole: updateEmployeeRole,
                  message: "successfully saved you have passed minimum number of approver",
              });
              } else if (minimumApp > settedApprover + 1) {
                const saveHApprover = await Approver.create({
                  level: 0,
                  role: req.body.role,
                  isMaster: false,
                  isActive: true,
                });
                await saveHApprover.setApprovalMethod(ApprovalMethodId)
                await saveHApprover.setCompany(req.user.id);
                await saveHApprover.setEmployee(req.body.EmployeeId);
                //update  employe role
                const updateEmployeeRole = await Employee.update({role:"approver"}, {
                  where: {id: EmployeeId},
                });
                return res.json({
                  updateEmployeeRole: updateEmployeeRole,
                  message:"add more appprover "
                });
              } else {
                return res.json("something is wrong");
              }
            } catch (error) {
              return res.status(500).json("something went wrong");
            }
          } else if (appMethod === "hierarchy") {
            console.log("hierarchy approval");
            const level = req.body.level;

            if (level > 3 || level <= 0) {
              return res.json({ message: "invalid level " });
            } else {
              console.log("save data for herarchy ");
              if (appLevel < level) {
                return res.json({
                  message: "your level of approval is " + levelNumber,
                });
              } else {
                if (appLevel === 3) {
                  //three level
                  saveApprover(
                    CompanyId,
                    EmployeeId,
                    isActive,
                    isMaster,
                    role,
                    level,
                    ApprovalMethodId
                  )
                    .then(async () => {
                      const appOne = await Approver.count({
                        where: { level: 1, CompanyId: req.user.id },
                      });
                      const appTwo = await Approver.count({
                        where: { level: 2, CompanyId: req.user.id },
                      });
                      const appThree = await Approver.count({
                        where: { level: 3, CompanyId: req.user.id },
                      });
                      //check which one of them is setted
                      console.log(appOne, appTwo, appThree);
                      if (appOne >= 1 && appTwo >= 1 && appThree >= 1) {
                        
                        //update the complete in approval method
                        const updateResult = await ApprovalMethod.update({isCompleted:true}, {
                          where: {id: ApprovalMethodId},
                        });

                        console.log(updateResult)
                        return res.json(
                          "you are all done now you can approve payroll"
                        );
                      } else if (appOne >= 1 && appThree >= 1) {
                        return res.json("add approver on level 2");
                      } else if (appTwo >= 1 && appThree >= 1) {
                        return res.json("add approver on level 1");
                      } else if (appTwo >= 1 && appOne >= 1) {
                        return res.json("add approver on level 3");
                      } else if (appOne < 1 && appThree < 1) {
                        return res.json("add approver on level 1 and 3");
                      } else if (appTwo < 1 && appThree < 1) {
                        return res.json("add approver on level 2 and 3");
                      } else if (appTwo < 1 && appOne < 1) {
                        return res.json("add approver on level 1 and 2");
                      } else {
                        return res.json("something went wrong");
                      }
                    })
                    .catch((err) => {
                      return res.json({
                        message: "something went wrong",
                        error: err,
                      });
                    });
                } else if (appLevel === 2) {
                  saveApprover(
                    CompanyId,
                    EmployeeId,
                    isActive,
                    isMaster,
                    role,
                    level,
                    ApprovalMethodId
                  )
                    .then(async () => {

                      const appOne = await Approver.count({
                        where: { level: 1, CompanyId: req.user.id },
                      });
                      const appTwo = await Approver.count({
                        where: { level: 2, CompanyId: req.user.id },
                      });
                      // const appThree = await Approver.count({ where: { level: 3, CompanyId: req.user.id } });
                      //check which one of them is setted
                      console.log(appOne, appTwo);
                      if (appOne >= 1 && appTwo >= 1) {
                        //update approval method

                        const updateResult = await ApprovalMethod.update({isCompleted:true}, {
                          where: {id: ApprovalMethodId},
                        });
                        console.log(updateResult)
                        res.json(
                          "you are all done now you can approve payroll"
                        );
                        //update the complete in approval method
                      } else if (appOne >= 1) {
                        res.json("add approver on level 2");
                      } else if (appTwo >= 1) {
                        res.json("add approver on level 1");
                      } else {
                        res.json("something went wrong");
                      }
                    })
                    .catch((err) => {
                      return res.json({
                        message: "something went wrong",
                        error: err,
                      });
                    });
                }
              }
            }
          } else {
            //if not both /undeefined appmethod
            console.log("undefined approval method");
          }
        } else {
          //unknown error
          console.log("unknown error ");
          return res.json("unknown error retry again");
        }
        //if no master approval
      } else {
        //save it if it has no master approve

        if (appMethod === "horizontal") {
          console.log("horizontal approval && not master");
          if (minimumApp === null) {
            return res.json("undefined minimum number of approver");
          } else if (minimumApp <= settedApprover) {
            console.log("save now ");
            const savehApp = await Approver.create({
              level: 0,
              role: req.body.role,
              isActive: true,
              isMaster: false,
            });
            await savehApp.setEmployee(req.body.EmployeeId);
            await savehApp.setCompany(req.user.id);
            await savehApp.setApprovalMethod(ApprovalMethodId);
            //update employee role
            const updateEmployeeRole = await Employee.update({role:"approver"}, {
              where: {id: EmployeeId},
            });
            //update employee data

            const updateResult = await ApprovalMethod.update({isCompleted:true}, {
              where: {id: ApprovalMethodId},
            });
            console.log(updateResult)
            return res.status(201).json({
              employeerole: updateEmployeeRole,
              message:
                "successfully registered now your payroll can be approved",
            });
          } else if (minimumApp === settedApprover + 1) {
            const savehApp = await Approver.create({
              level: 0,
              role: req.body.role,
              isActive: true,
              isMaster: false,
            });
            await savehApp.setEmployee(req.body.EmployeeId);
            await savehApp.setCompany(req.user.id);
            await savehApp.setApprovalMethod(ApprovalMethodId);
            //update employee role
            const updateEmployeeRole = await Employee.update({role:"approver"}, {
              where: {id: EmployeeId},
            });
            //update here
            const updateResult = await ApprovalMethod.update({isCompleted:true}, {
              where: {id: ApprovalMethodId},
            });
            console.log(updateResult)
            return res.json({
              updateemployee:updateEmployeeRole,
              message: " successfully passed minimum amount of approver ",
            });
          } else if (minimumApp > settedApprover + 1) {
            const savehApp = await Approver.create({
              level: 0,
              role: req.body.role,
              isActive: true,
              isMaster: false,
            });
            await savehApp.setEmployee(req.body.EmployeeId);
            await savehApp.setCompany(req.user.id);
            await savehApp.setApprovalMethod(ApprovalMethodId)
             //update employee role
             const updateEmployeeRole = await Employee.update({role:"approver"}, {
              where: {id: EmployeeId},
            });
            return res.json({
              updateEmployeeRole: updateEmployeeRole,
              messae: " add more approver and meet you minimum approver",
            });
          } else {
            return res.json("something is wrong");
          }
        } else if (appMethod === "hierarchy") {
          //hierarchy no master
          const level = req.body.level;
          if (level > 3 || level <= 0) {
            return res.json({ message: "invalid level " });
          } else {
            console.log("save data for herrarchy");
            if (appLevel < level) {
              return res.json({
                message: "your level of approval is " + levelNumber,
              });
            } else {
              if (appLevel === 3) {
                //save what we got check who is not registered
                saveApprover(
                  CompanyId,
                  EmployeeId,
                  isActive,
                  isMaster,
                  role,
                  level,
                  ApprovalMethodId
                )
                  .then(async () => {
                    const appOne = await Approver.count({
                      where: { level: 1, CompanyId: CompanyId },
                    });
                    const appTwo = await Approver.count({
                      where: { level: 2, CompanyId: CompanyId },
                    });
                    const appThree = await Approver.count({
                      where: { level: 3, CompanyId: CompanyId },
                    });
                    if (appOne >= 1 && appTwo >= 1 && appThree >= 1) {
                      
                      //update  approval status
                      const updateResult = await ApprovalMethod.update({isCompleted:true}, {
                        where: {id: ApprovalMethodId},
                      });

                      console.log(updateResult)
                      return res.json(
                        "you are all done now you can approve payroll"
                      );
                    } else if (appOne >= 1 && appThree >= 1) {
                      res.json("add approver on level 2");
                    } else if (appTwo >= 1 && appThree >= 1) {
                      res.json("add approver on level 1");
                    } else if (appTwo >= 1 && appOne >= 1) {
                      res.json("add approver on level 3");
                    } else if (appOne < 1 && appThree < 1) {
                      res.json("add approver on level 1 and 3");
                    } else if (appTwo < 1 && appThree < 1) {
                      res.json("add approver on level 2 and 3");
                    } else if (appTwo < 1 && appOne < 1) {
                      res.json("add approver on level 1 and 2");
                    } else {
                      res.json("something went wrong");
                    }
                  })
                  .catch((err) => {
                    return res.json("something went wrong");
                  });
              } else if (appLevel === 2) {
                saveApprover(
                  CompanyId,
                  EmployeeId,
                  isActive,
                  isMaster,
                  role,
                  level,
                  ApprovalMethodId
                )
                  .then(async () => {
                    const appOne = await Approver.count({
                      where: { level: 1, CompanyId: CompanyId },
                    });
                    const appTwo = await Approver.count({
                      where: { level: 2, CompanyId: CompanyId },
                    });
                    
                    if (appOne >= 1 && appTwo >= 1) {
                      
                      const updateResult = await ApprovalMethod.update({isCompleted:true}, {
                        where: {id: ApprovalMethodId},
                      });
                      console.log(updateResult)
                      res.json("you are all done now you can approve payroll");
                      //update the complete in approval method
                    } else if (appOne >= 1) {
                      res.json("add approver on level 2");
                    } else if (appTwo >= 1) {
                      res.json("add approver on level 1");
                    } else {
                      res.json("something went wrong");
                    }
                  })
                  .catch((err) => {
                    return res.json("something went wrong");
                  });
              }
            }
          }
        }
      }
    }
  }
  } catch (error) {
    console.error("Error creating Approver:", error);
    res.status(500).json({ error: "Failed to create Approver" });
  }
};

// Update an existing Approver
exports.updateApprover=async(req, res)=> {
  const approverId = req.params.id;
  const { level, role, isActive, isMaster, EmployeeId, companyId } = req.body;
  try {
    const approver = await Approver.findByPk(approverId);
    if (!approver) {
      return res.status(404).json({ error: "Approver not found" });
    }
    approver.level = level;
    approver.role = role;
    approver.isActive = isActive;
    approver.isMaster = isMaster;
    approver.EmployeeId = EmployeeId;
    approver.companyId = companyId;
    await approver.save();
    res.json(approver);
  } catch (error) {
    console.error("Error updating Approver:", error);
    res.status(500).json({ error: "Failed to update Approver" });
  }
}

// Delete an Approver
exports.deleteApprover = async (req, res) => {
  const approverId = req.params.id;
  try {
    const approver = await Approver.findByPk(approverId);
    if (!approver) {
      return res.status(404).json({ error: "Approver not found" });
    }
    await approver.destroy();
    res.json({ message: "Approver deleted successfully" });
  } catch (error) {
    console.error("Error deleting Approver:", error);
    res.status(500).json({ error: "Failed to delete Approver" });
  }
};



exports.deactiveApprover = async (req, res) => {
  const approverId = req.body.approverId;
  const EmployeeId = req.body.EmployeeId;

  const updateApprover = await Approver.update(
    { isActive: false },
    {
      where: {
        id: approverId,
      },
    }
  );
  const updateEmployee = await Employee.update(
    { role: "employee" },
    {
      where: {
        id: EmployeeId,
      },
    }
  );

  return res.json({
    status: 201,
    message: "approver deActivated successfully.",
    updateEmployee: updateEmployee,
    updateApprover: updateApprover,
  });
};

