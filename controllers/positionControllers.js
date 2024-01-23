const Grade = require('../models/grade.js')
const Company = require('../models/company.js')
const Allowance = require('../models/allowance.js')
const AllowanceDefinition = require('../models/allowanceDefinition.js')
const EmployeeGrade = require('../models/EmployeeGrade.js')
const { Op } = require('sequelize')
const Sponsors = require('../models/sponsor.js');
const Positions=require('../models/position.js');
const createError = require('../utils/error.js')
const CustomError = require('../utils/customError.js')
const successResponse = require('../utils/successResponse.js')
const { max } = require('moment/moment.js')

//CREATE GRADE
exports.getAllpositions = async (req, res, next) => {
  try {
    const criteria = {
      CompanyId: req.user.id
    }
    const positions = await Positions.findAll({
      where: criteria
    })

    if (!positions) {
      return next(createError.createError(404, 'There is no positions'))
    } else {
      res.status(200).json({
        success: true,
        message: 'Data found',
        data: positions
      })
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const { id } = req.params
    const criteria = {
      id:id,
      CompanyId: req.user.id
    }
    const positions = await Positions.findOne({
      where: criteria
    })

    if (!positions) {
      return next(createError.createError(404, "Position not found"))
    } else {
      res.status(200).json({
        success: true,
        message: 'Data found',
        data: positions
      })
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}
exports.createPositions = async (req, res, next) => {
  try {
    //insert required field

    const { positionName, description } = req.body

    if (!positionName ) {
      return next(
        createError.createError(400, 'Please fill all required fields')
      )
    }

    const companyId = req.user.id
    const criteria = {
      CompanyId: req.user.id,
      positionName: positionName
    }
    const positionFound = await Positions.findOne({ where: criteria })

    if (positionFound) {
      return next(createError.createError(409, 'This name is defined already '))
    }

    const position = await Positions.create({ positionName, description})
  
    await position.setCompany(companyId)

    return res.status(201).json({
      success: true,
      message: 'Successfully Registered',
      data: position
    })
  } catch (error) {
    console.log('error', error)
    return next(createError.createError(500, 'Internal server error'))
  }
}


exports.updatePosition= async (req, res, next) => {
  try {
    //insert required field
    const { positionName, description} =
      req.body
    const updates = {}
    const { id } = req.params

    const foundPosition  = await Positions.findOne({
      where: { id: id, CompanyId: req.user.id }
    });
    if (!foundPosition ) {
      return next(createError.createError(404, 'Position not found'))
    }

    if (positionName) {
      updates.positionName = positionName;
    }
    if (description) {
      updates.description = description
    }
    
   
   
  
    const result = await foundPosition .update({
      positionName: positionName,
      description: description,
  
    })

    res.status(200).json({
      success: true,
      message: 'updated successfully'
    })
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.deletePosition = async (req, res, next) => {
  try {
    const { id } = req.params
    const foundPosition = await Positions.findOne({
      where: { id: id, CompanyId: req.user.id }
    })
    if (!foundPosition) {
      return next(createError.createError(404, 'Position not found'))
    } else {
      await foundPosition.destroy()
      res.status(200).json({
        success: true,
        message: 'Deleted successfully',
        data: foundPosition
      })
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}
