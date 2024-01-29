
const sequelize = require('../database/db')
const Allowance = require('../models/allowance')
const AllowanceDefinition = require('../models/allowanceDefinition')
const Grade = require('../models/grade');
const Company = require('../models/company.js')
const Employee = require('../models/employee.js')
const createError = require('.././utils/error.js')
const Projects = require('../models/projects.js')
const Positions = require('../models/position.js')
const Sponsor = require('../models/sponsor.js')
const { default: axios } = require('axios')
const error = require('shelljs/src/error.js')
const PositionProjectAssociation = require('../models/positionProjectAssociation.js')
const EmployeeInfo = require('../models/employeInfo.js')
const ProjectEmployee = require('../models/project-employee.js')
const EmployeePosition = require('../models/employeePosition.js')
const { Op, where } = require('sequelize');
const ProjectEmployeeHistory=require("../models/projectEmployeeHistory.js");
const ProjectPositionHistory = require('../models/projectPositionHistory.js');
const Position = require('../models/position.js');
const { Sequelize } = require('sequelize');
const AccountInfo = require('../models/accountInfo.js');


// Define controller methods for handling User requests for deduction definition
exports.getAllProjects = async (req, res, next) => {
  try {
console.log("proje",req.user.id)
    const CompanyId = req.user.id
    const projects = await Projects.findAll({
      where: {CompanyId:req.user.id},
      include: [
        {
          model: Positions,
          through: { attributes: ['noOfEmployees','noOfAssignedEmployees','maximumPercentAllocation'] }, // Include any additional attributes you need
        },
        {
          model:Sponsor
        }
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
      CompanyId: req.user.id
    }
    const projects = await Projects.findOne({
      where: criteria,
      include: [
        {
          model: Positions,
          through: { attributes:['noOfEmployees','noOfAssignedEmployees','maximumPercentAllocation'] }, // Include any additional attributes you need
        },
        {
          model:Sponsor
        }
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
  const transaction = await sequelize.transaction();
  try {
    const {
      projectName,
      numberOfEmployees,
      sponsorId,
      budget,
      location,
      description,
      referenceNumber,  
      startDate,
      endDate,
      accountNumber
    } = req.body
    console.log('Creating project')

    if (
      !projectName ||
      !sponsorId ||
      !budget||
      !numberOfEmployees||
      // !accountNumber ||
      !startDate ||
      !endDate
    ) {
      return next(
        createError.createError(400, 'Please fill all the required fields')
      )
    }

    // if(!req.files?.referenceLetter?.[0]?.path){
    //   return next(createError.createError(400,'referenceLetter not found'))
    // }



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
      where: { CompanyId: req.user.id, projectName: projectName }
    })
    if (checkProjectName) {
      return next(createError.createError(409, 'Project already defined'))
    }
    sponsor = await Sponsor.findOne({
      where: { id: sponsorId, CompanyId: req.user.id }
    })

    if (!sponsor) {
      return next(createError.createError(404, 'Sponsor not found'))
    }

    const projects = await Projects.create({
      projectName,
      location,
      budget,
      startDate,
      numberOfEmployees,
      endDate,
      description,
      // accountNumber: accountNumber
    })
    await projects.setSponsor(sponsorId,{transaction})
    await projects.setCompany(req.user.id,{transaction})



    const accountInfo = await AccountInfo.findOne({
      where: {  ProjectId: projects?.id ,isActive: true}
    })
    const data = req.files?.image?.[0]?.path
    const imagePath = data ? data : null
    const referenceLetterData = req.files?.referenceLetter?.[0]?.path
    const referenceLetterPath = referenceLetterData ? referenceLetterData : null
    if (!accountInfo) {
   
   
  // console.log("data",data)
      
        // await accountInfo.update({ isActive: false }, { transaction })
        await AccountInfo.create(
          { accountNumber: accountNumber, referenceLetter:referenceLetterPath,referenceNumber:referenceNumber,image: imagePath,ProjectId:projects.id,isActive:true },
          { transaction }
      
      // await AccountInfo.create({
      //   accountNumber,referenceLetter,referenceNumber,image
      );
    
    }
    else{
    await accountInfo.update({ isActive: false }, { transaction });
    await  AccountInfo.create(
      { accountNumber: accountNumber, referenceLetter:referenceLetterPath,referenceNumber:referenceNumber,image: imagePath,SponsorId:sponsor.id ,isActive:true },
      { transaction }
  
  // await AccountInfo.create({
  //   accountNumber,referenceLetter,referenceNumber,image
  );
    }

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Successfully Registered',
      data: projects
    })
  } catch (error) {
    console.log('first', error)
    await transaction.rollback();
    return next(createError.createError(500, 'Internal server error'))
  }
}
exports.assignProjectToEmployee = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    console.log('assignProjectToEmmployee')


   const { employeeId, projectId, percent } = req.body
    if (!employeeId || !projectId) {
      return next(createError.createError(400, 'Please enter required fields'))
    }
    //projectId=Number(projectId)
    const projects = await Projects.findOne({
      where: { id: Number(projectId), CompanyId: req.user.id },


     });

const getAllEmployeeUnderTheProject= await ProjectEmployee.count({where:{ProjectId:Number(projectId)}})
console.log(getAllEmployeeUnderTheProject)
if(Number(getAllEmployeeUnderTheProject ) >= Number(projects?.numberOfEmployees)){
  return next(createError.createError(409, 'Maximum allocation reached'))
}
    //  return res.status(200).json(getAllEmployeeUnderTheProject)  

    if (!projects) {
      return next(createError.createError(404, 'Project not found'))
    }
    const employee = await Employee.findOne({
      where: { id: employeeId, CompanyId: req.user.id },
   include:[
    {
      model: Positions,
      required: false,
      through: {
        model: EmployeePosition,
                
      },
      // include:[Sponsor]
    },
    {
      model: EmployeeInfo,  
    where: { isActive: true}}
    
   ]
    });
// return res.status(200).json(employee?.Positions?.[0]?.id)
    if (!employee) {
      return next(createError.createError(404, 'Employee not found'))
    }

   const chechEmployeAssociation= await ProjectEmployee.findOne({ where:{
    ProjectId: Number(projectId),
    EmployeeId:Number(employeeId),
   }})
   

   if (chechEmployeAssociation) {
    await transaction.rollback();
    return next(createError.createError(404,`Employee already  associated with the project`))
 
    }
    // return res.json("positionProjectAssociations",employee)
  //  console.log(employee?.Positions?.[0].EmployeePosition?.id)
    const positionProjectAssociations = await PositionProjectAssociation.findOne({
      where: {
        ProjectId: Number(projectId),
        PositionId:Number(employee?.Positions?.[0]?.id)
      },
    });    
    

   
   const count= await ProjectEmployee.count({
      where: {
        ProjectId:Number(projectId)
        ,
      },
      include: [
        {
          model: Employee,
          required: true,
          include: [
            {
              model: Positions, // Assuming you have a Positions model
              where: {
                id: Number(employee?.Positions?.[0]?.id)           
                
              },
            },
          ],
          
        },
      ],
    });
  
    if (!positionProjectAssociations) {
      await transaction.rollback();
      return next(createError.createError(404,`Position  is not associated with the project`))
      // console.error(`Position with ID  is not associated with the project`);
        }
   console.log("positionProjectAssociations?.maximumPercentAllocation0",positionProjectAssociations?.maximumPercentAllocation )
console.log("positionProjectAssociations?.maximumPercentAllocation",Number(percent) > positionProjectAssociations?.maximumPercentAllocation)
        if(Number(percent) > positionProjectAssociations?.maximumPercentAllocation){
          return next(createError.createError(400,`percent cannot exceeds  ${positionProjectAssociations.maximumPercentAllocation} %`)
        )}
        console.log("check", count)
      if(Number(positionProjectAssociations?.noOfEmployees)  <= count){
        await transaction.rollback();
        return next(createError.createError(409, "The maximum number of employees for the project for this position has been reached"));

      }      
   
      if (Number(employee.totalPercent) + Number(percent) <= 100) {
        // If not, increment totalPercent
       await employee.increment('totalPercent', { by: percent },{transaction});

       const grossValue=employee?.EmployeeInfos[0]?.grossEarning* Number(percent)/100;
        // await projects.addEmployee(employee, { through: { percent ,gross:employee.EmployeeInfos[0].grossEarning* percent/100,} },{transaction})
        await ProjectEmployee.create({
          ProjectId:  Number(projectId),
          EmployeeId:Number(employeeId),
          CompanyId:req.user.id,
          percent: Number(percent) ,
          gross: grossValue
        },{transaction}
        )

        console.log(" noOfAssignedEmployees: Number(positionProjectAssociations.noOfAssignedEmployees) +1",Number(positionProjectAssociations.noOfAssignedEmployees) +1)
await positionProjectAssociations.update(
  { noOfAssignedEmployees: Number(positionProjectAssociations.noOfAssignedEmployees) +1 },
  // { where: { PositionId: employee.Positions[0].id } },
  { transaction }
)
       
        await transaction.commit();
        console.log('Total percent incremented successfully');
      } else {
        await transaction.rollback();
        return next(createError.createError(400,`Total percent cannnot exceeds 100.currently you have reached  ${employee.totalPercent} percent  Cannot assign more projects.`))
  
     }
 
    return res.status(200).json({
      success: true,
      message: 'Project successfully assigned to employee'
      })



  } catch (error) {
    // console.log(error)
   await transaction.rollback();
    // console.log(error)
    return next(createError.createError(500, 'Internal server error'))
  }}

