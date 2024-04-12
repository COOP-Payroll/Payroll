const Projecs = require('../models/projects')
const Payroll = require('../models/payroll')
const Employee = require('../models/employee.js')
const ProjectEmployee= require("../models/project-employee.js")
const PayrollDefinition= require("../models/payrollDefinition.js")

const createError = require('../utils/error.js')
exports.generateProjectSalaryReport = async (req, res, next) => {
  try {
    const { projectId, payrollDefinitionId } = req.body

    const projects = await Projecs.findOne({
      where: { id: projectId }
    })


    const employee = await ProjectEmployee.findAll({
       where:{ProjectId:projectId},
       attributes:['percent', 'gross'],
        include:[
            {
                model:Employee,
                attributes: [
                    'fullname', 'image', 'sex', 'date_of_birth',
                    'role', 'nationality', 'marriageStatus'
                  ],
                required: true,
                include:[
                    {
                        model:Payroll,
                        where:{
                            PayrollDefinitionId:payrollDefinitionId
                        },
                        required:true,
                        attributes: []
                    }
                ]
            
            }
        ]
    })

    const formattedData = employee.map(({ percent, gross, Employee }) => ({
        percent,
        gross,
        ...Employee.toJSON()
      }));
      

        // const payroll = await Payroll.findAll({
        //     where:{ PayrollDefinitionId: payrollDefinitionId},
        //     include:[
        //         { model:Employee,
        //             required: true,
        //          attributes:['id'],
        //           include: [
        //            {
        //              model:ProjectEmployee,
        //              where:{
        //                ProjectId:projectId
        //              },
        //              attributes:['id']
        //            },
                
        //           ]
                
                
        //         }]
            
        // })
    return res.status(200).json({ data: formattedData })
  } catch (error) {
    console.error('Error fetching data:', error)
    return next(createError.createError(500, 'Internal server Error'))
  }
}


exports.getPayrollPublishedReport = async (req, res, next) => {
  try {


    const payrollPublishedReport = await PayrollDefinition.findAll({
      where: { status: 'created' },
      include: [
        {
          model: Payroll,
          where: { status: 'processed' }, // Additional condition for Payroll status
          required: false,// Use required: false to include Payroll even if there are no associated records

          include:[Employee]
        }
      ]
    });
    
    // Extract unique payrollName values
    const uniquePayrollNames = [...new Set(payrollPublishedReport.map(payroll => payroll.payrollName))];

    // Map over each unique payrollName and populate payrolls under it
    const formattedData = uniquePayrollNames.map(payrollName => {
      // Filter payrolls for the current payrollName
      const payrolls = payrollPublishedReport
        .filter(payroll => payroll.payrollName === payrollName)
        .map(payroll => {
          // Check if Payroll exists and has associated Employee
          if (payroll.Payroll && payroll.Payroll.Employee) {
            // Extract necessary information for each payroll entry
            const {
              id,
              grossSalary,
              basicSalary,
              taxableIncome,
              incomeTax,
              totalDeduction,
              totalAllowance,
              NetSalary,
              employee_pension_amount,
              employer_pension_amount,
              status,
              isPaid,
              createdAt,
              updatedAt,
              EmployeeId,
              CompanyId
            } = payroll.Payroll;
    
            // Include fullname from the Employee object
            const fullname = payroll.Payroll.Employee.fullname;
    
            // Return the structured payroll entry with fullname included
            return {
              id,
              fullname,
              grossSalary,
              basicSalary,
              taxableIncome,
              incomeTax,
              totalDeduction,
              totalAllowance,
              NetSalary,
              employee_pension_amount,
              employer_pension_amount,
              status,
              isPaid,
              createdAt,
              updatedAt,
              EmployeeId,
              CompanyId
            };
          } else {
            // Return null or handle the case when Employee information is missing
            return null;
          }
        })
        .filter(entry => entry !== null); // Remove null entries
    
      return {
        payrollName,
        payrolls
      };
    });
    
    // Now formattedData contains the data grouped by unique payroll names with payrolls populated under each payroll name
    // console.log(formattedData);
    
    return res.status(200).json({
      success:true,

      data:formattedData});
  } catch (error) {
    console.error('Error fetching payroll published report:', error);
   return next(createError.createError(500,"Internal server Error"))
  }
}