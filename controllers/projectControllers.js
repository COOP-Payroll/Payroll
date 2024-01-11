const Allowance = require('../models/allowance')
const AllowanceDefinition = require('../models/allowanceDefinition')
const Grade = require('../models/grade')
const Company = require('../models/company.js')
const Employee = require('../models/employee.js')
const createError = require('.././utils/error.js')
const Projects = require('../models/projects.js')
const Positions = require('../models/position.js')
const Sponsor = require('../models/sponsor.js')
const { default: axios } = require('axios')
const error = require('shelljs/src/error.js')
const PositionProjectAssociation = require('../models/positionProjectAssociation.js')
// Define controller methods for handling User requests for deduction definition
exports.getAllProjects = async (req, res, next) => {
  try {

    const companyId = req.user.id
    const projects = await Projects.findAll({
      include: [
        {
          model: Positions,
          through: { attributes: ['noOfEmployees'] }, // Include any additional attributes you need
        },
      ],
    })
    res.status(200).json({
      success: true,
      message: 'Data found',
      data: projects
    })
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.getOneProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const criteria = {
      id:id,
      companyId: req.user.id
    }
    const projects = await Projects.findOne({
      where: criteria,
      include: [
        {
          model: Positions,
          through: { attributes: ['noOfEmployees'] }, // Include any additional attributes you need
        },
      ],
    })

    if (!projects) {
      return next(createError.createError(404, 'There is no projects with id ' + id))
    } else {
      res.status(200).json({
        success: true,
        message: 'Data found',
        data: projects
      })
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}
exports.createProjects = async (req, res, next) => {
  try {
    const {
      projectName,
      sponsorId,
      budget,
      location,
      description,
      startDate,
      endDate,
      accountNumber
    } = req.body
    console.log('Creating project')

    if (
      !projectName ||
      !sponsorId ||
      !budget||
      !accountNumber ||
      !startDate ||
      !endDate
    ) {
      return next(
        createError.createError(400, 'Please fill all the required fields')
      )
    }
    // const url = 'http://10.1.245.150:7081/v1/cbo/'
    // const response = await axios.post(url, {
    //   CustomerInfoRequest: {
    //     ESBHeader: {
    //       serviceCode: '040000',
    //       channel: 'USSD',
    //       Service_name: 'customerInfo',
    //       Message_Id: 'Mmr2qyutr82729'
    //     },
    //     CusomerInfo: {
    //       AccountId: accountNumber
    //     }
    //   }
    // });

    // if (response.data.CustomerInfoResponse.CustomerInfo.length === 0) {
    //   return next(createError.createError(404, 'Account number not found'))
    // }
    // console.log(response.data.CustomerInfoResponse.CustomerInfo.length)

    const checkProjectName = await Projects.findOne({
      where: { companyId: req.user.id, projectName: projectName }
    })
    if (checkProjectName) {
      return next(createError.createError(409, 'Project already defined'))
    }
    sponsor = await Sponsor.findOne({
      where: { id: sponsorId, companyId: req.user.id }
    })

    if (!sponsor) {
      return next(createError.createError(404, 'Sponsor not found'))
    }

    const projects = await Projects.create({
      projectName,
      location,
      budget,
      startDate,
      endDate,
      description,
      accountNumber: accountNumber
    })
    await projects.setSponsor(sponsorId)
    await projects.setCompany(Number(req.user.id))

    return res.status(200).json({
      success: true,
      message: 'Successfully Registered',
      data: projects
    })
  } catch (error) {
    console.log('first', error)
    return next(createError.createError(500, 'Internal server error'))
  }
}
exports.assignProjectToEmployee = async (req, res, next) => {
  try {
    console.log('assignProjectToEmmployee')
    const { employeeId, projectId, percent } = req.body
    if (!employeeId || !projectId) {
      return next(createError.createError(400, 'Please enter required fields'))
    }

    const employee = await Employee.findOne({
      where: { id: employeeId, companyId: req.user.id }
    })
    const projects = await Projects.findOne({
      where: { id: projectId, companyId: req.user.id }
    })
    if (!employee) {
      return next(createError.createError(404, 'Employee not found'))
    }
    if (!projects) {
      return next(createError.createError(404, 'Project not found'))
    }

    console.log('employee', employee)
    // if(projects?.EmployeeId === employeeId){
    //   return next(createError.createError(409, 'Project already assigned'))
    // }
    // Use the addEmployee method to create the association with percent value
    const data = await projects.addEmployee(employee, { through: { percent } })
    console.log('data: ' + data)

    return res.status(200).json({
      success: true,
      message: 'Project successfully assigned to employee',
      data: projects
    })
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.assignPositionToProject = async (req, res, next) => {
  try {
    const { projectId, positionIds, noOfEmployees } = req.body
    // console.log(projectId,positionIds,noOfEmployees)
    const projects = await Projects.findOne({
      where: { id: projectId, companyId: req.user.id }
    })
    if (!projects) {
      return next(createError.createError(404, 'Project not found'))
    }

    const positions = await Positions.findAll({
      where: {
        id: positionIds
      }
    })

    if (positions.length !== positionIds.length) {
      return next(
        createError.createError(404, 'One or more positions not found')
      )
    }
    if (positionIds.length !== noOfEmployees.length) {
      return next(
        createError.createError(404, 'No of employee and position mismatch')
      )
    }

    // Ensure unique positionIds
    const uniquePositionIds = Array.from(new Set(positionIds))

    // Check for existing associations
    const existingAssociations = await PositionProjectAssociation.findAll({
      where: {
        ProjectId: projects.id,
        PositionId: uniquePositionIds
      }
    })

   if (existingAssociations.length > 0) {
      console.log(existingAssociations)
      // Throw an error if any positions are already associated
      const existingPositionIds = existingAssociations.map(
        assoc => assoc.PositionId
      )

        return next(
        createError.createError(
          400,
          `Positions with IDs ${existingPositionIds} are already associated with the project`
        )
      )
    }
    // Prepare an array for bulk insertion
    const associations = positionIds.map((positionId, index) => ({
      ProjectId: projects.id,
      PositionId: positionId,
      noOfEmployees: noOfEmployees[index],
      CompanyId: req.user.id
    }))

    // Bulk insert into PositionProjectAssociations table
    try {
      await PositionProjectAssociation.bulkCreate(associations)
    } catch (error) {
      console.error('Error bulk creating PositionProjectAssociations:', error)
      // Handle the error appropriately, e.g., log it or return an error response
      return next(createError.createError(500, 'Internal server Error'))
    }
    console.log('Positions added to the project successfully!')
    return res.status(200).json({
      success: true,
      message: 'successfull assigned'
    })
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}
exports.updateProjects = async (req, res, next) => {
  try {
    console.log('da la project')
    //insert required field
    const { projectName, sponsorId, location, description, accountNumber } =
      req.body
    const updates = {}
    const { id } = req.params

    const checkProject = await Projects.findOne({
      where: { id: id, companyId: req.user.id }
    })
    if (projectName) {
      updates.projectName = projectName
    }
    if (location) {
      updates.location = location
    }
    if (accountNumber) {
      updates.accountNumber = accountNumber
    }
    if (description) {
      updates.description = description
    }
    if (sponsorId) {
      const sponsors = await Sponsor.findOne({
        where: { id: sponsorId, companyId: req.user.id }
      })
      if (!sponsors) {
        return next(createError.createError(404, 'Sponsor not found'))
      }
      updates.sponsorId = sponsorId
    }

    if (!checkProject) {
      return next(createError.createError(404, 'project not found'))
    }

    console.log(updates)
    const result = await checkProject.update({
      projectName: projectName,
      SponsorId: sponsorId
    })

    res.status(200).json({
      success: true,
      message: 'updated successfully'
    })
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.deleteProjects = async (req, res, next) => {
  try {
    const { id } = req.params
    const projects = await Projects.findOne({
      where: { id: id, companyId: req.user.id }
    })
    if (!projects) {
      return next(createError.createError(404, 'Project not found'))
    } else {
      await projects.destroy()
      res.status(200).json({
        success: true,
        message: 'Deleted successfully',
        data: projects
      })
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}


exports.deassignPositionFromProject  = async (req, res, next) => {
  try {
    const { projectId, positionIds } = req.body
    // console.log(projectId,positionIds,noOfEmployees)
    const projects = await Projects.findOne({
      where: { id: projectId, companyId: req.user.id }
    })
    if (!projects) {
      return next(createError.createError(404, 'Project not found'))
    }

    const positions = await Positions.findAll({
      where: {
        id: positionIds
      }
    })

    if (positions.length !== positionIds.length) {
      return next(
        createError.createError(404, 'One or more positions not found')
      )
    }
   

    
    // Ensure unique positionIds
    const uniquePositionIds = Array.from(new Set(positionIds))

    // Check for existing associations
    const existingAssociations = await PositionProjectAssociation.findAll({
      where: {
        ProjectId: projects.id,
        PositionId: uniquePositionIds
      }
    })
 // Check if the positions are already assigned to the project
 const assignedPositions = await projects.getPositions({ where: { id: positionIds } });

   // Identify the positions that are not assigned to the project
  //  const unassignedPositions = positionIds.filter(
  //   (positionId) => !assignedPositions.some((assignedPosition) => assignedPosition.id === positionId)
  // );
 if (assignedPositions.length !== positionIds.length) {
     return next(createError.createError(400, 'One or more positions are not assigned to the project.'))       
 }

  
    // Remove associations
    await projects.removePositions(positionIds);

    console.log('Positions removed from the project successfully!');
    return res.status(200).json({
      success: true,
      message: 'Successfully removed positions from the project',
    });


  } catch (error) {
    return next(createError.createError(500, 'Internal server Error'))
  }
}