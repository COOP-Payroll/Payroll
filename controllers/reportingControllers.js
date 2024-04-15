const Projecs = require('../models/projects')
const Payroll = require('../models/Payroll.js')
const Employee = require('../models/employee.js')
const ProjectEmployee= require("../models/project-employee.js")
const PayrollDefinition= require("../models/payrollDefinition.js")
const PDFDocument = require('pdfkit');
const fs = require('fs');
const XLSX = require('xlsx');
const createError = require('../utils/error.js')
const Position = require('../models/position.js')
const Grade =require("../models/grade.js")
const Allowance= require('../models/allowance.js');
const AdditionalAllowance=require("../models/additionalAllowance.js")
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
          where: { status: 'processed' },
          required: false,
          include: [
            
            {model:Employee,
            
            include:[{model: Position},
            
            {model: Grade,
              include:[{model:Allowance}]
            },
            {model: AdditionalAllowance}
            ]
            }
          
          
          ]
        }
      ]
    });

    // return res.status(200).json(payrollPublishedReport)

    // Extract unique payrollName, startDate, and endDate values
    const uniqueData = [...new Set(payrollPublishedReport.map(payroll => ({
      payrollName: payroll.payrollName,
      startDate: payroll.startDate,
      endDate: payroll.endDate
    })))];

    // Map over each unique data entry
    const formattedData = uniqueData.map(({ payrollName, startDate, endDate }) => {
      // Filter payrolls for the current payrollName, startDate, and endDate
      const payrolls = payrollPublishedReport
        .filter(payroll =>
          payroll.payrollName === payrollName &&
          payroll.startDate === startDate &&
          payroll.endDate === endDate
        )
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
            const fullname = payroll?.Payroll?.Employee?.fullname;
            const position= payroll?.Payroll?.Employee?.Positions?.[0]?.positionName;
          
            // Return the structured payroll entry with fullname included
            return {
              id,
              fullname,
              position,
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
        startDate,
        endDate,
        payrolls
      };
    });

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching payroll published report:', error);
   return next(createError.createError(500,"Internal server Error"))
  }
}


// Your controller function
exports.downloadPayrollPublishedReport= async (req, res,next)=> {
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
    res.setHeader('Coop-payroll', 'software as a service');
      // Your existing code to fetch and format data
      const uniquePayrollNames = [...new Set(payrollPublishedReport.map(payroll => payroll.payrollName))];
      const formattedData = uniquePayrollNames.map(payrollName => {
          const payrolls = payrollPublishedReport
              .filter(payroll => payroll.payrollName === payrollName)
              .map(payroll => {
                  if (payroll.Payroll && payroll.Payroll.Employee) {
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

                      const fullname = payroll.Payroll.Employee.fullname;

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
                      return null;
                  }
              })
              .filter(entry => entry !== null);

          return {
              payrollName,
              payrolls
          };
      });

      // Generate PDF
      const pdfFilename = generatePDF(formattedData);

      // Respond with the PDF filename or send the PDF as a response
      return res.status(200).json({ 
        formattedData,
        
        pdfFilename });
  } catch (error) {
      console.error('Error fetching payroll published report:', error);
      return next(createError.createError(500, 'Internal server error'))
  }
}

// Function to generate PDF from formatted data
function generatePDF(data) {
  const doc = new PDFDocument();
  const filename = 'payroll_report.pdf';
  const outputStream = fs.createWriteStream(filename);

  doc.pipe(outputStream);

  data.forEach(payroll => {

    // Add header to each page

      doc.fontSize(19).text(`Month: ${payroll.payrollName}`, { underline: true });
      doc.moveDown();
      payroll.payrolls.forEach(entry => {
          // doc.fontSize(12).text(`ID: ${entry.id}`);
          doc.fontSize(12).text(`Fullname: ${entry.fullname}`);
          doc.fontSize(12).text(`Gross Salary: ${entry.grossSalary}`);
          doc.fontSize(12).text(`Basic Salary: ${entry.basicSalary}`);
          doc.fontSize(12).text(`Net Salary: ${entry.NetSalary}`);
          // Add more fields as needed

          doc.moveDown();
      });
      doc.moveDown();
  });

  doc.end();

  return filename;
}

exports.downloadExcelReport = async (req, res, next) => {
  try {
    // Fetch data from the database
    const payrollPublishedReport = await PayrollDefinition.findAll({
      where: { status: 'created' },
      include: [
        {
          model: Payroll,
          where: { status: 'processed' }, // Additional condition for Payroll status
          required: false, // Use required: false to include Payroll even if there are no associated records
          include: [{model:Employee,
          
          
            include:[{model: Position}],
          }          
          ]
        }

      ]
    });
    // return res.json(payrollPublishedReport)

    console.log('payrollPublishedReport:', payrollPublishedReport); // Add this line for logging

    // Ensure payrollPublishedReport is not undefined
    if (!payrollPublishedReport) {
      return res.status(404).json({ error: 'Payroll report not found' });
    }

    // Extract unique payroll names
    const uniquePayrollNames = [...new Set(payrollPublishedReport.map(payroll => payroll.payrollName))];

    // Format data with unique payroll names and associated payrolls
    const formattedData = uniquePayrollNames.map(payrollName => {
      const payrolls = payrollPublishedReport
          .filter(payroll => payroll.payrollName === payrollName)
          .map(payroll => {
              if (payroll.Payroll && payroll.Payroll.Employee) {
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

                  const fullname = payroll.Payroll.Employee.fullname;

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
                  return null;
              }
          })
          .filter(entry => entry !== null);

      return {
          payrollName,
          payrolls
      };
  });

    // return res.json(formattedData)
    // Create Excel workbook and add worksheets
    const workbook = XLSX.utils.book_new();
    formattedData.forEach(data => {
      const worksheet = XLSX.utils.json_to_sheet(data.payrolls);
      XLSX.utils.book_append_sheet(workbook, worksheet, data.payrollName);
    });

    // Convert workbook to buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set headers for the response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=payroll_report.xlsx');

    // Send Excel buffer as response
    res.send(excelBuffer);

    // return res.json(excelBuffer)
  } catch (error) {
    console.log(error);
    return next(createError.createError(500, 'Internal server error'));
  }
};