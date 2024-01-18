
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
      companyId: req.user.id
    }
    const projects = await Projects.findOne({
      where: criteria,
      include: [
        {
          model: Positions,
          through: { attributes: ['noOfEmployees'] }, // Include any additional attributes you need
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
  try {
    const {
      projectName,
      numberOfEmployees,
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
      !numberOfEmployees||
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
      numberOfEmployees,
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
  const transaction = await sequelize.transaction();
  try {
    console.log('assignProjectToEmmployee')


   const { employeeId, projectId, percent } = req.body
    if (!employeeId || !projectId) {
      return next(createError.createError(400, 'Please enter required fields'))
    }
    const projects = await Projects.findOne({
      where: { id: projectId, companyId: req.user.id },
     });

    if (!projects) {
      return next(createError.createError(404, 'Project not found'))
    }
    const employee = await Employee.findOne({
      where: { id: employeeId, companyId: req.user.id },
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
    ProjectId: projectId,
    EmployeeId:employeeId,
   }})

   if (chechEmployeAssociation) {
    await transaction.rollback();
    return next(createError.createError(404,`Employee already  associated with the project`))
 
    }

  //  console.log(employee?.Positions?.[0].EmployeePosition?.id)
    const positionProjectAssociations = await PositionProjectAssociation.findOne({
      where: {
        projectId: projectId,
        positionId:employee?.Positions?.[0]?.id
      },
    });    

   const count= await ProjectEmployee.count({
      where: {
        ProjectId: projectId
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
                id: employee?.Positions?.[0]?.id           
                
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
   
        console.log("check", count)
      if(positionProjectAssociations?.noOfEmployees  <= count){
        await transaction.rollback();
        return next(createError.createError(409, "The maximum number of employees for the project for this position has been reached"));

      }      
   
      if (employee.totalPercent + percent <= 100) {
        // If not, increment totalPercent
       await employee.increment('totalPercent', { by: percent },{transaction});

       const grossValue=employee?.EmployeeInfos[0]?.grossEarning* percent/100;
        // await projects.addEmployee(employee, { through: { percent ,gross:employee.EmployeeInfos[0].grossEarning* percent/100,} },{transaction})
        await ProjectEmployee.create({
          ProjectId:projectId,
          EmployeeId:employeeId,
          CompanyId:req.user.id,
          percent:percent ,
          gross: grossValue
        },{transaction}
        )
await positionProjectAssociations.update(
  { noOfAssignedEmployees: positionProjectAssociations.noOfAssignedEmployees+1 },
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
   await transaction.rollback();
    console.log(error)
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
      maximumPercentAllocation:maximumPercentAllocation[index],
      remainingEmployees:noOfEmployees[index],
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
    const { projectName, location, description, accountNumber,numberOfEmployees } =
      req.body;
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
    if (numberOfEmployees) {
      updates.numberOfEmployees = numberOfEmployees
    }
    if (accountNumber) {
      updates.accountNumber = accountNumber
    }
    if (description) {
      updates.description = description
    }
    // if (sponsorId) {
    //   const sponsors = await Sponsor.findOne({
    //     where: { id: sponsorId, companyId: req.user.id }
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
      accountNumber: accountNumber,
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
  const transaction = await sequelize.transaction();
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
 const assignedPositions = await projects.getPositions({ where: { id: positionIds }});

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
        ProjectId: projectId,
        PositionId: position.id,
        noOfEmployees: position.PositionProjectAssociation.noOfEmployees,
        maximumPercentAllocation: position.PositionProjectAssociation.maximumPercentAllocation,
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
    where: { id: projectId, companyId: req.user.id }
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
          id: employeeId,
          companyId:req.user.id
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
    id:projectId,
    companyId:req.user.id,   
  },
 
})
if(!projects){
  return next(createError.createError(404, 'Project not found'))
}
    const projectEmployee = await ProjectEmployee.findOne({
      where: {
        ProjectId: projectId,
        EmployeeId: employeeId,
        isActive: true,
      },
      include: [Employee],
    });


console.log("projectEmployee.percent",req.user.id)
    if (!projectEmployee) {
      // await transaction.rollback();
      return next(createError.createError(404, 'Employee is not  associated to project'));
    }


const positionProjectAssociation = await PositionProjectAssociation.findOne({where: {PositionId:employee?.Positions?.[0]?.id ,ProjectId:projectId,isActive:true}});
// console.log("positionProjectAssociation.percent",positionProjectAssociation)
if(!positionProjectAssociation){
  await transaction.rollback();
  return next(createError.createError(404, 'Position is not associated to the project'))
}
    // await employee.decrement('totalPercent', { by: employee.totalPercent }, { transaction });
// console.log(employee)
    
      const projectEmployeeHistory=  await ProjectEmployeeHistory.create({
      ProjectId: projectId,
      EmployeeId: employeeId,
      percent: projectEmployee.percent,
      gross: projectEmployee.gross,
      startingFrom: projectEmployee.createdAt,
      CompanyId:req.user.id,
      isActive: false,
    }, { transaction });
    
  //  await projectEmployee.setCompany(req.user.id,{transaction})
    console.log("employee.totalPercent-projectEmployee.percent",Number(employee.totalPercent)-Number(projectEmployee.percent))
    const data= await employee.update({totalPercent: Number(employee.totalPercent)-Number(projectEmployee.percent)}, { transaction });
    
    // console.log("projectEmployeeHistory",data)
    // await projectEmployeeHistory.setCompany({companyId},{transaction});
    await projectEmployee.destroy( { transaction });
    await positionProjectAssociation.update(
      { noOfAssignedEmployees: positionProjectAssociation.noOfAssignedEmployees-1 },
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
       where: { id: projectId, companyId: req.user.id },
      });
 
     if (!projects) {
       return next(createError.createError(404, 'Project not found'))
     }
     const employee = await Employee.findOne({
       where: { id: employeeId, companyId: req.user.id },
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
     ProjectId: projectId,
     EmployeeId:employeeId,

    }})

    if(!chechEmployeAssociation){
      return next(createError.createError(404, 'Employee is not  associated to project'));
    }
   console.log(employee.totalPercent-chechEmployeAssociation.percent)
    if ((employee.totalPercent-chechEmployeAssociation.percent)+ percent <= 100) {
     await employee.update({totalPercent:(employee.totalPercent-chechEmployeAssociation.percent)+ percent },{transaction})

     const projectEmployeeHistory=  await ProjectEmployeeHistory.create({
      ProjectId: projectId,
      EmployeeId: employeeId,
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
      ProjectId:projectId,
      EmployeeId:employeeId,
      CompanyId:req.user.id,
      percent:percent ,
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
    message: 'Updated successfully  '
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