const EmployeePayrollApprovement = require('../models/employeePayrollApprovement')
const { Op } = require('sequelize')
//define model needed here {approvamethod}
const ApprovalMethod = require('../models/approvalMethod')
const Payroll = require('../models/Payroll')
const PayrollDefinition = require('../models/payrollDefinition')
const Approver = require('../models/approver')
const Employee = require('../models/employee')
const createError = require('../utils/error')
const { Sequelize } = require('sequelize')
const sequelize = require('../database/db')
const { exit } = require('shelljs')
// Controller actions
const getAllApprovements = async (req, res) => {
  try {
    const approvements = await EmployeePayrollApprovement.findAll()
    res.json(approvements)
    console.log('approvements')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const getApprovementById = async (req, res) => {
  const { id } = req.params
  try {
    const approvement = await Payroll.findAll({
      where: {
        PayrollDefinitionId: id
      }
    })
    if (!approvement) {
      return res.status(404).json({ message: 'Approvement not found' })
    }
    res.json(approvement)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const createApprovement = async (req, res, next) => {
  // Define constant variable here for this endpoint
  const companyId = Number(req.user.id) // Company ID
  const payrollId = Number(req.body.Payrolls)
  const approverId = Number(req.body.approverId)

  try {
    //check if payroll exitst and processed
    const payroll = await Payroll.findOne({
      where: {
        id: payrollId
        // status: "processed",
      }
    })
    if (!payroll) {
      return 'no such a payroll created'
    }
    const employeeId = Number(payroll.EmployeeId)

    //approval method
    const approvalMethods = await ApprovalMethod.findOne({
      where: {
        CompanyId: companyId,
        isActive: true
      }
    })

    //is master approval
    const isThereMaster = await ApprovalMethod.findOne({
      where: {
        CompanyId: companyId,
        isActive: true
        // isThereMasterApprover: true,
      }
    })

    console.log('alls')
    if (approvalMethods === null || approvalMethods === undefined) {
      return res.json(
        'this company has no active approval method pleaase define one '
      )
    }

    //does this payroll processed//rejected
    const payrolls = await Payroll.findOne({
      where: {
        id: payrollId
      }
    })
    if (!payrolls) {
      return 'Payroll record not found'
    }

    //what is status of definition
    const payrollDefinitionId = payrolls.PayrollDefinitionId

    const payrollDefinition = await PayrollDefinition.findOne({
      attributes: ['status'],
      where: {
        id: payrollDefinitionId
      }
    })

    //am i approver
    const iAmApprover = await Approver.findOne({
      where: {
        id: approverId,
        isActive: true
      }
    })
    if (iAmApprover === null || iAmApprover === undefined) {
      return res.json('access denied, you are not active approver')
    }
    const approverLevel = iAmApprover.level
    //am i master approver
    const iAmMasterApprover = await Approver.findOne({
      where: {
        id: approverId,
        isActive: true,
        isMaster: true
      }
    })

    //checking for company approval method
    const hasActiveApprovalMethods =
      approvalMethods !== null && approvalMethods !== undefined
    const isMasterApproverAvailable =
      isThereMaster !== null && isThereMaster !== undefined
    const companyApprovalMethod = approvalMethods.approvalMethod
    const companyApprovalLevel = approvalMethods.approvalLevel
    const companyMinimumApprover = approvalMethods.minimumApprover
    const isComplete = approvalMethods.isCompleted
    if (isComplete !== true) {
      return res.json('the appoval method is not completed contact your admin ')
    }

    //checkjing for payroll
    const isPayrollProcessed = payroll !== null && payroll !== undefined

    //checking for payrolldefinition
    const isPayrollDefinitionOrdered =
      payrollDefinition !== null && payrollDefinition !== undefined
    const payrollDefinitionStatus = payrollDefinition.status
    //checking on approver
    const amIActiveApprover = iAmApprover !== null && iAmApprover !== undefined
    const amIMasterApprover =
      iAmMasterApprover !== null && iAmMasterApprover !== undefined
    //check if approved by me

    const employepayrollapprove = await EmployeePayrollApprovement.count({
      where: {
        ApproverId: approverId,
        PayrollId: payrollId
      }
    })
    if (employepayrollapprove >= 1) {
      return res.json('you already approved this')
    }
    //do algorithm now
    if (hasActiveApprovalMethods) {
      //check if payroll ordered
      if (payrollDefinitionStatus !== 'ordered') {
        return res.json('sorry,this payroll is not ordered yet!')
      }
      //check if i am active
      if (!amIActiveApprover) {
        return res.json(
          'sorry, Your account does not have the necessary permissions to proceed'
        )
      }
      //check if company has master approver
      if (!isMasterApproverAvailable) {
        //check approval method of company

        if (companyApprovalMethod === 'hierarchy') {
          //call herarchical method
          const eachPayrollStatus = payrolls.status

          const herreturn = await handleHierarchicalApprove(
            payrollDefinitionId,
            companyId,
            companyMinimumApprover,
            companyApprovalLevel,
            eachPayrollStatus,
            isPayrollDefinitionOrdered,
            payrollId,
            approverId,
            approverLevel,
            employeeId,
            res
          )
          return res.json(herreturn)
        } else if (companyApprovalMethod === 'horizontal') {
          //call horizontal method
          const eachPayrollStatus = payrolls.status

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
          )
          return res.json(horreturn)
        } else {
          return res.json('sorry, undefined approval method')
        }
      } else {
        //check if i am master approver

        if (!amIMasterApprover) {
          //check approval method of company
          if (companyApprovalMethod === 'hierarchy') {
            //call herarchical method
            const eachPayrollStatus = payrolls.status

            const herreturn = await handleHierarchicalApprove(
              payrollDefinitionId,
              companyId,
              companyMinimumApprover,
              companyApprovalLevel,
              eachPayrollStatus,
              isPayrollDefinitionOrdered,
              payrollId,
              approverId,
              approverLevel,
              employeeId,
              res
            )
            return res.status(200).json(herreturn)
          } else if (companyApprovalMethod === 'horizontal') {
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
            )
            return res.json(horreturn)
          } else {
            return res.json('sorry, undefined approval method')
          }
        } else if (amIMasterApprover) {
          //check payroll is approved
          const isApproved = await Payroll.findOne({
            where: {
              id: payrollId,
              status: 'approved'
            }
          })
          const isActivated = await Payroll.findOne({
            where: {
              id: payrollId,
              status: 'active'
            }
          })
          if (isActivated) {
            return res.json('already activated')
          }
          if (!isApproved) {
            return res.json('not approved')
          }
          await isApproved.update({ status: 'active' })
          return res.json('payroll activated  successfully')
        }
      }
    } else {
      return res.json('your approval method is not active')
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
const getApprovementByPayrollId = async (req, res) => {
  const { id } = req.params
  try {
    const approvement = await Payroll.findAll({
      where: {
        PayrollDefinitionId: id
      },
      attributes: ['id'],
      raw: true
    })

    if (!approvement) {
      return res.status(404).json({ message: 'Approvement not found' })
    }

    const payrollIds = approvement.map(item => item.id)

    const payrolls = await EmployeePayrollApprovement.findAll({
      where: {
        id: {
          [Op.in]: payrollIds
        }
      }
    })

    res.json(payrolls)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const updateApprovement = async (req, res) => {
  try {
    const approvement = await EmployeePayrollApprovement.findByPk(id)
    if (!approvement) {
      return res.status(404).json({ message: 'Approvement not found' })
    }
    res.json('update approve')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const deleteApprovement = async (req, res) => {
  try {
    const approvement = await EmployeePayrollApprovement.findByPk(id)
    if (!approvement) {
      return res.status(404).json({ message: 'Approvement not found' })
    }

    res.status(204).json('deleted successfully')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const arrayApproveApprovement = async (req, res, next) => {
  // Define constant variables here for this endpoint

  try {
    const companyId =
      req.user.role === 'approver' ? req.user.CompanyId : Number(req.user.id) // Company ID
    const payrollIds = req.body.Payrolls // Array of Payroll IDs
    const approverId = Number(req.body.approverId)
    const results = []

    const role = req.user.role //

    // return res.json(req?.user?.CompanyId)
    // Iterate over the array of payroll IDs
    for (const payrollId of payrollIds) {
      if (isNaN(payrollId) || payrollId === NaN) {
        console.log(`Invalid payroll ID: ${payrollId}`)
        console.log(`Invalid payroll ID: ${payrollId}`)
        continue // Skip to the next iteration
      }
      console.log('payrollids', payrollIds)
      try {
        // Check if payroll exists and is processed
        const payroll = await Payroll.findOne({
          where: {
            id: payrollId
          }
        })

        if (!payroll) {
          results.push(`No such payroll created: ${payrollId}`)
          continue // Skip to the next iteration
        }

        const employeeId = Number(payroll.EmployeeId)

        // Approval method
        const approvalMethods = await ApprovalMethod.findOne({
          where: {
            CompanyId: companyId,
            isActive: true
          }
        })

        // Is there a master approval?
        const isThereMaster = await ApprovalMethod.findOne({
          where: {
            CompanyId: companyId,
            isActive: true,
            isThereMasterApprover: true
          }
        })

        if (!approvalMethods) {
          return next(
            createError.createError(
              404,
              'This company has no active approval method. Please define one'
            )
          )
        }

        // Does this payroll processed/rejected?
        const payrolls = await Payroll.findOne({
          where: {
            id: payrollId
          }
        })

        if (!payrolls) {
          results.push('Payroll record not found')
          continue // Skip to the next iteration
        }

        // What is the status of the definition?
        const payrollDefinitionId = payrolls.PayrollDefinitionId

        const payrollDefinition = await PayrollDefinition.findOne({
          attributes: ['status'],
          where: {
            id: payrollDefinitionId
          }
        })

        // return res.json(payrollDefinitionId )

        // Am I an approver?
        const iAmApprover = await Approver.findOne({
          where: {
            id: approverId,
            isActive: true
          }
        })

        if (!iAmApprover) {
          results.push('Access denied. You are not an active approver.')
          continue // Skip to the next iteration
        }

        const approverLevel = iAmApprover.level

        // Am I a master approver?
        const iAmMasterApprover = await Approver.findOne({
          where: {
            id: approverId,
            isActive: true,
            isMaster: true
          }
        })

        // Checking for company approval method
        const hasActiveApprovalMethods = !!approvalMethods
        const isMasterApproverAvailable = !!isThereMaster
        const companyApprovalMethod = approvalMethods.approvalMethod
        const companyApprovalLevel = approvalMethods.approvalLevel
        const companyMinimumApprover = approvalMethods.minimumApprover
        const isComplete = approvalMethods.isCompleted

        if (!isComplete) {
          results.push(
            'The approval method is not completed. Contact your admin.'
          )
          continue // Skip to the next iteration
        }

        // Check for payroll
        const isPayrollProcessed = !!payroll

        // Checking for payroll definition
        const isPayrollDefinitionOrdered =
          (payrollDefinition && payrollDefinition.status === 'ordered') ||
          payrollDefinition.status === 'pending' ||
          payrollDefinition.status === 'approved'

        // Checking on approver
        const amIActiveApprover = !!iAmApprover
        const amIMasterApprover = !!iAmMasterApprover

        // Check if approved by me
        const employepayrollapprove = await EmployeePayrollApprovement.count({
          where: {
            ApproverId: approverId,
            PayrollId: payrollId,
            status: 'approved'
          }
        })

        if (employepayrollapprove >= 1) {
          results.push('You have already approved this payroll.')
          continue // Skip to the next iteration
        }

        // Perform the approval algorithm
        if (hasActiveApprovalMethods) {
          // Check if payroll is ordered
          if (!isPayrollDefinitionOrdered) {
            results.push('Sorry, this payroll is not ordered yet!')
            continue // Skip to the next iteration
          }

          // Check if I am an active approver
          if (!amIActiveApprover) {
            results.push(
              'Sorry, your account does not have the necessary permissions to proceed.'
            )
            continue // Skip to the next iteration
          }

          // Check if the company has a master approver
          if (!isMasterApproverAvailable) {
            // Check the company's approval method
            if (companyApprovalMethod === 'hierarchy') {
              // Call hiereachPayrollStatus
              //  const eachPayrollStatus = payrolls.status;
              const herreturn = await handleHierarchicalApprove(
                payrollDefinitionId,
                companyId,
                companyMinimumApprover,
                companyApprovalLevel,
                eachPayrollStatus,
                isPayrollDefinitionOrdered,
                payrollId,
                approverId,
                approverLevel,
                employeeId,
                res
              )
              results.push(herreturn)
            } else if (companyApprovalMethod === 'horizontal') {
              // Call horizontal method
              const eachPayrollStatus = payrolls.status
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
              )
              results.push(horreturn)
            } else {
              results.push('Sorry, undefined approval method.')
            }
          }

          //NOT MASTER APPROVER BUT ISMASTERAPPROVER TRUE
          else {
            // Check if I am a master approver
            if (!amIMasterApprover) {
              // Check the company's approval method
              if (companyApprovalMethod === 'hierarchy') {
                // Call hierarchical method
                const eachPayrollStatus = payrolls.status

                // const employeePayrollApprovement= await Payroll.findAll(
                // );
                // return res.json("data", employeePayrollApprovement)
                // if(employeePayrollApprovement){
                //   return next(createError.createError(400,"Previous levels have not been approved"))
                // }

                const herreturn = await handleHierarchicalApprove(
                  payrollDefinitionId,
                  companyId,
                  companyMinimumApprover,
                  companyApprovalLevel,
                  eachPayrollStatus,
                  isPayrollDefinitionOrdered,
                  payrollId,
                  approverId,
                  approverLevel,
                  employeeId,
                  res
                )

                // return res.json({isPayrollDefinitionOrdered:isPayrollDefinitionOrdered})
                results.push(herreturn)
              } else if (companyApprovalMethod === 'horizontal') {
                // Call horizontal method
                const eachPayrollStatus = payrolls.status
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
                )
                results.push(horreturn)
              } else {
                results.push('Sorry, undefined approval method.')
              }
            } else if (amIMasterApprover) {
              // Check if the payroll is already approved
              const isApproved = await Payroll.findOne({
                where: {
                  id: payrollId,
                  status: 'approved'
                }
              })

              // return res.json({"payrolls.status":!isApproved})
              // does payroll activated
              const isActivated = await Payroll.findOne({
                where: {
                  id: payrollId,
                  status: 'active'
                }
              })

              // const isActivated = await Payroll.findOne({
              //   where: {
              //     id: payrollId,
              //     status: "active",
              //   },
              // });

              // if (isActivated) {
              //   results.push("Already activated.");
              //   continue; // Skip to the next iteration
              // }

              if (!isApproved) {
                results.push('Not approved.')
                continue // Skip to the next iteration
              }
              return res.status(200).json(isApproved)
              const data = await isApproved.update({ status: 'active' })
              // return res.status(200).json("data");
              results.push('Payroll activated successfully.')
            }
          }
        } else {
          results.push('Your approval method is not active.')
        }
      } catch (error) {
        console.error(`Error processing payroll with ID ${payrollId}:`, error)
        continue // Skip to the next iteration
      }
    }

    console.log('For loop finished')
    return res.status(200).json(results)
  } catch (error) {
    console.error(error)
    // return res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleHierarchicalApprove (
  payrollDefinitionId,
  companyId,
  companyMinimumApprover,
  companyApprovalLevel,
  eachPayrollStatus,
  isPayrollDefinitionOrdered,
  payrollId,
  approverId,
  approverLevel,
  employeeId,
  res
) {
  // return res.json({data:  companyId,
  //   companyMinimumApprover:companyApprovalLevel,
  //   companyApprovalLevel:companyApprovalLevel,
  //   eachPayrollStatus:eachPayrollStatus,
  //   isPayrollDefinitionOrdered:isPayrollDefinitionOrdered,
  //   payrollId:payrollId,
  //   approverId:approverId,
  //   approverLevel:approverLevel,
  //   employeeId:employeeId})
  // return "eachPayrollStatus"
  // Do hierarchical method

  const employeeApprovement = await EmployeePayrollApprovement.findOne({
    where: {
      CompanyId: companyId,
      level: approverLevel - 1
    }
  })
  // return res.status(400).json({"Previous levels have not been approved":eachPayrollStatus})
  if (!isPayrollDefinitionOrdered) {
    // return next()
    return res.status(400).json('This payroll has not been ordered yet.')
  }

  const allowedStatuses = ['ordered', 'processed', 'rejected']
  if (eachPayrollStatus === 'approved') {
    return 'This payroll has already been approved.'
  } else if (allowedStatuses.includes(eachPayrollStatus)) {
    if (Number(approverLevel) !== 1) {
      return 'The level 1 approver should approve first.'
    }

    const updatePayroll = await Payroll.findOne({
      where: {
        id: payrollId
      }
    })

    if (!updatePayroll) {
      return 'Payroll record not found.'
    }

    const eachPayrollStatus = 'pending'
    const employeestatus = 'approved'
    const level = 1
    // const payrollDefinitionId= payrollDefinitionId;
    const payrollDefinitionStatus = 'pending'
    const approvedDate = new Date()

    const approveResult = await handlePayrollApprove(
      payrollDefinitionId,
      payrollDefinitionStatus,
      payrollId,
      eachPayrollStatus,
      employeestatus,
      level,
      approvedDate,
      approverId,
      employeeId,
      companyId
    )

    return `Payroll approved successfully. Level: ${level}`
  } else if (eachPayrollStatus === 'pending') {
    const previousApprover = await EmployeePayrollApprovement.findOne({
      where: {
        level: approverLevel - 1,
        CompanyId: companyId
      }
    })
    // return res.json("previusApprover",previousApprover)
    if (!previousApprover) {
      return res.status(400).json({
        message: 'Previous levels have not been approved   '
        // previousApprover
      })
    }
    const foundHeriarchialApprovement =
      await EmployeePayrollApprovement.findOne({
        where: {
          status: 'Approved',
          level: approverLevel
        }
      })

    if (foundHeriarchialApprovement) {
      return res.status(400).json({
        message: 'This level is approved already  '
        // previousApprover
      })
    }

    const updatePayroll = await Payroll.findOne({
      where: {
        id: payrollId
      }
    })

    if (!updatePayroll) {
      return 'Payroll record not found.'
    }

    const eachPayrollStatus =
      companyApprovalLevel === approverLevel ? 'approved' : 'pending'
    const employeestatus = 'approved'
    const level = app
    const approvedDate = new Date()
    const payrollDefinitionStatus =
      companyApprovalLevel == approverLevel ? 'approved' : 'pending'

    const approveresult = await handlePayrollApprove(
      payrollDefinitionId,
      payrollDefinitionStatus,
      payrollId,
      eachPayrollStatus,
      employeestatus,
      level,
      approvedDate,
      approverId,
      employeeId,
      companyId
    )

    return `Payroll approved successfully. Level: ${level}`
  }

  // return res.json(checkApprover)
  // if (Number(approverLevel) !== 2) {
  //   if (Number(approverLevel) === 1) {
  //     return "This payroll is already approved at your level.";
  //   }
  //   else if (Number(approverLevel) === 3) {
  //     const isTwoApprove = await EmployeePayrollApprovement.count({
  //       where: {
  //         level: 2,
  //         PayrollId: payrollId,
  //       },
  //     });

  //     if (isTwoApprove < 1) {
  //       return "Level 2 should approve before you.";
  //     }

  //     const updatePayroll = await Payroll.findOne({
  //       where: {
  //         id: payrollId,
  //       },
  //     });

  //     if (!updatePayroll) {
  //       return "Payroll record not found.";
  //     }

  //     const eachPayrollStatus = "approved";
  //     const employeestatus = "approved";
  //     const level = 3;
  //     const approvedDate = new Date();
  //     const payrollDefinitionStatus ='pending';

  //     const approveresult = await handlePayrollApprove(
  //       payrollDefinitionId,
  //       payrollDefinitionStatus,
  //       payrollId,
  //       eachPayrollStatus,
  //       employeestatus,
  //       level,
  //       approvedDate,
  //       approverId,
  //       employeeId,
  //       companyId
  //     );

  //     return `Payroll approved successfully. Level: ${level}`;
  //   } else {
  //     return "Something went wrong. Please try again.";
  //   }
  // }
  //  else if (Number(approverLevel) === 2) {
  //   if (Number(companyApprovalLevel) === 2) {
  //     const updatePayroll = await Payroll.findOne({
  //       where: {
  //         id: payrollId,
  //       },
  //     });

  //     if (!updatePayroll) {
  //       return "Payroll record not found.";
  //     }

  //     const eachPayrollStatus = "approved";
  //     const employeestatus = "approved";
  //     const level = 2;
  //     const approvedDate = new Date();
  //     const payrollDefinitionStatus='approved';

  //     const approveresult = await handlePayrollApprove(

  //       payrollDefinitionId,
  //       payrollDefinitionStatus,
  //       payrollId,
  //       eachPayrollStatus,
  //       employeestatus,
  //       level,
  //       approvedDate,
  //       approverId,
  //       employeeId,
  //       companyId
  //     );

  //     return `Payroll approved successfully. Level: ${level}`;
  //   }
  //   // else if (Number(companyApprovalLevel) === 3) {
  //   //   const updatePayroll = await Payroll.findOne({
  //   //     where: {
  //   //       id: payrollId,
  //   //     },
  //   //   });

  //   //   if (!updatePayroll) {
  //   //     return "Payroll record not found.";
  //   //   }

  //   //   const eachPayrollStatus = "pending";
  //   //   const employeestatus = "approved";
  //   //   const level = 2;
  //   //   const approvedDate = new Date();

  //   //   const approveresult = await handlePayrollApprove(
  //   //     payrollId,
  //   //     eachPayrollStatus,
  //   //     employeestatus,
  //   //     level,
  //   //     approvedDate,
  //   //     approverId,
  //   //     employeeId,
  //   //     companyId
  //   //   );

  //   //   return `Payroll approved successfully. Level: ${level}`;
  //   // }
  // }
  else {
    return 'Undefined payroll status.'
  }
}

async function handleHorizontalApprove (
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
    return 'This payroll has not been ordered yet.'
  }

  const isMinimumApproved = await EmployeePayrollApprovement.count({
    where: {
      PayrollId: payrollId
    }
  })

  const compLevel = Number(companyMinimumApprover)
  const approved = Number(isMinimumApproved)
  const isLast = approved + 1

  if (approved >= compLevel) {
    return 'This payroll has already been approved.'
  } else if (isLast < compLevel) {
    const updatePayroll = await Payroll.findOne({
      where: {
        id: payrollId
      }
    })

    if (!updatePayroll) {
      return 'Payroll record not found.'
    }

    const eachPayrollStatus = 'pending'
    const employeestatus = 'approved'
    const level = 1
    const approvedDate = new Date()

    const approveresult = await handlePayrollApprove(
      payrollId,
      eachPayrollStatus,
      employeestatus,
      level,
      approvedDate,
      approverId,
      employeeId,
      companyId
    )

    return `Payroll approved successfully. Level: ${level}`
  } else if (isLast === compLevel) {
    const updatePayroll = await Payroll.findOne({
      where: {
        id: payrollId
      }
    })

    if (!updatePayroll) {
      return 'Payroll record not found.'
    }

    const eachPayrollStatus = 'approved'
    const employeestatus = 'approved'
    const level = 1
    const approvedDate = new Date()

    const approveresult = await handlePayrollApprove(
      payrollId,
      eachPayrollStatus,
      employeestatus,
      level,
      approvedDate,
      approverId,
      employeeId,
      companyId
    )

    return `Payroll approved successfully. Level: ${level}`
  } else {
    return 'Some error occurred.'
  }
}

async function handlePayrollApprove (
  payrollDefinitionId,
  payrollDefinitionStatus,
  payrollId,
  eachPayrollStatus,
  employeestatus,
  level,
  approvedDate,
  approverId,
  employeeId,
  companyId
) {
  const payroll = await Payroll.findOne({ where: { id: payrollId } })
  const payrollDefinition = await PayrollDefinition.findOne({
    where: { CompanyId: companyId, id: payrollDefinitionId }
  })
  if (!payroll) {
    return 'Payroll not found.'
  }

  const newApprovement = await EmployeePayrollApprovement.create({
    status: employeestatus,
    remark: '',
    level: level,
    approvedDate: approvedDate,
    PayrollId: payrollId,
    ApproverId: approverId,
    EmployeeId: employeeId,
    CompanyId: companyId
  })
  await payroll.update({ status: eachPayrollStatus })
  await payrollDefinition.update({ status: payrollDefinitionStatus })

  return {
    message: 'Payroll activated successfully.',
    payroll: payroll,
    approvement: newApprovement
  }
}

const rejectPayroll = async (req, res, next) => {
  const companyId = Number(req.user.id) // Company ID
  const payrollIds = Array.isArray(req.body.Payrolls)
    ? req.body.Payrolls
    : [Number(req.body.Payrolls)] // Convert to an array
  const approverId = Number(req.body.approverId)
  const results = []
  const remark = req.body.remark

  try {
    // check if company has active approval method
    const activeApprovalMethod = await ApprovalMethod.findOne({
      where: {
        CompanyId: companyId,
        isActive: true
      }
    })

    if (!activeApprovalMethod) {
      return res.json(
        'Your company has no active approval method defined. Contact the admin!'
      )
    }

    // check if I am an active approver
    const activeApprover = await Approver.findOne({
      where: {
        id: approverId,
        isActive: true
      }
    })

    if (!activeApprover) {
      return res.json('You are not an active approver.')
    }

    // Process each payroll ID in the array
    for (const payrollId of payrollIds) {
      // Check if payroll exists
      const thisPayroll = await Payroll.findOne({
        where: {
          id: payrollId
        }
      })

      if (!thisPayroll) {
        results.push({ payrollId, status: 'not found' })
      } else {
        // Update EmployeePayrollApprovement record
        const recordToUpdateOnApprovement =
          await EmployeePayrollApprovement.update(
            {
              status: 'rejected',
              rejectedBy: approverId,
              remark: remark
            },
            {
              where: {
                PayrollId: payrollId
              }
            }
          )

        if (!recordToUpdateOnApprovement) {
          results.push({ payrollId, status: 'approvement record not found' })
        } else {
          await thisPayroll.update({ status: 'rejected' })

          results.push({
            payrollId,
            status: 'rejected',
            rejectedBy: approverId,
            remark: 'revice allowance'
          })
        }
      }
    }

    return res.json(results)
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'An error occurred while updating payrolls.' })
  }
}

async function handleHierarchical (
  payroll,
  payrollDefinitionId,
  companyId,
  companyMinimumApprover,
  companyApprovalLevel,
  eachPayrollStatus,
  isPayrollDefinitionOrdered,
  payrollId,
  approverId,
  approverLevel,
  employeeId,
  res,
  next
) {
  const employeeApprovement = await EmployeePayrollApprovement.findOne({
    where: {
      CompanyId: companyId,
      level: approverLevel - 1
    }
  })
  // return res.status(400).json({"Previous levels have not been approved":eachPayrollStatus})
  if (!isPayrollDefinitionOrdered) {
    // return next()
    return res.status(400).json('This payroll has not been ordered yet.')
  }

  const allowedStatuses = ['ordered', 'processed']
  if (eachPayrollStatus === 'approved') {
    return 'This payroll has already been approved.'
  } else if (allowedStatuses.includes(eachPayrollStatus)) {
    // return res.status(200).json("data1111")

    if (Number(approverLevel) !== 1) {
      return next(
        createError.createError(
          400,
          'The level 1 approver should approve first.'
        )
      )
    }

    const eachPayrollStatus = 'pending'
    const employeestatus = 'approved'
    const level = 1
    // const payrollDefinitionId= payrollDefinitionId;
    const payrollDefinitionStatus = 'pending'
    const approvedDate = new Date()

    const approveResult = await handlePayrollA(
      payrollDefinitionId,
      payrollDefinitionStatus,
      payrollId,
      eachPayrollStatus,
      employeestatus,
      level,
      approvedDate,
      approverId,
      employeeId,
      companyId
    )

    return `Payroll approved successfully. Level: ${level}`
  } else if (eachPayrollStatus === 'pending') {
    const previousApprover = await EmployeePayrollApprovement.findOne({
      where: {
        level: approverLevel - 1,
        CompanyId: companyId
      }
    })
    if (!previousApprover && approverLevel != 1) {
      return res.status(400).json({
        message: 'Previous levels have not been approved   '
        // previousApprover
      })
    }
    const foundHeriarchialApprovement =
      await EmployeePayrollApprovement.findOne({
        where: {
          status: 'Approved',
          level: approverLevel
        }
      })

    // if(foundHeriarchialApprovement){
    //   return res.status(400).json({message:"This level is approved already  ",
    //   // previousApprover
    //   })
    // }
    const eachPayrollStatus =
      companyApprovalLevel === approverLevel ? 'approved' : 'pending'
    const employeestatus = 'approved'
    const level = approverLevel
    const approvedDate = new Date()
    const payrollDefinitionStatus =
      companyApprovalLevel == approverLevel ? 'approved' : 'pending'

    const approveresult = await handlePayrollApprove(
      payrollDefinitionId,
      payrollDefinitionStatus,
      payrollId,
      eachPayrollStatus,
      employeestatus,
      level,
      approvedDate,
      approverId,
      employeeId,
      companyId
    )

    return `Payroll approved successfully. Level: ${level}`
  }

  // return res.json(checkApprover)
  // if (Number(approverLevel) !== 2) {
  //   if (Number(approverLevel) === 1) {
  //     return "This payroll is already approved at your level.";
  //   }
  //   else if (Number(approverLevel) === 3) {
  //     const isTwoApprove = await EmployeePayrollApprovement.count({
  //       where: {
  //         level: 2,
  //         PayrollId: payrollId,
  //       },
  //     });

  //     if (isTwoApprove < 1) {
  //       return "Level 2 should approve before you.";
  //     }

  //     const updatePayroll = await Payroll.findOne({
  //       where: {
  //         id: payrollId,
  //       },
  //     });

  //     if (!updatePayroll) {
  //       return "Payroll record not found.";
  //     }

  //     const eachPayrollStatus = "approved";
  //     const employeestatus = "approved";
  //     const level = 3;
  //     const approvedDate = new Date();
  //     const payrollDefinitionStatus ='pending';

  //     const approveresult = await handlePayrollApprove(
  //       payrollDefinitionId,
  //       payrollDefinitionStatus,
  //       payrollId,
  //       eachPayrollStatus,
  //       employeestatus,
  //       level,
  //       approvedDate,
  //       approverId,
  //       employeeId,
  //       companyId
  //     );

  //     return `Payroll approved successfully. Level: ${level}`;
  //   } else {
  //     return "Something went wrong. Please try again.";
  //   }
  // }
  //  else if (Number(approverLevel) === 2) {
  //   if (Number(companyApprovalLevel) === 2) {
  //     const updatePayroll = await Payroll.findOne({
  //       where: {
  //         id: payrollId,
  //       },
  //     });

  //     if (!updatePayroll) {
  //       return "Payroll record not found.";
  //     }

  //     const eachPayrollStatus = "approved";
  //     const employeestatus = "approved";
  //     const level = 2;
  //     const approvedDate = new Date();
  //     const payrollDefinitionStatus='approved';

  //     const approveresult = await handlePayrollApprove(

  //       payrollDefinitionId,
  //       payrollDefinitionStatus,
  //       payrollId,
  //       eachPayrollStatus,
  //       employeestatus,
  //       level,
  //       approvedDate,
  //       approverId,
  //       employeeId,
  //       companyId
  //     );

  //     return `Payroll approved successfully. Level: ${level}`;
  //   }
  //   // else if (Number(companyApprovalLevel) === 3) {
  //   //   const updatePayroll = await Payroll.findOne({
  //   //     where: {
  //   //       id: payrollId,
  //   //     },
  //   //   });

  //   //   if (!updatePayroll) {
  //   //     return "Payroll record not found.";
  //   //   }

  //   //   const eachPayrollStatus = "pending";
  //   //   const employeestatus = "approved";
  //   //   const level = 2;
  //   //   const approvedDate = new Date();

  //   //   const approveresult = await handlePayrollApprove(
  //   //     payrollId,
  //   //     eachPayrollStatus,
  //   //     employeestatus,
  //   //     level,
  //   //     approvedDate,
  //   //     approverId,
  //   //     employeeId,
  //   //     companyId
  //   //   );

  //   //   return `Payroll approved successfully. Level: ${level}`;
  //   // }
  // }
  else {
    return 'Undefined payroll status.'
  }
}

async function handlePayrollA (
  payrollDefinitionId,
  payrollDefinitionStatus,
  payrollId,
  eachPayrollStatus,
  employeestatus,
  level,
  approvedDate,
  approverId,
  employeeId,
  companyId
) {
  console.log('Payroll')

  const payroll = await Payroll.findOne({ where: { id: payrollId } })
  const payrollDefinition = await PayrollDefinition.findOne({
    where: { CompanyId: companyId, id: payrollDefinitionId }
  })
  if (!payroll) {
    return 'Payroll not found.'
  }
  const newApprovement = await EmployeePayrollApprovement.create({
    status: employeestatus,
    remark: '',
    level: level,
    approvedDate: approvedDate,
    PayrollId: payrollId,
    ApproverId: approverId,
    EmployeeId: employeeId,
    CompanyId: companyId
  })
  await payroll.update({ status: eachPayrollStatus })
  await payrollDefinition.update({ status: payrollDefinitionStatus })

  return {
    message: 'Payroll activated successfully.',
    payroll: payroll,
    approvement: newApprovement
  }
}

const arrayApprove2Approvement = async (req, res) => {
  // Define constant variables here for this endpoint
  const companyId = Number(req.user.id) // Company ID
  const payrollIds = req.body.Payrolls // Array of Payroll IDs
  const approverId = Number(req.body.approverId)
  const results = []
  try {
    // Iterate over the array of payroll IDs
    for (const payrollId of payrollIds) {
      if (isNaN(payrollId) || payrollId === NaN) {
        console.log(`Invalid payroll ID: ${payrollId}`)
        console.log(`Invalid payroll ID: ${payrollId}`)
        continue // Skip to the next iteration
      }
      console.log('payrollids', payrollIds)
      try {
        // Check if payroll exists and is processed
        const payroll = await Payroll.findOne({
          where: {
            id: payrollId
          }
        })

        // return res.json(payroll)
        console.log(`Payroll ${payroll}`)

        if (!payroll) {
          results.push(`No such payroll created: ${payrollId}`)
          continue // Skip to the next iteration
        }

        const employeeId = Number(payroll.EmployeeId)

        // Approval method
        const approvalMethods = await ApprovalMethod.findOne({
          where: {
            CompanyId: companyId,
            isActive: true
          }
        })
        // return res.status(200).json("data1111",approvalMethods  )

        // Is there a master approval?
        const isThereMaster = await ApprovalMethod.findOne({
          where: {
            CompanyId: companyId,
            isActive: true,
            isThereMasterApprover: true
          }
        })

        // return res.status(200).json("data1111")

        // if (!approvalMethods) {
        //   results.push(
        //     "This company has no active approval method. Please define one."
        //   );
        //   continue; // Skip to the next iteration
        // }

        // Does this payroll processed/rejected?
        const payrolls = await Payroll.findOne({
          where: {
            id: payrollId
          }
        })

        if (!payrolls) {
          results.push('Payroll record not found')
          continue // Skip to the next iteration
        }

        // What is the status of the definition?
        const payrollDefinitionId = payrolls.PayrollDefinitionId

        const payrollDefinition = await PayrollDefinition.findOne({
          attributes: ['status'],
          where: {
            id: payrollDefinitionId
          }
        })

        // Am I an approver?
        const iAmApprover = await Approver.findOne({
          where: {
            id: approverId,
            isActive: true
          }
        })

        if (!iAmApprover) {
          results.push('Access denied. You are not an active approver.')
          continue // Skip to the next iteration
        }

        const approverLevel = iAmApprover.level

        // Am I a master approver?
        const iAmMasterApprover = await Approver.findOne({
          where: {
            id: approverId,
            isActive: true,
            isMaster: true
          }
        })

        // Checking for company approval method
        const hasActiveApprovalMethods = !!approvalMethods
        const isMasterApproverAvailable = !!isThereMaster
        const companyApprovalMethod = approvalMethods.approvalMethod
        const companyApprovalLevel = approvalMethods.approvalLevel
        const companyMinimumApprover = approvalMethods.minimumApprover
        const isComplete = approvalMethods.isCompleted

        if (!isComplete) {
          results.push(
            'The approval method is not completed. Contact your admin.'
          )
          continue // Skip to the next iteration
        }

        // Check for payroll
        const isPayrollProcessed = !!payroll

        // Checking for payroll definition
        const isPayrollDefinitionOrdered =
          payrollDefinition && payrollDefinition.status === 'ordered'

        // Checking on approver
        const amIActiveApprover = !!iAmApprover
        const amIMasterApprover = !!iAmMasterApprover

        // Check if approved by me
        const employepayrollapprove = await EmployeePayrollApprovement.count({
          where: {
            ApproverId: approverId,
            PayrollId: payrollId,
            status: 'approved'
          }
        })

        if (employepayrollapprove >= 1) {
          results.push('You have already approved this payroll.')
          continue // Skip to the next iteration
        }

        // Perform the approval algorithm
        if (hasActiveApprovalMethods) {
          // Check if payroll is ordered
          if (!isPayrollDefinitionOrdered) {
            results.push('Sorry, this payroll is not ordered yet!')
            continue // Skip to the next iteration
          }

          // Check if I am an active approver
          if (!amIActiveApprover) {
            results.push(
              'Sorry, your account does not have the necessary permissions to proceed.'
            )
            continue // Skip to the next iteration
          }

          // Check if the company has a master approver
          if (!isMasterApproverAvailable) {
            // Check the company's approval method
            if (companyApprovalMethod === 'hierarchy') {
              // Call hierarchical method
              const eachPayrollStatus = payrolls.status
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
              )
              results.push(herreturn)
            } else if (companyApprovalMethod === 'horizontal') {
              // Call horizontal method
              const eachPayrollStatus = payrolls.status
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
              )
              results.push(horreturn)
            } else {
              results.push('Sorry, undefined approval method.')
            }
          } else {
            // Check if I am a master approver
            if (!amIMasterApprover) {
              // Check the company's approval method
              if (companyApprovalMethod === 'hierarchy') {
                // Call hierarchical method
                const eachPayrollStatus = payrolls.status
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
                )
                results.push(herreturn)
              } else if (companyApprovalMethod === 'horizontal') {
                // Call horizontal method
                const eachPayrollStatus = payrolls.status
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
                )
                results.push(horreturn)
              } else {
                results.push('Sorry, undefined approval method.')
              }
            } else if (amIMasterApprover) {
              // Check if the payroll is already approved
              const isApproved = await Payroll.findOne({
                where: {
                  id: payrollId,
                  status: 'approved'
                }
              })
              // does payroll activated
              const isActivated = await Payroll.findOne({
                where: {
                  id: payrollId,
                  status: 'active'
                }
              })

              if (isActivated) {
                results.push('Already activated.')
                continue // Skip to the next iteration
              }

              if (!isApproved) {
                results.push('Not approved.')
                continue // Skip to the next iteration
              }

              await isApproved.update({ status: 'active' })

              results.push('Payroll activated successfully.')
            }
          }
        } else {
          results.push('Your approval method is not active.')
        }
      } catch (error) {
        console.error(`Error processing payroll with ID ${payrollId}:`, error)
        continue // Skip to the next iteration
      }
    }

    console.log('For loop finished')
    return res.json(results)
  } catch (error) {
    console.error(error)
    // return res.status(500).json({ message: 'Internal server error' });
  }
}

const approveStatusOfPayroll = async (req, res, next) => {
  try {
    const companyId =
      req.user.role === 'approver' ? req.user.CompanyId : Number(req.user.id) 
    const payrollIds = req.body.Payrolls 

    const employeeId = Number(req.user.id)
    const results = []

    const role = req.user.role //
    const uniquePayrollDefinitionIds = await Payroll.findAll({
      attributes: [
        [
          sequelize.literal('DISTINCT "PayrollDefinitionId"'),
          'PayrollDefinitionId'
        ]
      ],
      where: {
        id: payrollIds
      },
      distinct: true
    })

    if (uniquePayrollDefinitionIds.length !== 1) {
      return next(
        createError.createError(
          400,
          'Payrolls have different PayrollDefinitionId values.'
        )
      )
    }

    const payrollDefinitionID =
      uniquePayrollDefinitionIds[0].PayrollDefinitionId

    const approver = await Approver.findOne({
      where: { EmployeeId: employeeId, isActive: true }
    })

    if (!approver) {
      return next(createError.createError(404, 'Approver not found'))
    }
    const approverId = Number(approver?.id)
    const approvalMethods = await ApprovalMethod.findOne({
      where: {
        CompanyId: companyId,
        isActive: true
      }
    })

    if (!approvalMethods) {
      return next(createError.createError(404, 'Define approval method first'))
    }

    if (!approvalMethods.isCompleted) {
      console.log(approvalMethods.isCompleted)
      return next(createError.createError(404, 'Assign all approver first'))
    }
    const isMasterApproverAvailable = approvalMethods.isThereMasterApprover
    const isActiveApprover = !!approver
    const approverLevel = approver.level
    const isMasterApprover = approver.isMaster
    const companyApprovalLevel = approvalMethods.approvalLevel
    const approvalType = approvalMethods.approvalMethod
    const minimumApprover = approvalMethods.minimumApprover
    let checkMaximumReached = false
    const checkPayrolls = await Payroll.findAll({
      where: {
        id: payrollIds,
        status: 'approved'
      }
    })

    if (checkPayrolls.length != 0) {
      return next(
        createError.createError(
          400,
          `   ${checkPayrolls.length}  Payroll already approved}`
        )
      )
    }
    const foundHeriarchialApprovement =
      await EmployeePayrollApprovement.findAll({
        where: {
          status: ['approved', 'pending'],
          level: approverLevel,
          PayrollId: payrollIds
        }
      })

    if (approvalType === 'hierarchy') {
      if (isMasterApprover && approvalType === 'hierarchy') {
        const previousApprovers = await EmployeePayrollApprovement.findAll({
          attributes: [
            'PayrollId',
            [sequelize.fn('MAX', sequelize.col('level')), 'maxLevel']
          ],
          where: {
            CompanyId: companyId,
            PayrollId: payrollIds
          },
          group: ['PayrollId']
        })

        const formattedResponse = payrollIds.map(payrollId => {
          const foundPayroll = previousApprovers.find(
            prevApprover => prevApprover?.PayrollId === payrollId
          )
          return {
            PayrollId: payrollId,
            maxLevel: foundPayroll ? foundPayroll?.dataValues?.maxLevel : 0
          }
        })

        formattedResponse.forEach(item => {
          console.log(item.PayrollId)
          console.log(item.maxLevel)
          //
          if (item.maxLevel < companyApprovalLevel) {
            checkMaximumReached = true
            return
          }
        })
        if (checkMaximumReached) {
          return next(
            createError.createError(
              400,
              `At least one payroll has not reached the required approval level.`
            )
          )
        }

        if (formattedResponse.length === 0) {
          return next(
            createError.createError(
              400,
              'Payrolls have reached the required approval level.'
            )
          )
        }
        const previousApprover = await EmployeePayrollApprovement.findAll({
          where: {
            level: companyApprovalLevel,
            CompanyId: companyId,
            PayrollId: payrollIds
          }
        })

        if (previousApprover.length === 0) {
          return next(
            createError.createError(
              400,
              `Its have to be approved first by other approvers`
            )
          )
        }
      }

      if (foundHeriarchialApprovement.length != 0 && !isMasterApprover) {
        return next(
          createError.createError(
            400,
            ` ${foundHeriarchialApprovement.length} payroll is  approved at this level `
          )
        )
      }
      const checkApproved = await EmployeePayrollApprovement.findAll({
        where: {
          ApproverId: approverId,
          PayrollId: payrollIds
          // status:"approved"
        }
      })

      if (checkApproved.length != 0 && !isMasterApprover) {
        console.log('2')
        return next(
          createError.createError(
            400,
            `   ${checkApproved.length}  Payroll already approved by the approver}`
          )
        )
      }
    }

    if (approvalType === 'horizontal') {
      const result = await EmployeePayrollApprovement.findAll({
        attributes: [
          'PayrollId',
          [sequelize.fn('COUNT', sequelize.col('ApproverId')), 'approverCount']
        ],
        where: {
          PayrollId: payrollIds
        },
        group: ['PayrollId'],
        having: sequelize.literal('COUNT(DISTINCT "ApproverId") < 2')
      })

      const checkApproved = await EmployeePayrollApprovement.findAll({
        where: {
          ApproverId: approverId,
          PayrollId: payrollIds
          // status:"approved"
        }
      })
      if (checkApproved.length != 0 && !isMasterApprover) {
        return next(
          createError.createError(
            400,
            `   ${checkApproved.length}  Payroll already approved by the approver}`
          )
        )
      }

      const getAprovedPayroll = await EmployeePayrollApprovement.findAll({
        where: {
          // status: ["Approved" , "pending"],
          // level:approverLevel,
          PayrollId: payrollIds
        }
      })
    }

    for (const payroll in payrollIds) {
      if (approvalType === 'hierarchy') {
        if (approverLevel != 1 && !isMasterApprover) {
          const previousApprover = await EmployeePayrollApprovement.findOne({
            where: {
              level: approverLevel - 1,
              CompanyId: companyId,
              PayrollId: payrollIds[payroll]
            }
          })

          if (!previousApprover || previousApprover?.length === 0) {
            return next(
              createError.createError(
                400,
                'Previous levels have not been approved'
              )
            )
          }
        }
      }
    }

    if (isMasterApproverAvailable) {
      const transaction = await sequelize.transaction()
      if (approvalType === 'horizontal') {
        if (isMasterApprover) {
          const level = 1
          const approvedDate = new Date()
          const approvementsData = payrollIds.map(async payrollId => {
            // try {
            const getAprovedPayroll = await EmployeePayrollApprovement.findAll({
              where: {
                PayrollId: payrollId
              }
            })

            if (getAprovedPayroll.length < minimumApprover) {
              return next(
                createError.createError(400, 'minimum approvel not reached')
              )
            }
            const payroll = await Payroll.findOne({
              where: { id: payrollId } 
            })
            await payroll.update(
              {
                status:
                  getAprovedPayroll?.length + 1 >= minimumApprover &&
                  isMasterApprover
                    ? 'approved'
                    : 'pending'
              },
              { transaction }
            )
            if (payroll && payroll.EmployeeId) {
              return {
                status: 'approved',
                remark: '',
                level: level,
                approvedDate: approvedDate,
                PayrollId: payrollId,
                ApproverId: approverId,
                EmployeeId: payroll.EmployeeId,
                CompanyId: companyId
              }
            } else {
              console.error(`No Payroll found for PayrollId: ${payrollId}`)
              return next(
                createError.createError(
                  404,
                  `No payroll found for payroll id  ${payrollId}`
                )
              )
            }
          })

          const validApprovementsData = (
            await Promise.all(approvementsData)
          ).filter(Boolean)

          try {
            const newApprovements = await EmployeePayrollApprovement.bulkCreate(
              validApprovementsData,
              { transaction }
            )

            await transaction.commit()

            const checkAllPayrollApproved = await Payroll.count({
              where: {
                PayrollDefinitionId: payrollDefinitionID,
                status: {
                  [Op.not]: 'approved' 
                }
              }
            })

            if (checkAllPayrollApproved === 0) {
              if (payrollDefinitionID) {
                const updated = await PayrollDefinition.update(
                  { status: 'approved' },
                  { where: { id: payrollDefinitionID } }
                )
              }
            }

            console.log('Bulk create successful:', newApprovements)
            return res.status(200).json({
              message: 'Payroll approved successfully.',
              data: validApprovementsData
            })
          } catch (error) {
            await transaction.rollback()
            console.error('Error creating bulk records:', error)
            return next(
              createError.createError(500, 'Error creating bulk records')
            )
          }
        }


        const level = 1 
        const approvementsData = payrollIds.map(async payrollId => {
          const getAprovedPayroll = await EmployeePayrollApprovement.findAll({
            where: {
              PayrollId: payrollId
            }
          })

          if (getAprovedPayroll.length >= minimumApprover) {
            return next(
              createError.createError(
                400,
                'Minimum approver is reached waiting for Master approver'
              )
            )
          }
          const payroll = await Payroll.findOne({
            where: { id: payrollId } 
          })
          await payroll.update({ status: 'pending' }, { transaction })
          if (payroll && payroll.EmployeeId) {
            return {
              status: 'approved',
              remark: '',
              level: level,
              approvedDate: approvedDate,
              PayrollId: payrollId,
              ApproverId: approverId,
              EmployeeId: payroll.EmployeeId,
              CompanyId: companyId
            }
          } else {
            console.error(`No Payroll found for PayrollId: ${payrollId}`)
            return next(
              createError.createError(
                404,
                `No payroll found for payroll id  ${payrollId}`
              )
            )
          }
        })

        const validApprovementsData = (
          await Promise.all(approvementsData)
        ).filter(Boolean)

        const newApprovements = await EmployeePayrollApprovement.bulkCreate(
          validApprovementsData,
          { transaction }
        )
        await transaction.commit()
        return res.status(200).json({
          message: 'Payroll approved successfully.',
          data: validApprovementsData
        })
      }

      if (approvalType === 'hierarchy') {
        const transaction = await sequelize.transaction()
        const level = approverLevel
        const approvedDate = new Date()
        const approvementsData = payrollIds.map(
          async payrollId => {
            // try {
            const payroll = await Payroll.findOne({
              where: { id: payrollId }
            })

            await payroll.update(
              { status: isMasterApprover ? 'approved' : 'pending' },
              { transaction }
            )
            if (payroll && payroll.EmployeeId) {
              return {
                status: 'approved',
                remark: '',
                level: level,
                approvedDate: approvedDate,
                PayrollId: payrollId,
                ApproverId: approverId,
                EmployeeId: payroll.EmployeeId,
                CompanyId: companyId
              }
            } else {
              console.error(`No Payroll found for PayrollId: ${payrollId}`)
              return next(
                createError.createError(
                  404,
                  `No payroll found for payroll id  ${payrollId}`
                )
              )
            }
          }
        )
        const validApprovementsData = (
          await Promise.all(approvementsData)
        ).filter(Boolean)

        try {
          const newApprovements = await EmployeePayrollApprovement.bulkCreate(
            validApprovementsData,
            { transaction }
          )
          await transaction.commit()
          const checkAllPayrollApproved = await Payroll.count({
            where: {
              PayrollDefinitionId: payrollDefinitionID,
              status: {
                [Op.not]: 'approved' 
              }
            }
          })
          if (checkAllPayrollApproved === 0) {
            if (payrollDefinitionID) {
              const updated = await PayrollDefinition.update(
                { status: 'approved' },
                { where: { id: payrollDefinitionID } }
              )
            }
          }
          return res.status(200).json({
            message: 'Payroll approved successfully.',
            data: validApprovementsData
          })
        } catch (error) {
          await transaction.rollback()
          console.error(
            'Error creating bulk records   vertical is master approvers:',
            error
          )
          return next(createError.createError(500, 'Internal server error'))
        }
      }
    }
    if (!isMasterApproverAvailable) {
      const transaction = await sequelize.transaction()
      if (approvalType === 'horizontal') {
        const level = 1
        const approvedDate = new Date()
        const approvementsData = payrollIds.map(async payrollId => {
          try {
            const getAprovedPayroll = await EmployeePayrollApprovement.findAll({
              where: {
                // status: ["Approved" , "pending"],
                // level:approverLevel,
                PayrollId: payrollId
              }
            })
            const payroll = await Payroll.findOne({
              where: { id: payrollId }
            })

            await payroll.update(
              {
                status:
                  getAprovedPayroll?.length + 1 < minimumApprover
                    ? 'pending'
                    : 'approved'
              },
              { transaction }
            )
            if (payroll && payroll.EmployeeId) {
              return {
                status: 'approved',
                remark: '',
                level: level,
                approvedDate: approvedDate,
                PayrollId: payrollId,
                ApproverId: approverId,
                EmployeeId: payroll.EmployeeId,
                CompanyId: companyId
              }
            } else {
              console.error(`No Payroll found for PayrollId: ${payrollId}`)
              return next(
                createError.createError(
                  404,
                  `No payroll found for payroll id  ${payrollId}`
                )
              )
            }
          } catch (error) {
            // await transaction.rollback();
            console.error(
              `Error retrieving Payroll for PayrollId: ${payrollId}`,
              error
            )
            return next(
              createError.createError(500, 'Error retrieving payrolls')
            )
          }
        })

        const validApprovementsData = (
          await Promise.all(approvementsData)
        ).filter(Boolean)

        try {
          const newApprovements = await EmployeePayrollApprovement.bulkCreate(
            validApprovementsData,
            { transaction }
          )
          await transaction.commit()

          const checkAllPayrollApproved = await Payroll.count({
            where: {
              PayrollDefinitionId: payrollDefinitionID,
              status: {
                [Op.not]: 'approved' // Exclude payrolls with status 'approved'
              }
            }
          })

          if (checkAllPayrollApproved === 0) {
            if (payrollDefinitionID) {
              const updated = await PayrollDefinition.update(
                { status: 'approved' },
                { where: { id: payrollDefinitionID } }
              )
            }
          }

          console.log('Bulk create successful:', newApprovements)
          return res.status(200).json({
            message: 'Payroll approved successfully.',
            data: validApprovementsData
          })
        } catch (error) {
          await transaction.rollback()
          console.error('Error creating bulk records:', error)

          return createError.createError(500, 'Internal server error')
        }
      }
      if (approvalType === 'hierarchy') {
        const level = approverLevel
        const approvedDate = new Date()
        const approvementsData = payrollIds.map(async payrollId => {
          try {
            const payroll = await Payroll.findOne({
              where: { id: payrollId }
            })

            await payroll.update(
              {
                status:
                  companyApprovalLevel != approverLevel ? 'pending' : 'approved'
              },
              { transaction }
            )
            if (payroll && payroll.EmployeeId) {
              return {
                status: 'approved',
                remark: '',
                level: level,
                approvedDate: approvedDate,
                PayrollId: payrollId,
                ApproverId: approverId,
                EmployeeId: payroll.EmployeeId,
                CompanyId: companyId
              }
            } else {
              console.error(`No Payroll found for PayrollId: ${payrollId}`)
              return next(
                createError.createError(
                  404,
                  `No payroll found for payroll id  ${payrollId}`
                )
              )
            }
          } catch (error) {
            console.error(
              `Error retrieving Payroll for PayrollId: ${payrollId}`,
              error
            )
            return createError.createError(
              500,
              'Error retrieving Payroll for PayrollId:'
            )
          }
        })

        const validApprovementsData = (
          await Promise.all(approvementsData)
        ).filter(Boolean)

        try {
          const newApprovements = await EmployeePayrollApprovement.bulkCreate(
            validApprovementsData,
            { transaction }
          )
          await transaction.commit()

          const checkAllPayrollApproved = await Payroll.count({
            where: {
              PayrollDefinitionId: payrollDefinitionID,
              status: {
                [Op.not]: 'approved'
              }
            }
          })

          if (checkAllPayrollApproved === 0) {
            if (payrollDefinitionID) {
              const updated = await PayrollDefinition.update(
                { status: 'approved' },
                { where: { id: payrollDefinitionID } }
              )
            }
          }

          console.log('Bulk create successful:', newApprovements)
          return res.status(200).json({
            message: 'Payroll approved successfully.',
            data: validApprovementsData
          })
        } catch (error) {
          // await transaction.rollback();
          console.error('Error creating bulk records:', error)
          return next(createError.createError(500, 'Internal server Error'))
        }
      }
    }
  } catch (error) {
    console.log('  await transaction.rollback();', error)
    return next(createError.createError(500, 'Internal server error'))
  }
}

module.exports = {
  getAllApprovements,
  arrayApprove2Approvement,
  rejectPayroll,
  getApprovementById,
  createApprovement,
  updateApprovement,
  deleteApprovement,
  arrayApproveApprovement,
  getApprovementByPayrollId,
  approveStatusOfPayroll
}
