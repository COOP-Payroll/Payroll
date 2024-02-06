const Approver = require('../models/approver')
const ApprovalMethod = require('../models/approvalMethod')
const Employee = require('../models/employee')
const createError = require('../utils/error.js')
const { create } = require('ts-node')
const sequelize = require('../database/db.js')

// Get all Approvers
exports.getAllApprovers = async (req, res, next) => {
  const CompanyId = req.user.id
  console.log(CompanyId)
  const criteria = {
    where: { CompanyId: CompanyId }
  }
  try {
    const approvers = await Approver.findAll({
      ...criteria,
      include: 'Employee'
    })

    let employeeNames = []
    if (approvers && approvers.length > 0) {
      employeeNames = approvers.map(approver => approver.Employee.fullname)
    }

    res.status(200).json({
      count: approvers.length,
      approvers: approvers,
      Names: employeeNames
    })
  } catch (error) {
    console.error('Error retrieving Approvers:', error)
    return next(createError.createError(500, 'Internal server error'))
    // res.status(500).json({ error: "Failed to retrieve Approvers" });
  }
}
//get all active approver
exports.getAllActiveApprovers = async (req, res, next) => {
  const CompanyId = req.user.id
  console.log(CompanyId)
  const criteria = {
    where: { CompanyId: CompanyId, isActive: true }
  }
  try {
    const approvers = await Approver.findAll({
      ...criteria,
      include: 'Employee'
    })

    let employeeNames = []
    if (approvers && approvers.length > 0) {
      employeeNames = approvers.map(approver => approver.Employee.fullname)
    }

    res.status(200).json({
      count: approvers.length,
      approvers: approvers,
      Names: employeeNames
    })
  } catch (error) {
    console.error('Error retrieving Approvers:', error)
    return next(createError.createError(500, 'Internal server error'))
    // res.status(500).json({ error: "Failed to retrieve Approvers" });
  }
}
//get all inactive approver
exports.getAllInActiveApprovers = async (req, res, next) => {
  const CompanyId = req.user.id
  console.log(CompanyId)
  const criteria = {
    where: { CompanyId: CompanyId, isActive: false }
  }
  try {
    const approvers = await Approver.findAll({
      ...criteria,
      include: 'Employee'
    })

    let employeeNames = []
    if (approvers && approvers.length > 0) {
      employeeNames = approvers.map(approver => approver.Employee.fullname)
    }

    res.status(200).json({
      count: approvers.length,
      approvers: approvers,
      Names: employeeNames
    })
  } catch (error) {
    console.error('Error retrieving Approvers:', error)
    return next(createError.createError(500, 'Internal server error'))
    // res.status(500).json({ error: "Failed to retrieve Approvers" });
  }
}
// Get a single Approver by ID
exports.getApproverById = async (req, res, next) => {
  const approverId = req.params.id
  try {
    const approver = await Approver.findByPk(approverId)
    if (!approver) {
      return next(createError.createError(404, 'Approver not found'))
      // return res.status(404).json({ error: "Approver not found" });
    }
    res.json(approver)
  } catch (error) {
    console.error('Error retrieving Approver:', error)
    return next(createError.createError(500, 'Internal server error'))
    // res.status(500).json({ error: "Failed to retrieve Approver" });
  }
}
//get approver by employee id
exports.getApproverByEmployeeId = async (req, res, next) => {
  const approverEmployeeId = req.params.id
  try {
    const approver = await Approver.findOne({
      where: { EmployeeId: approverEmployeeId },
      include: [{ model: Employee }]
    })

    if (!approver) {
      return next(createError.createError(404, 'Approver not found'))
      // return res.status(404).json({ error: "Approver not found" });
    }
    res.status(200).json(approver)
  } catch (error) {
    console.error('Error retrieving Approver:', error)
    return next(createError.createError(500, 'Internal server error'))
    // res.status(500).json({ error: "Failed to retrieve Approver" });
  }
}
//function used here tomanipulate the approved

