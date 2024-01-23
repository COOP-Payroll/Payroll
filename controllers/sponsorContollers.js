const Grade = require('../models/grade.js')
const Company = require('../models/company.js')
const Allowance = require('../models/allowance.js')
const AllowanceDefinition = require('../models/allowanceDefinition.js')
const EmployeeGrade = require('../models/EmployeeGrade.js')
const { Op } = require('sequelize')
const Sponsors = require('../models/sponsor.js')
const createError = require('../utils/error.js')
const CustomError = require('../utils/customError.js')
const successResponse = require('../utils/successResponse.js')
const { max } = require('moment/moment.js')
const sequelize = require('../database/db.js')
const AccountInfo= require("../models/accountInfo.js")
//CREATE GRADE
exports.getAllSponsors = async (req, res, next) => {
  try {
    const criteria = {
      CompanyId: req.user.id
    }
    const sponsors = await Sponsors.findAll({
      where: criteria
    })

    if (!sponsors) {
      return next(createError.createError(404, 'There is no sponsors'))
    } else {
      res.status(200).json({
        success: true,
        message: 'Data found',
        data: sponsors
      })
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.getOneSponsors = async (req, res, next) => {
  try {
    const { id } = req.params
    const criteria = {
      id:id,
      CompanyId: req.user.id
    }
    const sponsors = await Sponsors.findOne({
      where: criteria
    })

    if (!sponsors) {
      return next(createError.createError(404, 'There is no sponsors with id ' + id))
    } else {
      res.status(200).json({
        success: true,
        message: 'Data found',
        data: sponsors
      })
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }
}
exports.createSponsors = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    //insert required field
    const { name, budget,shortCode, accountNumber, referenceNumber, location } = req.body;
   

    if (!name || !budget ) {
      return next(
        createError.createError(400, 'name or budget is not inserted')
      )
    }

  
    if(!req.files?.referenceLetter?.[0]?.path){
      return next(createError.createError(400,'referenceLetter not found'))
    }


    const companyId = req.user.id
    const criteria = {
      CompanyId: req.user.id,
      name: name
    }
    const checkSponsors = await Sponsors.findOne({ where: criteria })

    if (checkSponsors) {
      return next(createError.createError(409, 'This name is defined already '))
    }

    const sponsor = await Sponsors.create({ name, budget, shortCode,location },{transaction})
    console.log("sponsor",sponsor)  
    await sponsor.setCompany(companyId,{transaction});




    const accountInfo = await AccountInfo.findOne({
      where: {  SponsorId: sponsor?.id ,isActive: true}
    })
    const data = req.files?.image?.[0]?.path
    const imagePath = data ? data : null
    const referenceLetterData = req.files?.referenceLetter?.[0]?.path
    const referenceLetterPath = referenceLetterData ? referenceLetterData : null
    if (!accountInfo) {
   
   
  // console.log("data",data)
      
        // await accountInfo.update({ isActive: false }, { transaction })
        await AccountInfo.create(
          { accountNumber: accountNumber, referenceLetter:referenceLetterPath,referenceNumber:referenceNumber,image: imagePath,SponsorId:sponsor.id,isActive:true },
          { transaction }
      
      // await AccountInfo.create({
      //   accountNumber,referenceLetter,referenceNumber,image
      );
    
    }
    else{
    await accountInfo.update({ isActive: false }, { transaction });
    await AccountInfo.create(
      { accountNumber: accountNumber, referenceLetter:referenceLetterPath,referenceNumber:referenceNumber,image: imagePath,SponsorId:sponsor.id ,isActive:true },
      { transaction }
  
  // await AccountInfo.create({
  //   accountNumber,referenceLetter,referenceNumber,image
  );
    }


    await transaction.commit();
    return res.status(201).json({
      success: true,
      message: 'Successfully Registered',
      data: sponsor
    })
  } catch (error) {
    await transaction.rollback();
    // console.log('error', error)
    return next(createError.createError(500, 'Internal server error'))
  }
}


exports.updateSponsor = async (req, res, next) => {
  try {
    //insert required field
    const { name, budget, location,accountNumber } =
      req.body
    const updates = {}
    const { id } = req.params

    const checkSponsor = await Sponsors.findOne({
      where: { id: id, CompanyId: req.user.id }
    });
    if (!checkSponsor) {
      return next(createError.createError(404, 'Sponsor not found'))
    }

    if (name) {
      updates.name = name;
    }
    if (location) {
      updates.location = location
    }
    // if (accountNumber) {
    //   updates.accountNumber = accountNumber
    // }
    if (budget) {
      updates.budget = budget
    }
   
   
  
    const result = await checkSponsor.update({
      name: name,
      budget: budget,
      // accountNumber:accountNumber,
      location:location
    })

    res.status(200).json({
      success: true,
      message: 'updated successfully'
    })
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.deleteSponsor = async (req, res, next) => {
  try {
    const { id } = req.params
    const sponsors = await Sponsors.findOne({
      where: { id: id, CompanyId: req.user.id }
    })
    if (!sponsors) {
      return next(createError.createError(404, 'Sponsor not found'))
    } else {
      await sponsors.destroy()
      res.status(200).json({
        success: true,
        message: 'Deleted successfully',
        data: sponsors
      })
    }
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}
