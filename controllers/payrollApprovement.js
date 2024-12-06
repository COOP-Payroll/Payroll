const PayrollApprovement = require("../models/payrollApprovement");
const Approver = require("../models/approver");
const ApprovalMethod = require("../models/approvalMethod");
const PayrollDefinition = require("../models/payrollDefinition");
const Payroll = require("../models/Payroll");
const Sequelize = require("sequelize");
const createError = require("../utils/error");

//reusable function for payroll approvement
async function handlePayrollApproval(
  payrollId,
  approverId,
  level,
  status,
  payrollStatus
) {
  try {
    const approve1 = await PayrollApprovement.create({
      level,
      status,
    });
    const PayrollDefinitionId = payrollId;
    const ApproverId = approverId;
    const payroll = await PayrollDefinition.findByPk(payrollId);
    if (!payroll) {
      throw new Error("Payroll not defined");
    }
    payroll.status = payrollStatus;
    await payroll.save();
    //await approve1.save();
    await approve1.setPayrollDefinition(PayrollDefinitionId);
    await approve1.setApprover(ApproverId);
    const response = {
      status: "success",
      message: "successfully approved",
      change: approve1,
      ApprovedPayrollId: payroll,
    };
    return response;
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
}
//approve for horizontal one
async function handleHorizontalApprove(
  payrollId,
  approverId,
  minimumApprover,
  approverLevel,
  approverRole,
  payrollStatus
) {
  // const PayrollApprovementId =payrollId;
  // const ApproverId  = approverId
  try {
    const approvedBy = await PayrollApprovement.count({
      where: { PayrollDefinitionId: payrollId, status: "approved" },
    });

    const leftApprover = minimumApprover - approvedBy;

    if (minimumApprover > approvedBy) {
      const isLastApprover = leftApprover - 1;

      if (isLastApprover === 0) {
        const payroll = await PayrollDefinition.count({
          where: { id: payrollId },
        });
        if (!payroll) {
          return { message: "Payroll not found" };
        } else {
          const status = "approved";
          const level = 0;
          const payrollStatus = "approved";

          const criteria = {
            where: {
              PayrollDefinitionId: payrollId,
              [Sequelize.Op.or]: [
                { status: "processed" },
                { status: "rejected" },
              ],
            },
          };

          const newData = { status: "approved" };

          const employeePayroll = await Payroll.update(newData, criteria);

          const result = await handlePayrollApproval(
            payrollId,
            approverId,
            level,
            status,
            payrollStatus
          );
          const response = {
            status: "success",
            message: "It is already approved",
            payroll: result,
          };
          return response;
        }
      } else {
        const payroll = await PayrollDefinition.findByPk(payrollId);

        if (!payroll) {
          return next(createError.createError(404, "Payroll not Found"));
        } else {
          //approve for other

          const status = "approved";
          const level = 0;
          const payrollStatus = "pending";

          const result = await handlePayrollApproval(
            payrollId,
            approverId,
            level,
            status,
            payrollStatus
          );

          const response = {
            status: "success",
            message: "It is already approved",
            payroll: result,
          };
          return response;
        }
      }
    } else {
      return "it is already approved";
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
}

//approve for hierarchy
async function handleHierarchicalApprove(
  payrollId,
  approverId,
  companyApprovalLevel,
  approverLevel,
  approverRole,
  payrollStatus
) {
  try {
    if (payrollStatus === "created") {
      const response = {
        Message: "this payroll is not ordered yet",
      };
      return response;
    } else if (payrollStatus === "approved") {
      return "it is already approved";
    } else if (payrollStatus === "rejected" || payrollStatus === "ordered") {
      const appLevel = Number(approverLevel);
      if (appLevel !== 1) {
        const whoseTurn = await Approver.findOne({ where: { level: 1 } });

        return { message: `${whoseTurn.role} should approve before` };
      } else {
        //approve for level one
        const status = "approved";
        const level = 1;
        const payrollStatus = "pending";

        const result = await handlePayrollApproval(
          payrollId,
          approverId,
          level,
          status,
          payrollStatus
        );
        return result;
      }
    } else if (payrollStatus === "pending") {
      const payrollApprovalCount = await PayrollApprovement.count({
        where: {
          level: 2,
          PayrollDefinitionId: payrollId,
          status: "approved",
        },
      });
      if (payrollApprovalCount < 1) {
        if (Number(approverLevel) !== 2) {
          if (Number(approverLevel) === 1) {
            return { message: "payroll already approved at your level " };
          } else if (Number(approverLevel) === 3) {
            return { message: `${whoseTurn.role} should approve before you` };
          } else {
            return { message: "unknown level of approver" };
          }
        } else {
          //approve for level  two
          const status = "approved";
          const level = 2;
          const payrollStatus = "pending";
          if (companyApprovalLevel === 3) {
            const payrollStatus = "pending";
            const result = await handlePayrollApproval(
              payrollId,
              approverId,
              level,
              status,
              payrollStatus
            );
            return result;
          } else if (companyApprovalLevel === 2) {
            const payrollStatus = "approved";
            const criteria = {
              where: {
                PayrollDefinitionId: payrollId,
                [Sequelize.Op.or]: [
                  { status: "processed" },
                  { status: "rejected" },
                ],
              },
            };
            const newData = { status: "approved" };
            const employeePayroll = await Payroll.update(newData, criteria);
            const result = await handlePayrollApproval(
              payrollId,
              approverId,
              level,
              status,
              payrollStatus
            );
            return result;
          } else {
          }
        }
      } else if (Number(approverLevel) === 3) {
        //approve for level  two
        const status = "approved";
        const level = 3;
        const payrollStatus = "approved";
        const criteria = {
          PayrollDefinitionId: payrollId,
          status: "processed",
        };
        const newData = { status: "approved" };
        const employeePayroll = await Payroll.update(criteria, newData);
        const result = await handlePayrollApproval(
          payrollId,
          approverId,
          level,
          status,
          payrollStatus
        );
        return result;
      } else {
      }
    } else {
      return "something is wrong unknown status ";
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
}
// const payrollApprovement = await PayrollApprovement.create(req.body);
// const result = await handlePayrollApproval(payrollId, approverId, level, status);
// res.status(201).json(payrollApprovement);
// Create a new payrollApprovement

const createPayrollApprovement = async (req, res, next) => {
  const payrollId = req.body.payrollId;
  const approverId = req.body.approverId;
  // console.log(req.body.payrollId,req.body.approverId)
  try {
    //grap required information 1 approval method of company  2 appreover info 3 payroll information

    const payrollDefinition = await PayrollDefinition.findOne({
      where: { id: payrollId },
    });
    if (!payrollDefinition) {
      return res.status(404).json("Payroll definition is not defined");
    }
    const CompanyIdPayroll = payrollDefinition?.CompanyId;
    const payrollStatus = payrollDefinition.status;

    // console.log(CompanyIdPayroll,payrollStatus,"payroll")
    //approval method
    const approvalMethod = await ApprovalMethod.findOne({
      where: { CompanyId: CompanyIdPayroll, isActive: true },
    });
    if (!approvalMethod) {
      return res.status(404).json("please define approval method");
    }

    // console.log("minimum approver",approvalMethod)
    const minimumApprover = approvalMethod?.minimumApprover;
    const isThereMasterApprover = approvalMethod?.isThereMasterApprover;
    const companyApprovalMethod = approvalMethod?.approvalMethod;
    const isApprovalMethodCompleted = approvalMethod?.isCompleted;
    const companyApprovalLevel = approvalMethod?.approvalLevel;
    // console.log(companyApprovalLevel,companyApprovalMethod,isApprovalMethodCompleted,"approval method");
    //approver
    const approver = await Approver.findOne({
      where: { id: approverId, isActive: true },
    });
    if (!approver) {
      return res.status(404).json({
        message: "Please assign employee to approver",
      });
    }

    const approverLevel = approver.level;
    const approverRole = approver.role;
    const isApproverActive = approver.isActive;
    const isApproverMaster = approver.isMaster;

    const isApprovedByMe = await PayrollApprovement.findOne({
      where: {
        ApproverId: approverId,
        PayrollDefinitionId: payrollId,
        status: "approved",
      },
    });

    if (isApprovedByMe !== null) {
      return res.json({
        Message: "you already approved this payroll",
      });
    }

    if (!isApprovalMethodCompleted) {
      return res.status(400).json({
        message:
          "approval method set app is not completed! your admin should complete once ",
      });
    } else {
      if (!isApproverActive) {
        return res
          .status(400)
          .json("this account is not active to approve contact your admin");
      } else {
        if (!isThereMasterApprover) {
          //if no master approver
          if (companyApprovalMethod === "horizontal") {
            const result = await handleHorizontalApprove(
              payrollId,
              approverId,
              minimumApprover,
              approverLevel,
              approverRole,
              payrollStatus
            );

            return result.status(201).json(result);
          } else if (companyApprovalMethod === "hierarchy") {
            const result = await handleHierarchicalApprove(
              payrollId,
              approverId,
              companyApprovalLevel,
              approverLevel,
              approverRole,
              payrollStatus
            );

            return res.status(201).json(result);
          } else {
            return next(
              createError.createError(400, "Undefined approval method")
            );
          }
        } else {
          //if master approval method there
          if (!isApproverMaster) {
            if (companyApprovalMethod === "horizontal") {
              const result = await handleHorizontalApprove(
                payrollId,
                approverId,
                minimumApprover,
                approverLevel,
                approverRole,
                payrollStatus
              );
              return result.status(201).json(result);
            } else if (companyApprovalMethod === "hierarchy") {
              const result = await handleHierarchicalApprove(
                payrollId,
                approverId,
                companyApprovalLevel,
                approverLevel,
                approverRole,
                payrollStatus
              );
              return result.status(201).json(result);
            } else {
              return next(
                createError.createError(400, "Undefined approval method")
              );
            }
          } else {
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
              return next(
                createError.createError(
                  503,
                  "An error occurred, please try again later"
                )
              );
            }
          }
        }
      }
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
//re approve rejected payroll
const reCreatePayrollApprovement = async (req, res, next) => {
  const payrollId = req.body.payrollId;
  const approverId = req.body.approverId;
  try {
    //grap required information 1 approval method of company  2 appreover info 3 payroll information
    const payrollDefinition = await PayrollDefinition.findOne({
      where: { id: payrollId },
    });
    if (!payrollDefinition) {
      res.status(404).json("payroll not defined");
    }
    const CompanyIdPayroll = payrollDefinition.CompanyId;
    const payrollStatus = payrollDefinition.status;

    //approval method
    const approvalMethod = await ApprovalMethod.findOne({
      where: { CompanyId: CompanyIdPayroll, isActive: true },
    });
    if (!approvalMethod) {
      res.status(404).json("approvalMethod not defined ");
    }
    const minimumApprover = approvalMethod.minimumApprover;
    const isThereMasterApprover = approvalMethod.isThereMasterApprover;
    const companyApprovalMethod = approvalMethod.approvalMethod;
    const isApprovalMethodCompleted = approvalMethod.isCompleted;
    const companyApprovalLevel = approvalMethod.approvalLevel;

    //approver
    const approver = await Approver.findOne({
      where: { id: approverId, isActive: true },
    });
    if (!approver) {
      res.status(404).json("approver not setted ");
    }
    const approverLevel = approver.level;
    const approverRole = approver.role;
    const isApproverActive = approver.isActive;
    const isApproverMaster = approver.isMaster;

    if (!isApprovalMethodCompleted) {
      return res.json({
        Message:
          "approval method set app is not completed! your admin should complete once ",
      });
    } else {
      if (!isApproverActive) {
        return res.json(
          "this account is not active to approve contact your admin"
        );
      } else {
        if (!isThereMasterApprover) {
          //if no master approver
          if (companyApprovalMethod === "horizontal") {
            const result = await handleHorizontalApprove(
              payrollId,
              approverId,
              minimumApprover,
              approverLevel,
              approverRole,
              payrollStatus
            );
            res.status(200).json(result);
          } else if (companyApprovalMethod === "hierarchy") {
            const result = await handleHierarchicalApprove(
              payrollId,
              approverId,
              companyApprovalLevel,
              approverLevel,
              approverRole,
              payrollStatus
            );

            //console(result);
          } else {
            return res.status(400).json({
              message: "undefined Approval method",
            });
          }
        } else {
          //if master approval method there
          if (!isApproverMaster) {
            if (companyApprovalMethod === "horizontal") {
              const result = await handleHorizontalApprove(
                payrollId,
                approverId,
                minimumApprover,
                approverLevel,
                approverRole,
                payrollStatus
              );
            } else if (companyApprovalMethod === "hierarchy") {
              const result = await handleHierarchicalApprove(
                payrollId,
                approverId,
                companyApprovalLevel,
                approverLevel,
                approverRole,
                payrollStatus
              );
            } else {
              return res.status(400).json({
                message: "undefined Approval method",
              });
            }
          } else {
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
              return next(
                createError.createError(
                  503,
                  "An error occurred, please try again later"
                )
              );
            }
          }
        }
      }
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// Get all payrollApprovements
const getAllPayrollApprovements = async (req, res, next) => {
  const CompanyId = req.user.id;

  try {
    const criteria = {
      where: { CompanyId: CompanyId },
    };
    const payrollApprovements = await PayrollApprovement.findAll({
      where: { CompanyId: req.user.id },
    });

    res.json({
      count: payrollApprovements.length,
      payrollApprovements: payrollApprovements,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// Get a specific payrollApprovement by ID
const getPayrollApprovementById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const payrollApprovement = await PayrollApprovement.findByPk(id);
    if (payrollApprovement) {
      res.json(payrollApprovement);
    } else {
      res.status(404).json({ error: "PayrollApprovement not found" });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// Update a specific payrollApprovement by ID
const updatePayrollApprovement = async (req, res, next) => {
  const { id } = req.params;
  try {
    const payrollApprovement = await PayrollApprovement.findByPk(id);
    if (payrollApprovement) {
      await payrollApprovement.update(req.body);
      res.json(payrollApprovement);
    } else {
      res.status(404).json({ error: "PayrollApprovement not found" });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

const rejectPayrollApprovement = async (req, res, next) => {
  //reject for all if laast approver or master approver ject the payrol;
  const PayrollDefinitionId = req.body.PayrollDefinitionId;
  const approverId = req.body.approverId;
  const remark = req.body.remark;
  let message = {
    remark: remark,
    approverId: approverId,
    PayrollDefinitionId: PayrollDefinitionId,
  };

  try {
    const updatePayroll = await Payroll.update(
      { status: "rejected" },
      {
        where: {
          PayrollDefinitionId: PayrollDefinitionId,
          [Sequelize.Op.or]: [{ status: "processed" }, { status: "approved" }],
        },
      }
    );

    const updatePayrollDefinition = await PayrollDefinition.update(
      { status: "rejected" },
      {
        where: {
          id: PayrollDefinitionId,
          [Sequelize.Op.or]: [
            { status: "pending" },
            { status: "approved" },
            { status: "ordered" },
          ],
        },
      }
    );

    const updatePayrollApprovement = await PayrollApprovement.update(
      { status: "rejected", remark: remark, rejectedBy: approverId },
      { where: { PayrollDefinitionId: PayrollDefinitionId } }
    );

    let updated = {
      payroll: updatePayroll,
      appprovemant: updatePayrollApprovement,
      definition: updatePayrollDefinition,
    };
    res.json({ updated, message });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// Delete a specific payrollApprovement by ID
async function deletePayrollApprovement(req, res) {
  const { id } = req.params;
  try {
    const payrollApprovement = await PayrollApprovement.findByPk(id);
    if (payrollApprovement) {
      await payrollApprovement.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "PayrollApprovement not found" });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
}

module.exports = {
  createPayrollApprovement,
  getAllPayrollApprovements,
  getPayrollApprovementById,
  updatePayrollApprovement,
  deletePayrollApprovement,
  rejectPayrollApprovement,
  reCreatePayrollApprovement,
};
