const Allowance = require("../models/allowance");
const AllowanceDefinition = require("../models/allowanceDefinition");
const Grade = require("../models/grade");
const Company = require("../models/company.js");

const Projects=require("../models/projects.js");
const createError = require('.././utils/error.js');
const Sponsor = require("../models/sponsor.js");
// Define controller methods for handling User requests for deduction definition
exports.getAllProjects = async (req, res,next) => {
  try {
    const companyId = req.user.id;
    const projects = await Projects.findAll({ where: { companyId } });
    res.status(200).json({
        success:true,
        message:"Data found",
        data: projects

    });
  } catch (error) {
    console.log(error);
    return next(createError.createError(500,"Internal server error"))
  }
};


exports.createProjects = async (req, res, next) => {
    try {
        const {projectName, sponsorId}=req.body;

        const checkProjectName=await Projects.findOne({where: {projectName:projectName} });
        if(checkProjectName) {
            return next(createError.createError(409,"Project already defined"))
        }
      sponsor= await Sponsor.findByPk(sponsorId);
      
  if( !sponsor)  {
    return next(createError.createError(404,"Sponsor not found"))
  }
//     //   const checkIfAdded = await Projects.findOne({
//     //     where: {
//     //       GradeId: gradeId,
//     //       sponsor: sponsorId
//     //     },
  
        const projects = await Projects.create({ projectName });
        await projects.setCompany(Number(req.user.id));
       
     return    res.status(200).json({
            success:true,
          message: "Successfully Registered",
          data:projects,
        });
      
    } catch (error) {
      console.log("first", error);
      return next(createError.createError(500,"Internal server error"))
        }
  };

  
exports.updateProjects = async (req, res, next) => {
  try {
    //insert required field
    const { projectName,sponsorId} = req.body
    const updates = {}
    const { id } = req.params



    const  checkProject= await Projects.findOne({where: {id: id,companyId:req.user.id}});
    if (projectName) {

      
      updates.projectName = projectName
    }
 
    if(sponsorId){

      const sponsors = await Sponsor.findOne({where: {id:sponsorId, companyId:req.user.id}});
      if(!sponsors)
      {
        return next(createError.createError(404,"Sponsor not found"))
      }
      updates.sponsorId=sponsorId;
    }

    if(!checkProject) {
      return next(createError.createError(404, 'project not found'))
    }

    console.log(updates)
    const result = await checkProject.update({projectName:  projectName,SponsorId:sponsorId});

    res.status(200).json({
      success:true,
      message: 'updated successfully',
      result
    })
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}

exports.deleteProjects = async (req, res, next) => {
  try {
    const { id } = req.params
    const projects = await Projects.findOne({ where: { id: id,companyId:req.user.id } })
      if (!projects) {
        return next(createError.createError(404, 'Project not found'))
      
      } else {
        await projects.destroy();
        res.status(200).json({
          success:true,
          message: 'Deleted successfully' ,
          data:projects})
        
      }
  } catch (error) {
    return next(createError.createError(500, 'Internal server error'))
  }
}