async function saveApprover (
  CompanyId,
  EmployeeId,
  isActive,
  isMaster,
  role,
  level,
  ApprovalMethodId
) {
  const approver = new Approver({ isActive, isMaster, role, level })
  await approver.save()
  await approver.setCompany(CompanyId)
  await approver.setEmployee(EmployeeId)
  await approver.setApprovalMethod(ApprovalMethodId)
  console.log('saved success fully bempl')
  const updateEmployeeRole = await Employee.update(
    { role: 'approver' },
    {
      where: { id: EmployeeId }
    }
  )

  console.log(updateEmployeeRole)
  console.log('saved success fully')
  return {
    approver: approver,
    message: 'Successfully saved '
  }
}

// Create a new Approver
exports.createApprover = async (req, res, next) => {
  const transaction = await sequelize.transaction()
  // const transaction=
  const CompanyId = req.user.id
  const { level, role, isActive, isMaster, EmployeeId } = req.body
  try {
    if (!EmployeeId   ) {
      return next(createError.createError(400, 'Please enter required fields'))
      // return res.status(400).json({ error: "Employee Id is required" });)
    }

    // console.log('data sent', level, role, isActive, isMaster, EmployeeId)
    const approvalMethod = await ApprovalMethod.findOne({
      where: { CompanyId: req.user.id, isActive: true }
    })

    if (!approvalMethod) {
      return next(createError.createError(404, 'Define approval method first'))
    }
    if(approvalMethod.approvalMethod  === 'hierarchy'){
  // return res.json()
      if(level === undefined || level === null){
        return next(createError.createError(400, 'Please enter level'));
      }
      if(Number(level)<1){
        return next(createError.createError(400,'Level must be greater than zero'))
      }
    
    }
    const employee = await Employee.findOne({
      where: { id: EmployeeId, CompanyId: req.user.id, isActive: true }
    })

    if (!employee) {
      return next(createError.createError(404, 'Employee not found'))
      // return res.status(404).json({ error: "Employee not found" });))
    }

    const checkApprover = await Approver.findOne({
      where: { EmployeeId: EmployeeId, CompanyId: req.user.id, isActive: true }
    })

    if (checkApprover) {
      return next(
        createError.createError(
          409,
          'This employee is already assigned as approver'
        )
      )
      // return res.json("this employee is already assigned as approver");))
    }
    if (approvalMethod === null) {
      console.log('company has no active approval method ')
      return next(
        createError.createError(404, 'company has no active approval method')
      )
      // return res.json("company has no active approval method ")
    }
     else {
      const companyId = approvalMethod.CompanyId
      const appMethod = approvalMethod.approvalMethod
      const appLevel = approvalMethod.approvalLevel
      const minimumApp = approvalMethod.minimumApprover
      const ifMaster = approvalMethod.isThereMasterApprover
      const ApprovalMethodId = approvalMethod.id

      const approvalMethodCount = await ApprovalMethod.count({
        where: { CompanyId: req.user.id, isActive: true }
      })

      console.log(approvalMethodCount)
      //add company id to get employee
      const employeeCount = await Employee.count({
        where: { id: req.body?.EmployeeId, CompanyId: req.user.id }
      })
      console.log('this employee is', employeeCount)

      const isSaved = await Approver.count({
        where: {
          CompanyId: req.user.id,
          EmployeeId: req.body.EmployeeId,
          isActive: true
        }
      })

      const settedApprover = await Approver.count({
        where: { CompanyId: req.user.id, isMaster: false }
      })

      console.log('already setted', isSaved)
      if (isSaved >= 1) {
        return next(
          createError.createError(
            409,
            'this employee is already assigned as approver'
          )
        )
        // res.json("this employee is already assigned as approver");
      }
      if (approvalMethodCount < 1) {
        return next(
          createError.createError(
            400,
            'you should define approval method for this company'
          )
        )
      }
      // res.status(200).json("you should define approval method for this company");
      if (employeeCount < 1) {
        return next(
          createError.createError(
            404,
            'this employee has no valid id register in employee list'
          )
        )
      }

      console.log(companyId, appMethod, appLevel, minimumApp, ifMaster)

      if (ifMaster) {
        const masterApproverCount = await Approver.count({
          where: {
            isMaster: true,
            isActive:true,
            CompanyId: req.user.id
          }
        })


        if (Number(masterApproverCount) >= 1 && req.body.isMaster === true) {
          console.log('master approver is setted already')
          await transaction.rollback()
          return next(
            createError.createError(409, 'Master approver is seeted already')
          )
          // return res.json("master approver is seeted already");
        } 
        
        //  if (masterApproverCount < 1) {
          if (req.body.isMaster == true) {

            if (appMethod === 'horizontal') {
              console.log('horizontal approval')
              //count saved approver for this company except for master
              try {
 
                  const saveHApprover = await Approver.create(
                    {
                      level: 0,
                      role: req.body.role,
                      isMaster: true,
                      isActive: true
                    },
                    { transaction }
                  )
                  await saveHApprover.setApprovalMethod(ApprovalMethodId, {
                    transaction
                  })
                  await saveHApprover.setCompany(req.user.id, { transaction })
                  await saveHApprover.setEmployee(req.body.EmployeeId, {
                    transaction
                  })
                  //update  employe role
                  const updateEmployeeRole = await Employee.update(
                    { role: 'approver' },
                    {
                      where: { id: EmployeeId }
                    },
                    { transaction }
                  )

                  //update approval mehod

                  if(settedApprover>=minimumApp  ){
                  const updateResult = await ApprovalMethod.update(
                    { isCompleted: true },
                    {
                      where: { id: ApprovalMethodId }
                    },
                    // { transaction }
                  )

                  }
                  await transaction.commit()
                  return res.status(200).json({
                    success: true,
                    message: 'successfully saved you can approve your payroll'
                  })
                
              } catch (error) {
                await transaction.rollback()
                return next(createError.createError(500, 'Internal server error'))
                // res.status(500).json({ error: "Failed to save Approver" });
  
            } 

          }

            //setapproval here
            const setMaster = await Approver.create(
              {
                level: level,
                role,
                isMaster: true,
                isActive: true
              },

              { transaction }
            )
            await setMaster.setApprovalMethod(Number(ApprovalMethodId), {
              transaction
            })
            await setMaster.setCompany(Number(CompanyId), { transaction })
            await setMaster.setEmployee(Number(EmployeeId), { transaction })
            //update  employe role
            const updateEmployeeRole = await Employee.update(
              { role: 'approver' },
              {
                where: { id: EmployeeId }
              },
              { transaction }
            )

            if( approvalMethod.approvalMethod=== 'hierarchy'){


              const existingLevels = await Approver.findAll({
                where: {
                  CompanyId: req.user.id,
                  isActive: true,
                  ApprovalMethodId: approvalMethod.id
                },
                attributes: ['level'],
                raw: true
              })
              const maxLevel = appLevel
              // existingLevels.push({ level: level })
              const allLevelsAssigned = Array.from(
                { length: maxLevel },
                (_, i) => i + 1
              ).every(level =>
                existingLevels.some(
                  approverLevel => parseInt(approverLevel.level) === level
                )
              )
              console.log('allLevelsAssigned', allLevelsAssigned)
            
              if (allLevelsAssigned ) {
                approvalMethod.isCompleted = true
                await approvalMethod.save({ transaction })
              }

            }
            await transaction.commit()
            return res.status(201).json({
              success:true,
              message: 'master approval successfully setted'
            })
          
          
          
          
          
          
          }
           else if (req.body.isMaster === false) {
            const updateResult =null;
            if (appMethod === 'horizontal') {
              console.log('horizontal approval')
              //count saved approver for this company except for master
              try {
                               //register this approver
                  const saveHApprover = await Approver.create(
                    {
                      level: 0,
                      role: req.body.role,
                      isMaster: false,
                      isActive: true
                    },
                    { transaction }
                  )
                  await saveHApprover.setApprovalMethod(ApprovalMethodId, {
                    transaction
                  })
                  await saveHApprover.setCompany(req.user.id, { transaction })
                  await saveHApprover.setEmployee(req.body.EmployeeId, {
                    transaction
                  })
                  //update  employe role
                  const updateEmployeeRole = await Employee.update(
                    { role: 'approver' },
                    {
                      where: { id: EmployeeId }
                    },
                    { transaction }
                  )

                  //update approval mehod

                  if(settedApprover+1>=minimumApp  && masterApproverCount >0){
                  const updateResult = await ApprovalMethod.update(
                    { isCompleted: true },
                    {
                      where: { id: ApprovalMethodId }
                    },
                    // { transaction }
                  )

                  }
                  await transaction.commit()
                  // console.log(updateResult)
                  return res.status(200).json({
                    success: true,
                    message: 'successfully saved you can approve your payroll'
                  })
                } catch(error){
                  return createError.createError(500,"Internal server error")
                }
              
            } 
            else if (appMethod === 'hierarchy') {
              //hierarchy no master
              const level = req.body.level
              if (appLevel < level) {
                await transaction.rollback()
                return next(
                  createError.createError(
                    400,
                    `The maximum level is ${appLevel}`
                  )
                )
              }
              if (level < 1) {
                await transaction.rollback()
                return next(
                  createError.createError(400, `The minimum level is 1`)
                )
              }

              const saveHApprover = await Approver.create(
                {
                  level: level,
                  role: req.body.role,
                  isMaster: false,
                  isActive: true
                },
                { transaction }
              )
              await saveHApprover.setApprovalMethod(ApprovalMethodId, {
                transaction
              })
              await saveHApprover.setCompany(req.user.id, { transaction })
              await saveHApprover.setEmployee(req.body.EmployeeId, {
                transaction
              })
              //update  employe role
              const updateEmployeeRole = await Employee.update(
                { role: 'approver' },
                {
                  where: { id: EmployeeId }
                },
                { transaction }
              )

              const existingLevels = await Approver.findAll({
                where: {
                  CompanyId: req.user.id,
                  isActive: true,
                  ApprovalMethodId: approvalMethod.id
                },
                attributes: ['level'],
                raw: true
              })
              const maxLevel = appLevel
              existingLevels.push({ level: level })
              const allLevelsAssigned = Array.from(
                { length: maxLevel },
                (_, i) => i + 1
              ).every(level =>
                existingLevels.some(
                  approverLevel => parseInt(approverLevel.level) === level
                )
              )
              console.log('allLevelsAssigned', allLevelsAssigned)
              const foundMasterApprover = await Approver.findOne({
                where: {
                  CompanyId: req.user.id,
                  isMaster: true,
                  isActive: true
                }
              })
              console.log('existingLevels.isMaster', foundMasterApprover)
              if (allLevelsAssigned && foundMasterApprover?.isMaster) {
                approvalMethod.isCompleted = true
                await approvalMethod.save({ transaction })
              }

              await transaction.commit()

              return res.status(201).json({
                success: true,
                message: 'Approver seatted successfully'
              })
            }
          }
           else {
            //if not both /undeefined appmethod
            console.log('undefined approval method')
            return next(
              createError.createError(404, 'approval method not found ')
            )
          }
        }
      
        //if no master approval
        
       else if(!ifMaster) {

        if(req.body.isMaster=== true){
          return next(createError.createError(400,"Cannot set as master approver"))
        }
        if (appMethod === 'horizontal') {
          console.log('horizontal approval')
          //count saved approver for this company except for master
          try {
            if (minimumApp === null) {
              return next(
                createError.createError(400, 'unknown minimum approver')
              )
              // return res.json("unknown minimum approver");
            } else if (minimumApp <= settedApprover) {
              //register this approver
              const saveHApprover = await Approver.create(
                {
                  level: 0,
                  role: req.body.role,
                  isMaster: false,
                  isActive: true
                },
                { transaction }
              )
              await saveHApprover.setApprovalMethod(ApprovalMethodId, {
                transaction
              })
              await saveHApprover.setCompany(req.user.id, { transaction })
              await saveHApprover.setEmployee(req.body.EmployeeId, {
                transaction
              })
              //update  employe role
              const updateEmployeeRole = await Employee.update(
                { role: 'approver' },
                {
                  where: { id: EmployeeId }
                },
                { transaction }
              )

              //update approval mehod
              const updateResult = await ApprovalMethod.update(
                { isCompleted: true },
                {
                  where: { id: ApprovalMethodId }
                },
                { transaction }
              )
              await transaction.commit()
              console.log(updateResult)
              return res.status(200).json({
                success: true,
                // approvalMethodId: updateResult,
                // updateEmployeeRole: updateEmployeeRole,
                message: 'Approver setted successfully you can approve your payroll'
              })
            } else if (minimumApp === settedApprover + 1) {
              const saveHApprover = await Approver.create(
                {
                  level: 0,
                  role: req.body.role,
                  isMaster: false,
                  isActive: true
                },
                { transaction }
              )
              await saveHApprover.setApprovalMethod(ApprovalMethodId, {
                transaction
              })
              await saveHApprover.setCompany(req.user.id, { transaction })
              await saveHApprover.setEmployee(req.body.EmployeeId, {
                transaction
              })
              //update  employe role
              const updateEmployeeRole = await Employee.update(
                { role: 'approver' },
                {
                  where: { id: EmployeeId }
                },
                { transaction }
              )
              //update approval method
              const updateResult = await ApprovalMethod.update(
                { isCompleted: true },
                {
                  where: { id: ApprovalMethodId }
                },
                { transaction }
              )

              await transaction.commit()
              console.log(updateResult)
              return res.status(201).json({
                success:true,
                message:  'successfully saved you have passed minimum number of approver'
              })
            } else if (minimumApp > settedApprover + 1) {
              const saveHApprover = await Approver.create(
                {
                  level: 0,
                  role: req.body.role,
                  isMaster: false,
                  isActive: true
                },
                { transaction }
              )
              await saveHApprover.setApprovalMethod(ApprovalMethodId, {
                transaction
              })
              await saveHApprover.setCompany(req.user.id, { transaction })
              await saveHApprover.setEmployee(req.body.EmployeeId, {
                transaction
              })
              //update  employe role
              const updateEmployeeRole = await Employee.update(
                { role: 'approver' },
                {
                  where: { id: EmployeeId }
                },
                { transaction }
              )

              await transaction.commit()
              return res.status(201).json({
                success:true,
                // updateEmployeeRole: updateEmployeeRole,
                message: 'Approver assigned successfully '
              })
            } else {
              await transaction.rollback()
              return next(
                createError.createError(500, 'Internal server error')
              )
              // return res.json("something is wrong");
            }
          } catch (error) {
            await transaction.rollback()
            return next(
              createError.createError(500, 'Internal server error')
            )
            // return res.status(500).json("something went wrong");
          }
        } 
        else if (appMethod === 'hierarchy') {
          //hierarchy no master
          const level = req.body.level
          if (appLevel < level) {
            await transaction.rollback()
            return next(
              createError.createError(
                400,
                `The maximum level is ${appLevel}`
              )
            )
          }
          if (level < 1) {
            await transaction.rollback()
            return next(
              createError.createError(400, `The minimum level is 1`)
            )
          }

          const saveHApprover = await Approver.create(
            {
              level: level,
              role: req.body.role,
              isMaster: false,
              isActive: true
            },
            { transaction }
          )
          await saveHApprover.setApprovalMethod(ApprovalMethodId, {
            transaction
          })
          await saveHApprover.setCompany(req.user.id, { transaction })
          await saveHApprover.setEmployee(req.body.EmployeeId, {
            transaction
          })
          //update  employe role
          const updateEmployeeRole = await Employee.update(
            { role: 'approver' },
            {
              where: { id: EmployeeId }
            },
            { transaction }
          )

          const existingLevels = await Approver.findAll({
            where: {
              CompanyId: req.user.id,
              isActive: true,
              ApprovalMethodId: approvalMethod.id
            },
            attributes: ['level'],
            raw: true
          })
          const maxLevel = appLevel
          existingLevels.push({ level: level })
          const allLevelsAssigned = Array.from(
            { length: maxLevel },
            (_, i) => i + 1
          ).every(level =>
            existingLevels.some(
              approverLevel => parseInt(approverLevel.level) === level
            )
          )
          console.log('allLevelsAssigned', allLevelsAssigned)
          // const foundMasterApprover = await Approver.findOne({
          //   where: {
          //     CompanyId: req.user.id,
          //     isMaster: true,
          //     isActive: true
          //   }
          // })
          // console.log('existingLevels.isMaster', foundMasterApprover)
          if (allLevelsAssigned ) {
            approvalMethod.isCompleted = true
            await approvalMethod.save({ transaction })
          }

          await transaction.commit()

          return res.status(201).json({
            success: true,
            message: 'Approver seatted successfully'
          })
        }

        }
      } 
      
      
      
    
  } catch (error) {
    await transaction.rollback()
    console.error('Error creating Approver:', error)
    return next(createError.createError(500, 'Internal server error'))
    // res.status(500).json({ error: "Failed to create Approver" });
  }
}