exports.assignPositionToProject = async (req, res, next) => {
  try {
    const { projectId, positionIds, noOfEmployees,maximumPercentAllocation } = req.body;

    if(! projectId || !positionIds || !noOfEmployees || !maximumPercentAllocation){
      return next(createError.createError(400,"please fill all required fields"))
    }

       if(maximumPercentAllocation>100){
      return next(createError.createError(400,"maximumPercentAllocation can not be more than 100"));
    }
    // console.log(projectId,positionIds,noOfEmployees)
    const projects = await Projects.findOne({
      where: { id: Number(projectId), CompanyId: req.user.id }
    })
    if (!projects) {
      return next(createError.createError(404, 'Project not found'))
    }

    const positions = await Positions.findAll({
      where: {
        id: Number(positionIds)
      }
    })
  
    if (positions.length !== positionIds.length  ) {
      return next(
        createError.createError(404, 'One or more positions not found')
      )
    }

    if (positionIds.length !== noOfEmployees.length    || positionIds.length !== maximumPercentAllocation.length ) {
      return next(
        createError.createError(404, 'No of employee ,maximumPercentAllocation or position mismatch')
      )
    }

    // Ensure unique positionIds
    const uniquePositionIds = Array.from(new Set(positionIds))

    // Check for existing associations
    const existingAssociations = await PositionProjectAssociation.findAll({
      where: {
        ProjectId: Number(projects.id),
        PositionId:Number(uniquePositionIds)
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
          `Positions  already associated with the project`
        )
      )
    }

    // Prepare an array for bulk insertion
    const associations = positionIds.map((positionId, index) => ({
      ProjectId: Number(projects.id),
      PositionId: Number(positionId),
      noOfEmployees: Number(noOfEmployees[index]),
      maximumPercentAllocation: Number(maximumPercentAllocation[index]),
      remainingEmployees:Number(noOfEmployees[index]),
      CompanyId: req.user.id
    }))

  
    const totalNoOfEmployeeForPosition = associations.reduce(
      (total, record) => total + (record.noOfEmployees || 0),
      0
    );
    const checkAllocatedNumberOfEmployee= await PositionProjectAssociation.findAll({where: {ProjectId:Number(projectId)}})


    const totalNoOfEmployees = checkAllocatedNumberOfEmployee.reduce(
      (total, record) => total + (record.noOfEmployees || 0),
      0
    );

    if(  (Number(totalNoOfEmployeeForPosition)+Number(totalNoOfEmployees)) > Number(projects.numberOfEmployees) )
    {
      return next(createError.createError(400,`You can't assign the maximum allocation under this project is   ${projects.numberOfEmployees} employees currently ${totalNoOfEmployees} employees assigned to the project`))
    }
    

    // return res.json({data:totalNoOfEmployeeForPosition+totalNoOfEmployees,
    // data1: projects.numberOfEmployees})

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
      message: 'Successfully assigned'
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
    const { projectName, location, description, numberOfEmployees } =
      req.body;
    const updates = {}
    const { id } = req.params

    const checkProject = await Projects.findOne({
      where: { id: id, CompanyId: req.user.id }
    })
    if (projectName) {
      updates.projectName = projectName
    }
    if (location) {
      updates.location = location
    }
    if (numberOfEmployees) {
      updates.numberOfEmployees = numberOfEmployees
    }
    // if (accountNumber) {
    //   updates.accountNumber = accountNumber
    // }
    if (description) {
      updates.description = description
    }
    // if (sponsorId) {
    //   const sponsors = await Sponsor.findOne({
    //     where: { id: sponsorId, CompanyId: req.user.id }
    //   })
    //   if (!sponsors) {
    //     return next(createError.createError(404, 'Sponsor not found'))
    //   }
    //   updates.sponsorId = sponsorId
    // }

    if (!checkProject) {
      return next(createError.createError(404, 'project not found'))
    }

    console.log(updates)
    const result = await checkProject.update({
      projectName: projectName,
      location: location,
      numberOfEmployees: numberOfEmployees,
      // accountNumber: accountNumber,
      description: description,
      // sponsorId: sponsorId
      // SponsorId: sponsorId
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
      where: { id: id, CompanyId: req.user.id }
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
  const transaction = await sequelize.transaction();
  try {
    const { projectId, positionIds } = req.body
    // console.log(projectId,positionIds,noOfEmployees)
    const projects = await Projects.findOne({
      where: { id: Number(projectId), CompanyId: req.user.id }
    })
    if (!projects) {
      return next(createError.createError(404, 'Project not found'))
    }

    const positions = await Positions.findAll({
      where: {
        id: Number(positionIds)
      }
    })

    if (positions.length !== positionIds.length) {
      return next(
        createError.createError(404, 'One or more positions not found')
      )
    }
   

    
    // Ensure unique positionIds
    const uniquePositionIds = Array.from(new Set((positionIds)))

    // Check for existing associations
    const existingAssociations = await PositionProjectAssociation.findAll({
      where: {
        ProjectId:Number(projects.id),
        PositionId: Number(uniquePositionIds)
      }
    })
 // Check if the positions are already assigned to the project
 const assignedPositions = await projects.getPositions({ where: { id: Number(positionIds) }});

//   include: [{
//     model: Projects,
//     through:{model:PositionProjectAssociation,
//       attributes: ['noOfEmployees', 'maximumPercentAllocation', 'remainingEmployees'],
//     },
//     // attributes: ['noOfEmployees', 'maximumPercentAllocation', 'remainingEmployees'],
//   }],
//   // attributes: ['id', 'noOfEmployees', 'maximumPercentAllocation', 'remainingEmployees'],
// });


// const projectsWithPositions = await Projects.findAll({
//   include: [{
//     model: Position,
//     through: PositionProjectAssociation,
//   }],
// });
// return res.json(projectsWithPositions)

   // Identify the positions that are not assigned to the project
  //  const unassignedPositions = positionIds.filter(
  //   (positionId) => !assignedPositions.some((assignedPosition) => assignedPosition.id === positionId)
  // );
 if (assignedPositions.length !== positionIds.length) {
     return next(createError.createError(400, 'One or more positions are not assigned to the project.'))       
 }

    // Remove associations
    // await projects.removePositions({positionIds},{transaction});


    await projects.removePositions(assignedPositions,{transaction});

    // Create entries in ProjectPositionHistory
    for (const position of assignedPositions) {
      console.log(position.PositionProjectAssociation.createdAt)
      await ProjectPositionHistory.create({
        ProjectId: Number(projectId),
        PositionId: Number(position.id),
        noOfEmployees: Number(position.PositionProjectAssociation.noOfEmployees),
        maximumPercentAllocation: Number(position.PositionProjectAssociation.maximumPercentAllocation),
        // remainingEmployees: position.remainingEmployees,
        isActive: false, // Assuming deassignment means isActive should be set to false
        startingFrom: position.PositionProjectAssociation.createdAt,
        CompanyId:req.user.id
      }
      ,{transaction}
      );
    }

    await transaction.commit(); 
  //  await ProjectPositionHistory.bul
    console.log('Positions removed from the project successfully!');
    return res.status(200).json({
      success: true,
      message: 'Successfully removed positions from the project',
      data:assignedPositions
    });


  } catch (error) {
    console.log(error)
    await transaction.rollback();
    return next(createError.createError(500, 'Internal server Error'))
  }
}



exports.qassignEmployeesToProject = async (req,res,next) => {
  try {
    console.log("helloo");
    const {projectId, percent, employeeIds} =req.body;
    // console.log(employeeIds)
    // Retrieve the positions associated with all employees
    const employees = await EmployeePosition.findAll({
      where: {
        EmployeeId: employeeIds,
      },
    
    });


   
    if (employees.length !== employeeIds.length) {
      return next(createError.createError(404, 'One or more employees is not associated to the position  '));
      // throw new Error('One or more employees is not associated to the position ');
    }

    // Check if the positions have reached the maximum number of employees for the project
    for (const employee of employees) {
      const positionId = employee.PositionId ? employee.PositionId : null;

      if (!positionId) {
        console.error(`Employee with ID ${employee.EmployeeId} is missing a position`);
        continue; // Skip to the next iteration
      }

      const positionProjectAssociation = await PositionProjectAssociation.findOne({
        where: {
          projectId: projectId,
          positionId: positionId,
        },
      });

      
      if (!positionProjectAssociation) {
        console.error(`Position with ID ${positionId} is not associated with the project`);
        continue; // Skip to the next iteration
      }

      const currentNoOfEmployees = positionProjectAssociation.noOfEmployees || 0;
      const remainingEmployees = positionProjectAssociation.remainingEmployees || 0;
      const maxNoOfEmployees =2;
      
       /* Specify the maximum number of employees for the position */;

      // Check if adding all employees would exceed the maximum number of employees for the project
      if (employeeIds.length >= currentNoOfEmployees || remainingEmployees <= 0) {
        console.error(`Adding employee with ID ${employee.EmployeeId} would exceed the maximum number of employees for the project`);
        continue; // Skip to the next iteration
      }

      // Check if the employee is already assigned to the project
      const existingAssignment = await ProjectEmployee.findOne({
        where: {
          ProjectId: projectId,
          EmployeeId: employee.EmployeeId,
        },
      });
      // console.log("currentNoOfEmployees: " + existingAssignment)
      if (existingAssignment) {

        return next(createError.createError(409,`Employee with ID ${employee.EmployeeId} is already assigned to the project`))
          continue; // Skip to the next iteration
      }

      // Create a new entry in the ProjectEmployee table
      await ProjectEmployee.create({
        ProjectId: projectId,
        EmployeeId: employee.EmployeeId,
        PositionId: positionId,
        percent: percent, // You may want to adjust this based on your requirements
        gross:100
      });

      // Update the PositionProjectAssociation to reflect the new employee
      await positionProjectAssociation.increment('noOfEmployees');
      await positionProjectAssociation.decrement('remainingEmployees');
  return res.status(200).json({
    success:true,
    message:`Employee with ID ${employee.EmployeeId} assigned to the project successfully`
  })
         }

    // console.log('All employees assigned to the project successfully');
  } catch (error) {
    console.error(error);
  }
};

exports.getAllEmployeeUnderTheSameProject= async(req,res,next)=>{
  try{
  const {projectId}=req.params;
  const projects = await Projects.findOne({
    where: { id: projectId, CompanyId: req.user.id }
  })
  if (!projects) {
    return next(createError.createError(404, 'Project not found'))
  }
  const allEmployee= await  ProjectEmployee.findAll({
     where: {
       ProjectId: projectId,
     },

     attributes:[],
     include: [
       {
         model: Employee,      
         
       },
     ],
   });

   return res.status(200).json({
    status:true,
    message:"Data found",
    data:allEmployee
   })


  }catch(error){
    console.log(error);
    return next(createError.createError(500,"Internal server Error"))
  }
}


exports.getAllUnassignedProjectForEmployee= async(req,res,next)=>{
  try {
    const {positionId,employeeId}= req.params;

    console.log(positionId)
   if(!positionId  || !employeeId){
    return next(createError.createError(400,'position id or employee id not found'))
   }

   const foundPosition= await EmployeePosition.findOne({where:{id:positionId}})
  if(!foundPosition){
    return next(createError.createError(404,'position not found'))
  }

  const foundEmployee= await Employee.findOne({where:{id:employeeId}})
  if(!foundEmployee){
    return next(createError.createError(404,'Employee not found '))
  }

  const employeePosition = await EmployeePosition.findOne({where: {PositionId: positionId, EmployeeId:employeeId,isActive:true}})

  if(!employeePosition){
    return next(createError.createError(400,"Position is not associated to an employee"))
  }

  // // const fetchData= await ProjectEmployee.findAll({where: {PositionId: positionId, EmployeeId: employeeId}})

  // const foundPosition1 = await Position.findAll({
  //   where: { id: positionId },
  //   include: [
  //     {
  //       model: Projects,
  //       required: false,
  //       through: {
  //         model: PositionProjectAssociation,
  //         where: {
  //           PositionId: positionId,
  //           [Op.and]: [
  //             { noOfAssignedEmployees: { [Op.lt]: Sequelize.col('noOfEmployees') } },
  //             { isActive: true },
  //           ],
  //         },
  //       },
  //       include: [
  //         {
  //           model: Employee,
  //           through: {
  //             model: ProjectEmployee, 
  //             where: {
  //               EmployeeId: employeeId,
  //               isActive: true,
  //             },
  //             // where: { id: { [Op.is]: null } }, // Exclude projects assigned to any employee
  //           },
  //           required: false,
  //         },
  //       ],
  //     },
  //   ],
  // });
  


  // const projectsForEmployee = await Projects.findAll({
  //   through: [
  //     {
  //       model: PositionProjectAssociation,
  //       where: {
  //         PositionId: positionId,
  //         [Op.and]: [
  //           { noOfAssignedEmployees: { [Op.lt]: Sequelize.col('noOfEmployees') } },
  //           { isActive: true },
  //         ],
  //       },
  //     },
  //     {
  //       model: Employee,
  //       through: {
  //         model: ProjectEmployee,
  //         where: {
  //           EmployeeId: employeeId,
  //         },
  //       },
  //       required: false,
  //     },
  //   ],
  // });
  
  // const allProjectsForPosition = await Projects.findAll({
  //   through: [
  //     {
  //       model: PositionProjectAssociation,
  //       where: {
  //         PositionId: positionId,
  //         isActive: true,
  //       },
  //     },
  //   ],
  // });
  
  // const filteredProjectsForEmployee = projectsForEmployee.filter(project => {
  //   // Filter out projects where the employee is already assigned
  //   return project.Employees.length === 0;
  // });
  
  


  
const foundPosition1 = await Position.findAll({
  where: { id: positionId },
  include: [
    {
      model: Projects,
      required: false,
      through: {
        model: PositionProjectAssociation,
        where: {
          PositionId: positionId,
          [Op.and]: [
            { noOfAssignedEmployees: { [Op.lt]: Sequelize.col('noOfEmployees') } },
            { isActive: true },
          ],
        },
      },
      include: [
        {
          model: Employee,
          through: {
            model: ProjectEmployee,
            where: {
              EmployeeId: employeeId,
              isActive: true,
            },
          },
          required: false,
        },
      ],
    },
  ],
});

// Filter out projects where the employee is already assigned
const filteredProjects = foundPosition1.map(position => {
  const filteredProjectsForPosition = position.Projects.filter(project => {
    return project.Employees.length === 0;
  });

  return {
    ...position.toJSON(),
    Projects: filteredProjectsForPosition,
  };
}


);

return res.status(200).json(filteredProjects)

  } catch (error) {
    console.log(error);
    return next(createError.createError(500,'Internal server error'))
  }
}
exports.deSelectEmployeeFromProject = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { employeeId, projectId } = req.body;

    if (!employeeId || !projectId)
      return next(
        createError.createError(404, 'Employee id and project id are required')
      );


      const employee= await Employee.findOne({
        where: {
          id: Number(employeeId),
          CompanyId:req.user.id
        },
                    // attributes:['id','totalPercent'],
        include:[
          {
            model:Positions,  

            through:{
              model:EmployeePosition,
              // attributes:['noOfEmployees','maximumPercentAllocation','remainingEmployees']?
              where:{isActive:true}
            }        
           
         
          }
        ]
      })
// return res.status(200).json(employee?.totalPercent)
      
// await employee.update({totalPercent:0})
      if(!employee){
        return next(createError.createError(404, 'Employee not found'))
      }
   const projects =await Projects.findOne({
  where:{
    id:Number(projectId),
    CompanyId:req.user.id,   
  },
 
})
if(!projects){
  return next(createError.createError(404, 'Project not found'))
}
    const projectEmployee = await ProjectEmployee.findOne({
      where: {
        ProjectId: Number(projectId),
        EmployeeId: Number(employeeId),
        isActive: true,
      },
      include: [Employee],
    });


console.log("projectEmployee.percent",req.user.id)
    if (!projectEmployee) {
      // await transaction.rollback();
      return next(createError.createError(404, 'Employee is not  associated to project'));
    }


const positionProjectAssociation = await PositionProjectAssociation.findOne({where: {PositionId:employee?.Positions?.[0]?.id ,ProjectId:Number(projectId),isActive:true}});
if(!positionProjectAssociation){
  // await transaction.rollback();
  return next(createError.createError(404, 'Position is not associated to the project'))
}
    // await employee.decrement('totalPercent', { by: employee.totalPercent }, { transaction });
// console.log(employee)
    
      const projectEmployeeHistory=  await ProjectEmployeeHistory.create({
      ProjectId: projectId,
      EmployeeId: employeeId,
      percent: Number(projectEmployee.percent),
      gross: Number(projectEmployee.gross),
      startingFrom: projectEmployee.createdAt,
      CompanyId:req.user.id,
      isActive: false,
    }, { transaction });
    console.log("projectEmployeeHistory.percent",projectEmployeeHistory)
      console.log("employee.totalPercent-projectEmployee.percent",Number(employee.totalPercent)-Number(projectEmployee.percent))
    const data= await employee.update({totalPercent: Number(employee.totalPercent)-Number(projectEmployee.percent)}, { transaction });
 
    await projectEmployee.destroy( { transaction });
    await positionProjectAssociation.update(
      { noOfAssignedEmployees: Number(positionProjectAssociation.noOfAssignedEmployees)-1 },
      // { where: { PositionId: employee.Positions[0].id } },
      { transaction }
    )
    await transaction.commit(); // Commit the transaction if everything is successful

    return res.status(200).json({
      success: true,
      message: 'Successfully unassigned from the project',
      // data: projectEmployee.gross,
    });
  } catch (error) {
    console.error(error.message);
    await transaction.rollback();
    console.error(error.message);
    return next(createError.createError(500, 'Internal server error'));
  }
};


exports.updateProjectEmployeeAssocitation= async(req,res,next)=>{
  const transaction = await sequelize.transaction();
  try {
    
    console.log('assignProjectToEmmployee')


    const { employeeId, projectId, percent } = req.body
     if (!employeeId || !projectId) {
       return next(createError.createError(400, 'Please enter required fields'))
     }
     const projects = await Projects.findOne({
       where: { id: projectId, CompanyId: req.user.id },
      });
 
     if (!projects) {
       return next(createError.createError(404, 'Project not found'))
     }
     const employee = await Employee.findOne({
       where: { id: Number(employeeId), CompanyId: req.user.id },
    include:[
     {
       model: Positions,
       required: false,
       through: {
         model: EmployeePosition,
                 
       },
       // include:[Sponsor]
     },
     {
       model: EmployeeInfo,  
     where: { isActive: true}}
     
    ]
     });
 
     if (!employee) {
       return next(createError.createError(404, 'Employee not found'))
     }
 
    const chechEmployeAssociation= await ProjectEmployee.findOne({ where:{
     ProjectId: Number(projectId),
     EmployeeId:Number(employeeId),

    }})

    if(!chechEmployeAssociation){
      return next(createError.createError(404, 'Employee is not  associated to project'));
    }
   console.log(employee.totalPercent-chechEmployeAssociation.percent)
    if ((employee.totalPercent-chechEmployeAssociation.percent)+ Number(percent) <= 100) {
     await employee.update({totalPercent:(employee.totalPercent-chechEmployeAssociation.percent)+ Number(percent) },{transaction})

     const projectEmployeeHistory=  await ProjectEmployeeHistory.create({
      ProjectId: Number(projectId),
      EmployeeId: Number(employeeId),
      percent: chechEmployeAssociation.percent,
      gross: chechEmployeAssociation.gross,
      startingFrom: chechEmployeAssociation.createdAt,
      CompanyId:req.user.id,
      isActive: false,
    }, { transaction });
    const grossValue=employee?.EmployeeInfos[0]?.grossEarning* percent/100;
    //await chechEmployeAssociation.update({percent:percent},{transaction})
    await chechEmployeAssociation.destroy( { transaction });
    await ProjectEmployee.create({
      ProjectId:Number(projectId),
      EmployeeId:Number(employeeId),
      CompanyId:req.user.id,
      percent:Number(percent) ,
      gross: grossValue
    },{transaction}
    )
    


    await transaction.commit();

  
       console.log('Total percent incremented successfully');
    } else {
      return next(createError.createError(400,`Total percent cannnot exceeds 100.currently you have reached  ${employee.totalPercent} percent  Cannot assign more projects.`))

   }
   return res.status(200).json({
    success: true,
    message: 'Updated successfully'
    })
  } catch (error) {
console.log(error);
await transaction.rollback();
return next(createError.createError(500, 'Internal server error'));    
  }
}


exports.getUnassignedProjects=async (req, res, next) => {
  try {
    const   positionId=req.params.positionId;

    if (!positionId)
      return next(
        createError.createError(400, 'Please enter required fields')
      );
      const foundPosition=await Position.findAll({
        where:{id:positionId},
        include:[
          {
            model: Projects,
            required: false,
            through: {
              model: PositionProjectAssociation,
              where: {
                
                PositionId: positionId,
                [Op.and]: [
                  { noOfAssignedEmployees: { [Op.lt]: Sequelize.col('noOfEmployees') } },
                  { isActive: true },]
              
              
              }
            },
            include:[
              {
                model: Employee,
                required: false,
              
              }
            ]
          },
        ]
      
      }

      )


      // const positionfound = await Position.findAll({where: {id:positionId}},
      //  { 
      //    include:[
            
      //    ]}
        
      //   );
      // const projects = await PositionProjectAssociation.findAll({
      //   where: {
      //     PositionId: positionId,
      //     [Op.and]: [
      //       { noOfAssignedEmployees: { [Op.lt]: Sequelize.col('noOfEmployees') } },
      //       { isActive: true },
      //     ],
      //   },
      //   // include:[Positions]
      // });
      
      return res.status(200).json(foundPosition  )
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal server error'));
    
  }
}


exports.getAllProjectUnderTheEmployee= async(req,res,next)=>{
  try {
    console.log("data")
    const  employeeId  = req.params.employeeId;

    const employee= await Projects.findAll(
       {include:[{
        model:ProjectEmployee,  
      where: { EmployeeId: employeeId,isActive:true,CompanyId:req.user.id
      }
      
       }
       ]
       }
      
      )
    if(!employee){
      console.log(error)
      return next(createError.createError(404, 'Employee not found'));
    }
    return res.status(200).json(employee)
   } catch (error) {
    console.log(error) 
    return next(createError.createError(500, 'Internal server error'));
  }
}

// exports.

exports.getTotalAssignedForEmployee= async(req,res,next)=>{
  try {
    const id=req.params.id;
    // const 
    const foundEmployee= await Employee.findOne({where: {id :id,CompanyId:req?.user?.id}})
    if(!foundEmployee){
      return next(createError.createError(404,"Employee not found"))
    }

    return res.status(200).json({total:foundEmployee?.totalPercent})
  } catch (error) {
    console.log(error);
    return next(createError.createError(500,'Internal server error'))
  }
}

exports.getPreviousProject= async(req,res,next)=>{
try{
const {projectId,employeeId}= req.params;
console.log("com",req.user.id)
const foundEmployee= await Employee.findOne({where: {id :employeeId,CompanyId:req.user.id}})
if(!foundEmployee){
  return next(createError.createError(404,'Employee not found'))
}
const foundProject=await Projects.findOne({where:{id:projectId,CompanyId:req.user.id}})

if(!foundProject){
  return next(createError.createError(404,'Project not found'))
}
const employeeProjectHistory= await ProjectEmployeeHistory.findAll({
  where:{ProjectId:projectId,EmployeeId:employeeId}
})
if(!employeeProjectHistory){
  return next(createError.createError(404,"No Records" ));

}

return res.status(200).json({
  data:employeeProjectHistory})

// const getHistory= a
  }catch(error){
    console.log(error)
    return next(createError.createError(500,'Internal server error'))
  }
}