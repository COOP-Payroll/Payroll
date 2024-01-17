const Grade = require('../models/grade')
const Company = require('../models/company')
const Allowance = require('../models/allowance.js')
const AllowanceDefinition = require('../models/allowanceDefinition.js')
const EmployeeGrade = require('../models/EmployeeGrade.js')
const { Op } = require('sequelize')

const createError = require('.././utils/error.js')
const CustomError = require('.././utils/customError.js')
const successResponse = require('.././utils/successResponse.js')
const { max } = require('moment/moment.js')

//CREATE GRADE
exports.getAllGrade = async (req, res, next) => {
  const companyId = req.user.id
  try {
    const criteria = {
      companyId: req.user.id
    }
    const companyGrade = await Grade.findAll({
      where: criteria,
      include: [
        {
          model: Allowance, // Use the correct alias defined in the association
          include: [AllowanceDefinition]
        }
      ]
    })

    if (!companyGrade) {
      return next(createError.createError(404, 'There is no Grade'))
    } else {
      res.status(200).json({
        count: companyGrade.length,
        companyGrade
      })
    }
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.getGradeById = async (req, res, next) => {
  try {
    const id = req.params.id
    const grade = await Grade.findByPk(id)
    if (!grade) {
      return next(
        createError.createError(404, 'There is no Grade with this ID')
      )
    } else {
      res.json(grade)
    }
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.createGrade = async (req, res, next) => {
  try {
    //insert required field

    const { name, minSalary, maxSalary } = req.body

    const companyId = req.user.id
    const criteria = {
      companyId: req.user.id,
      [Op.or]: [
        { name: name },
        { minSalary: minSalary },
        { minSalary: maxSalary },
        { maxSalary: maxSalary },
        { maxSalary: minSalary }
      ]
    }
    const sameGrade = await Grade.findOne({ where: criteria })

    if (sameGrade) {
      return next(
        createError.createError(
          409,
          'This grade is defined already  check if data provided is not the same with the inserted grade'
        )
      )
    }

    if (parseFloat(minSalary) < parseFloat(maxSalary)) {
      const grade = await Grade.create({ name, minSalary, maxSalary })
      await grade.setCompany(companyId)

      return res.status(200).json({
        message: 'Successfully Registered',
        grade
      })
    } else {
      return next(
        createError.createError(
          400,
          'Minimum salary cannot be greater than maximum salary'
        )
      )
    }
  } catch (error) {
    console.log('error', error)
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.updateGrade = async (req, res, next) => {
  try {
    //insert required field
    const { name, minSalary, maxSalary } = req.body
    const updates = {}
    const { id } = req.params

    if (name) {
      updates.name = name
    }
    if (minSalary) {
      updates.minSalary = minSalary
    }
    if (maxSalary) {
      updates.maxSalary = maxSalary
    }

    const result = await Grade.update(updates, { where: { id: id } })

    res.status(200).json({
      message: 'updated successfully',
      result
    })
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.deleteGrade = async (req, res, next) => {
  try {
    const { id } = req.params
    const grade = await Grade.findOne({ where: { id: id } })
    if (grade) {
      const employeeGrade = await EmployeeGrade.findOne({
        where: {
          GradeId: id
        }
      })
      if (employeeGrade) {
        return next(
          createError.createError(
            404,
            "This grade is attached to an employee. You can't delete it"
          )
        )
      } else {
        await grade.destroy({ where: { id } })
        res.status(200).json({ message: 'Deleted successfully' })
      }
    } else {
      res.status(409).json({ message: 'There is no grade with this ID' })
    }
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.addNewGradeDefn = async (req, res, next) => {
  try {
    const { name } = data
    console.log('data', data)
  } catch (error) {}
}