// Update an existing Approver
exports.updateApprover = async (req, res, next) => {
  const approverId = req.params.id
  const { level, role, isActive, isMaster, EmployeeId, companyId } = req.body
  try {
    const approver = await Approver.findByPk(approverId)
    if (!approver) {
      return res.status(404).json({ error: 'Approver not found' })
    }
    approver.level = level
    approver.role = role
    approver.isActive = isActive
    approver.isMaster = isMaster
    approver.EmployeeId = EmployeeId
    approver.CompanyId = companyId
    await approver.save()
    return res.status(200).json(approver)
  } catch (error) {
    console.error('Error updating Approver:', error)
    return next(createError.createError(500, 'Internal server error'))
    // res.status(500).json({ error: "Failed to update Approver" });
  }
}

// Delete an Approver
exports.deleteApprover = async (req, res, next) => {
  const approverId = req.params.id
  try {
    const approver = await Approver.findByPk(approverId)
    if (!approver) {
      return res.status(404).json({ error: 'Approver not found' })
    }
    await approver.destroy()
    res.status(200).json({ message: 'Approver deleted successfully' })
  } catch (error) {
    console.error('Error deleting Approver:', error)
    return next(createError.createError(500, 'Internal server error'))
    // res.status(500).json({ error: "Failed to delete Approver" });
  }
}

exports.deactiveApprover = async (req, res, next) => {
  const approverId = req.body.approverId
  const EmployeeId = req.body.EmployeeId

  const updateApprover = await Approver.update(
    { isActive: false },
    {
      where: {
        id: approverId
      }
    }
  )
  const updateEmployee = await Employee.update(
    { role: 'employee' },
    {
      where: {
        id: EmployeeId
      }
    }
  )

  return res.status(200).json({
   
    message: 'approver deActivated successfully.',
    updateEmployee: updateEmployee,
    updateApprover: updateApprover
  })
}
