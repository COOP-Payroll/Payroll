const Projecs = require("../models/projects");
const Payroll = require("../models/Payroll.js");
const Employee = require("../models/employee.js");
const ProjectEmployee = require("../models/project-employee.js");
const PayrollDefinition = require("../models/payrollDefinition.js");
const PDFDocument = require("pdfkit");
const EmployeeInfos = require("../models/employeInfo.js");
const EmployeeGrades = require("../models/EmployeeGrade.js");
const ExcelJS = require("exceljs");
const fs = require("fs");
const XLSX = require("xlsx");
const createError = require("../utils/error.js");
const Position = require("../models/position.js");
const Grade = require("../models/grade.js");
const Allowance = require("../models/allowance.js");
const AdditionalAllowance = require("../models/additionalAllowance.js");
const { Op } = require("sequelize");
exports.generateProjectSalaryReport = async (req, res, next) => {
  try {
    const { projectId, payrollDefinitionId } = req.body;

    const projects = await Projecs.findOne({
      where: { id: projectId },
    });

    const employee = await ProjectEmployee.findAll({
      where: { ProjectId: projectId },
      attributes: ["percent", "gross"],
      include: [
        {
          model: Employee,
          attributes: [
            "fullname",
            "image",
            "sex",
            "date_of_birth",
            "role",
            "nationality",
            "marriageStatus",
          ],
          required: true,
          include: [
            {
              model: Payroll,
              where: {
                PayrollDefinitionId: payrollDefinitionId,
              },
              required: true,
              attributes: [],
            },
          ],
        },
      ],
    });

    const formattedData = employee.map(({ percent, gross, Employee }) => ({
      percent,
      gross,
      ...Employee.toJSON(),
    }));

    return res.status(200).json({ data: formattedData });
  } catch (error) {
    console.error("Error fetching data:", error);
    return next(createError.createError(500, "Internal server Error"));
  }
};

exports.getPayrollPublishedReport2 = async (req, res, next) => {
  try {
    const payrollPublishedReport = await PayrollDefinition.findAll({
      where: { status: "created" },
      include: [
        {
          model: Payroll,
          where: { status: "processed" },
          required: false,
          include: [{ model: Employee, include: [Position] }],
        },
      ],
    });

    // return res.status(200).json(payrollPublishedReport)

    // Extract unique payrollName, startDate, and endDate values
    const uniqueData = [
      ...new Set(
        payrollPublishedReport.map((payroll) => ({
          payrollName: payroll.payrollName,
          startDate: payroll.startDate,
          endDate: payroll.endDate,
        }))
      ),
    ];

    // Map over each unique data entry
    const formattedData = uniqueData.map(
      ({ payrollName, startDate, endDate }) => {
        // Filter payrolls for the current payrollName, startDate, and endDate
        const payrolls = payrollPublishedReport
          .filter(
            (payroll) =>
              payroll.payrollName === payrollName &&
              payroll.startDate === startDate &&
              payroll.endDate === endDate
          )
          .map((payroll) => {
            // Check if Payroll exists and has associated Employee
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
                CompanyId,
              } = payroll.Payroll;

              // Include fullname from the Employee object
              const fullname = payroll?.Payroll?.Employee?.fullname;
              const position =
                payroll?.Payroll?.Employee?.Positions?.[0]?.positionName;

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
                CompanyId,
              };
            } else {
              // Return null or handle the case when Employee information is missing
              return null;
            }
          })
          .filter((entry) => entry !== null); // Remove null entries

        return {
          payrollName,
          startDate,
          endDate,
          payrolls,
        };
      }
    );

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching payroll published report:", error);
    return next(createError.createError(500, "Internal server Error"));
  }
};
exports.getPayrollPublishedReport1 = async (req, res, next) => {
  try {
    // Fetch data from the database
    const payrollPublishedReport = await PayrollDefinition.findAll({
      where: { status: "created" },
      include: [
        {
          model: Payroll,
          where: { status: "processed" },
          required: false,
          include: [
            {
              model: Employee,
              include: [Position], // Include the Position model under Employee
            },
          ],
        },
      ],
      raw: true, // Retrieve raw data
      nest: true, // Nesting the data properly
      includeAll: true, // Include all associations in a single query
    });

    // Ensure payrollPublishedReport is not undefined
    if (!payrollPublishedReport) {
      return res.status(404).json({ error: "Payroll report not found" });
    }

    // Extract unique payroll names
    const uniquePayrollNames = [
      ...new Set(payrollPublishedReport.map((payroll) => payroll.payrollName)),
    ];

    // Create an empty array to store formatted payroll data
    const formattedData = [];

    uniquePayrollNames.forEach((payrollName, index) => {
      // Reset the counter for each payroll name
      let i = 0;

      // Filter and map payroll data for the current payroll name
      const payrolls = payrollPublishedReport
        .filter((payroll) => payroll.payrollName === payrollName)
        .map((payroll) => {
          if (payroll.Payroll && payroll.Payroll.Employee) {
            // Increment the counter
            i++;

            // Extract payroll and employee data
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
            } = payroll.Payroll;
            const fullname = payroll.Payroll.Employee.fullname;
            const position = payroll.Payroll.Employee.Positions.positionName;

            // Format the row data and push it to the formattedData array
            formattedData.push({
              payrollName,
              startDate: payroll.startDate,
              endDate: payroll.endDate,
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
            });
          }
        });
    });

    // Return the formatted data as JSON response
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error(error);
    return next(createError.createError(500, "Internal server error"));
  }
};

exports.getPayrollPublishedReport = async (req, res, next) => {
  try {
    // Fetch data from the database
    const payrollPublishedReport = await PayrollDefinition.findAll({
      where: { status: "created",CompanyId:req.user.id },
      include: [
        {
          model: Payroll,
          where: { status: "processed" },
          required: true,
          include: [
            {
              model: Employee,
              include: [Position], // Include the Position model under Employee
            },
          ],
        },
      ],
      raw: true, // Retrieve raw data
      nest: true, // Nesting the data properly
      includeAll: true, // Include all associations in a single query
    });

    // Ensure payrollPublishedReport is not undefined
    if (!payrollPublishedReport) {
      return res.status(404).json({ error: "Payroll report not found" });
    }

    // Create an empty object to store the formatted payroll data
    const formattedData = {};

    // Iterate over each payroll entry and group employees by payroll name
    payrollPublishedReport.forEach((payroll) => {
      const { payrollName, startDate, endDate } = payroll;
      if (!formattedData[payrollName]) {
        formattedData[payrollName] = {
          payrollName,
          startDate,
          endDate,
          payrolls: [],
        };
      }

      const payrollEntry = formattedData[payrollName];

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
        } = payroll.Payroll;
        const fullname = payroll.Payroll.Employee.fullname;
        const position = payroll.Payroll.Employee.Positions.positionName;

        // Check if the employee ID has already been included
        const employeeIds = payrollEntry.payrolls.map((p) => p.id);
        if (!employeeIds.includes(id)) {
          // Add the employee details to the payrolls array under the payroll entry
          payrollEntry.payrolls.push({
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
          });
        }
      }
    });

    // Convert the object values to an array
    let result = Object.values(formattedData);

    // Sort the result array by start date in ascending order
    result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Check if payrolls array is empty and set it to an empty array explicitly
    result.forEach((entry) => {
      if (entry.payrolls.length === 0) {
        entry.payrolls = [];
      }
    });

    // Return the sorted array as JSON response
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return next(createError.createError(500, "Internal server error"));
  }
};

exports.getPayrollPublishedReportBasedOnSiteLocation = async (
  req,
  res,
  next
) => {
  try {
    const { siteLocation, payrollMonth } = req?.body;

    if (!siteLocation || !payrollMonth) {
      return next(
        createError.createError(
          400,
          "Both siteLocation and payrollMonth is required"
        )
      );
    }
    const fetchEmployee = await EmployeeInfos.findAll({
      where: { siteLocation: siteLocation },
      include: [
        {
          model: Employee,
          required: true,
          include: [
            { model: Position },
            { model: Grade, include: [{ model: Allowance }] },

            {
              model: Payroll,

              where: { status: "processed" },
              required: true,

              include: [
                {
                  model: PayrollDefinition,
                  where: { payrollName: payrollMonth },
                },
              ],
            },
          ],
        },
      ],
    });
    const formattedResult = fetchEmployee.map((employeeInfo) => ({
      PayrollMonth: employeeInfo?.Employee?.Payroll?.PayrollDefinition?.payrollName,
      fullname: employeeInfo.Employee ? employeeInfo.Employee.fullname : null,
      Position: employeeInfo?.Employee?.Positions?.[0]?.positionName,
      siteLocation: employeeInfo?.siteLocation,
      grossSalary: employeeInfo?.Employee?.Payroll?.grossSalary,
      basicSalary: employeeInfo?.Employee?.Payroll?.basicSalary,
      taxableIncome: employeeInfo?.Employee?.Payroll?.taxableIncome,
      incomeTax: employeeInfo?.Employee?.Payroll?.incomeTax,
      totalDeduction: employeeInfo?.Employee?.Payroll?.totalDeduction,
      totalAllowance: employeeInfo?.Employee?.Payroll?.totalAllowance,
      NetSalary: employeeInfo?.Employee?.Payroll?.NetSalary,
      employee_pension_amount:employeeInfo?.Employee?.Payroll?.employee_pension_amount,
      employer_pension_amount: employeeInfo?.Employee?.Payroll?.employer_pension_amount,
    }));

    return res.json({
      success: true,
      data: formattedResult,
    });
  } catch (error) {
    console.error(error);
    return next(createError.createError(500, "Internal server error"));
  }
};

// Your controller function
exports.downloadPayrollPublishedReport = async (req, res, next) => {
  try {
    const payrollPublishedReport = await PayrollDefinition.findAll({
      where: { status: "created" },
      include: [
        {
          model: Payroll,
          where: { status: "processed" }, // Additional condition for Payroll status
          required: false, // Use required: false to include Payroll even if there are no associated records

          include: [Employee],
        },
      ],
    });
    res.setHeader("Coop-payroll", "software as a service");
    // Your existing code to fetch and format data
    const uniquePayrollNames = [
      ...new Set(payrollPublishedReport.map((payroll) => payroll.payrollName)),
    ];
    const formattedData = uniquePayrollNames.map((payrollName) => {
      const payrolls = payrollPublishedReport
        .filter((payroll) => payroll.payrollName === payrollName)
        .map((payroll) => {
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
              CompanyId,
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
              CompanyId,
            };
          } else {
            return null;
          }
        })
        .filter((entry) => entry !== null);

      return {
        payrollName,
        payrolls,
      };
    });

    // Generate PDF
    const pdfFilename = generatePDF(formattedData);

    // Respond with the PDF filename or send the PDF as a response
    return res.status(200).json({
      formattedData,

      pdfFilename,
    });
  } catch (error) {
    console.error("Error fetching payroll published report:", error);
    return next(createError.createError(500, "Internal server error"));
  }
};

function generatePDF(data) {
  const doc = new PDFDocument();
  const filename = "payroll_report.pdf";
  const outputStream = fs.createWriteStream(filename);

  doc.pipe(outputStream);

  data.forEach((payroll) => {
    // Add header to each page

    doc.fontSize(19).text(`Month: ${payroll.payrollName}`, { underline: true });
    doc.moveDown();
    payroll.payrolls.forEach((entry) => {
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

// exports.downloadExcelReport = async (req, res, next) => {
//   try {
//     // Fetch data from the database
//     const payrollPublishedReport = await PayrollDefinition.findAll({
//       where: { status: 'created' },
//       include: [
//         {
//           model: Payroll,
//           where: { status: 'processed' },
//           required: false,
//           include: [
//             {
//               model: Employee,
//               include: [Position] // Include the Position model under Employee
//             }
//           ]
//         }
//       ],
//       raw: true, // Retrieve raw data
//       nest: true, // Nesting the data properly
//       includeAll: true // Include all associations in a single query
//     });

//     // return res.json(payrollPublishedReport)
//     // Ensure payrollPublishedReport is not undefined
//     if (!payrollPublishedReport) {
//       return res.status(404).json({ error: 'Payroll report not found' });
//     }

//     // Extract data for Excel
//     const excelData = payrollPublishedReport.map(payroll => {
//       if (payroll.Payroll && payroll.Payroll.Employee) {
//         const {
//           id,
//           grossSalary,
//           basicSalary,
//           taxableIncome,
//           incomeTax,
//           totalDeduction,
//           totalAllowance,
//           NetSalary,
//           employee_pension_amount,
//           employer_pension_amount,
//         } = payroll.Payroll;

//         // Extract employee data
//         const fullname = payroll.Payroll.Employee.fullname;
//         const position = payroll.Payroll.Employee.Positions.positionName;

//         return {
//           'Name': fullname,
//           'Age': payroll.Payroll.Employee.age, // Assuming age is a property of the Employee model
//           'Email': payroll.Payroll.Employee.email, // Assuming email is a property of the Employee model
//           'Position': position,
//           'Gross Salary': grossSalary,
//           'Basic Salary': basicSalary,
//           'Taxable Income': taxableIncome,
//           'Income Tax': incomeTax,
//           'Total Deduction': totalDeduction,
//           'Total Allowance': totalAllowance,
//           'Net Salary': NetSalary,
//           'Employee Pension': employee_pension_amount,
//           'Employer Pension': employer_pension_amount
//         };
//       } else {
//         return null;
//       }
//     }).filter(entry => entry !== null);

//     // Create a new workbook
//     const workbook = XLSX.utils.book_new();

//     // Add a worksheet
//     const worksheet = XLSX.utils.json_to_sheet([]);

//     // Set the main header value and styling
//     worksheet['A1'] = { v: 'Payroll Report', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };

//     // Merge cells to create the main header spanning multiple columns
//     worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }];

//     // Apply font and alignment to the main header cell
//     worksheet['A1'].s = { font: { bold: true }, alignment: { horizontal: 'center' } };

//     // Add the month and year suggestion header on row 2
//     const monthYearHeader = ['Month', 'Year'];
//     XLSX.utils.sheet_add_aoa(worksheet, [monthYearHeader], { origin: 'A2' });

//     // Add the data starting from the third row
//     XLSX.utils.sheet_add_json(worksheet, excelData, { origin: 'A3' });

//     // Add the worksheet to the workbook
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Report');

//     // Write the workbook to a buffer
//     const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

//     // Set the response headers
//     res.set({
//       'Content-Disposition': 'attachment; filename="payroll_report.xlsx"',
//       'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     });

//     // Send the Excel file as a response
//     res.send(excelBuffer);
//   } catch (error) {
//     console.error(error);
//     return next(createError.createError(500, 'Internal server error'));
//   }
// };

// exports.downloadExcelReport = async (req, res, next) => {
//   try {
//     // Fetch data from the database
//     const payrollPublishedReport = await PayrollDefinition.findAll({
//       where: { status: 'created' },
//       include: [
//         {
//           model: Payroll,
//           where: { status: 'processed' },
//           required: false,
//           include: [
//             {
//               model: Employee,
//               include: [Position] // Include the Position model under Employee
//             }
//           ]
//         }
//       ],
//       raw: true, // Retrieve raw data
//       nest: true, // Nesting the data properly
//       includeAll: true // Include all associations in a single query
//     });

//     // Ensure payrollPublishedReport is not undefined
//     if (!payrollPublishedReport) {
//       return res.status(404).json({ error: 'Payroll report not found' });
//     }

//     // Extract unique payroll names
//     const uniquePayrollNames = [...new Set(payrollPublishedReport.map(payroll => payroll.payrollName))];

//     // Create a new workbook
//     const workbook = XLSX.utils.book_new();

//     uniquePayrollNames.forEach((payrollName, index) => {
//       // Reset the counter for each payroll name
//       let i = 0;

//       // Filter and map payroll data for the current payroll name
//       const payrolls = payrollPublishedReport
//         .filter(payroll => payroll.payrollName === payrollName)
//         .map(payroll => {
//           if (payroll.Payroll && payroll.Payroll.Employee) {
//             // Increment the counter
//             i++;

//             // Extract payroll and employee data
//             const {
//               id,
//               grossSalary,
//               basicSalary,
//               taxableIncome,
//               incomeTax,
//               totalDeduction,
//               totalAllowance,
//               NetSalary,
//               employee_pension_amount,
//               employer_pension_amount,
//             } = payroll.Payroll;
//             const fullname = payroll.Payroll.Employee.fullname;
//             const position = payroll.Payroll.Employee.Positions.positionName;

//             // Format the row data
//             return {
//               "No": i,
//               'Full Name': fullname,
//               Position: position,
//               'Gross Salary': grossSalary,
//               'Basic Salary': basicSalary,
//               'Taxable Income': taxableIncome,
//               'Income Tax': incomeTax,
//               'Total Deduction': totalDeduction,
//               'Total Allowance': totalAllowance,
//               'Net Salary': NetSalary,
//               'Employee Pension': employee_pension_amount,
//               'Employer Pension': employer_pension_amount
//             };
//           } else {
//             return null;
//           }
//         })
//         .filter(entry => entry !== null);

//       // Create the worksheet
//       const worksheet = XLSX.utils.json_to_sheet(payrolls);

//       // Insert the "Monthly Salary" header at the beginning of the worksheet
//       const monthlySalary = [['Monthly Salary']];
//       XLSX.utils.sheet_add_aoa(worksheet, monthlySalary, { origin: 'A1' });

//       // Add custom column styles
//       const style = {
//         alignment: {
//           horizontal: 'center'
//         }
//       };

//       const wscols = [
//         { wch: 20, style: style }, // Full Name
//         { wch: 20, style: style }, // Position
//         { wch: 20, style: style }, // Gross Salary
//         { wch: 20, style: style }, // Basic Salary
//         { wch: 20, style: style }, // Taxable Income
//         { wch: 20, style: style }, // Income Tax
//         { wch: 20, style: style }, // Total Deduction
//         { wch: 20, style: style }, // Total Allowance
//         { wch: 20, style: style }, // Net Salary
//         { wch: 20, style: style }, // Employee Pension Amount
//         { wch: 20, style: style } // Employer Pension Amount
//       ];

//       worksheet['!cols'] = wscols;

//       // Append the worksheet to the workbook
//       const worksheetName = `${payrollName}`;
//       XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);
//     });

//     // Convert workbook to buffer
//     const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

//     // Set headers for the response
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename=payroll_report.xlsx');

//     // Send Excel buffer as response
//     res.send(excelBuffer);
//   } catch (error) {
//     console.error(error);
//     return next(createError.createError(500, 'Internal server error'));
//   }
// };

// exports.downloadExcelReport = async (req, res, next) => {
//   try {
//     // Fetch data from the database
//     const payrollPublishedReport = await PayrollDefinition.findAll({
//       where: { status: 'created' },
//       include: [
//         {
//           model: Payroll,
//           where: { status: 'processed' },
//           required: false,
//           include: [
//             {
//               model: Employee,
//               include: [Position] // Include the Position model under Employee
//             }
//           ]
//         }
//       ],
//       raw: true, // Retrieve raw data
//       nest: true, // Nesting the data properly
//       includeAll: true // Include all associations in a single query
//     });

//     // Ensure payrollPublishedReport is not undefined
//     if (!payrollPublishedReport) {
//       return res.status(404).json({ error: 'Payroll report not found' });
//     }

//     // Extract unique payroll names
//     const uniquePayrollNames = [...new Set(payrollPublishedReport.map(payroll => payroll.payrollName))];

//     // Create an object to hold the payroll data under each unique payroll name
//     const payrollDataByUniqueNames = {};

//     uniquePayrollNames.forEach(payrollName => {
//       // Filter payroll data by payrollName
//       const payrollData = payrollPublishedReport.filter(payroll => payroll.payrollName === payrollName);

//       // Store the filtered payroll data under the payroll name
//       payrollDataByUniqueNames[payrollName] = payrollData;
//     });

//     // Respond with the uniqueness information and payroll data
//     return res.json({ uniqueness: payrollDataByUniqueNames });

//   } catch (error) {
//     console.log(error);
//     return next(createError.createError(500, 'Internal server error'));
//   }
// };

exports.downloadExcelReport = async (req, res, next) => {
  try {
    // Fetch data from the database
    const payrollPublishedReport = await PayrollDefinition.findAll({
      where: { status: "created" },
      include: [
        {
          model: Payroll,
          where: { status: "processed" },
          required: true,
          include: [
            {
              model: Employee,
              include: [Position], // Include the Position model under Employee
            },
          ],
        },
      ],
      raw: true, // Retrieve raw data
      nest: true, // Nesting the data properly
      includeAll: true, // Include all associations in a single query
    });

    // Ensure payrollPublishedReport is not undefined
    if (!payrollPublishedReport) {
      return res.status(404).json({ error: "Payroll report not found" });
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Extract unique payroll names
    const uniquePayrollNames = [
      ...new Set(payrollPublishedReport.map((payroll) => payroll.payrollName)),
    ];

    uniquePayrollNames.forEach((payrollName, index) => {
      // Reset the counter for each payroll name
      let i = 0;

      // Filter and map payroll data for the current payroll name
      const payrolls = payrollPublishedReport
        .filter((payroll) => payroll.payrollName === payrollName)
        .map((payroll) => {
          if (payroll.Payroll && payroll.Payroll.Employee) {
            // Increment the counter
            i++;

            // Extract payroll and employee data
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
            } = payroll.Payroll;
            const fullname = payroll.Payroll.Employee.fullname;
            const position = payroll.Payroll.Employee.Positions.positionName;

            // Format the row data
            return {
              No: i,
              "Full Name": fullname,
              Position: position,
              "Gross Salary": grossSalary,
              "Basic Salary": basicSalary,
              "Taxable Income": taxableIncome,
              "Income Tax": incomeTax,
              "Total Deduction": totalDeduction,
              "Total Allowance": totalAllowance,
              "Net Salary": NetSalary,
              "Employee Pension": employee_pension_amount,
              "Employer Pension": employer_pension_amount,
            };
          } else {
            return null;
          }
        })
        .filter((entry) => entry !== null);

      // Create the worksheet
      const worksheet = XLSX.utils.json_to_sheet(payrolls);

      // Add custom column styles
      const style = {
        alignment: {
          horizontal: "center",
        },
      };

      const wscols = [
        { wch: 20, style: style }, // Full Name
        { wch: 20, style: style }, // Position
        { wch: 20, style: style }, // Gross Salary
        { wch: 20, style: style }, // Basic Salary
        { wch: 20, style: style }, // Taxable Income
        { wch: 20, style: style }, // Income Tax
        { wch: 20, style: style }, // Total Deduction
        { wch: 20, style: style }, // Total Allowance
        { wch: 20, style: style }, // Net Salary
        { wch: 20, style: style }, // Employee Pension Amount
        { wch: 20, style: style }, // Employer Pension Amount
      ];

      worksheet["!cols"] = wscols;

      // Append the worksheet to the workbook
      const worksheetName = `${payrollName}`;
      XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);
    });

    // Convert workbook to buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    // Set headers for the response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=payroll_report.xlsx"
    );

    // Send Excel buffer as response
    res.send(excelBuffer);
  } catch (error) {
    console.error(error);
    return next(createError.createError(500, "Internal server error"));
  }
};


exports.getPayrollPublishedReportPerMonth = async (req, res, next) => {
  try {
    const payrollMonth = req?.body?.payrollMonth;
    if (!payrollMonth) {
      return next(createError.createError(400, "Please select payroll Month"));
    }

    const data = await Payroll.findAll({
      include: [
        {
          model: PayrollDefinition,
          required: true,
          where: { payrollName: payrollMonth },
        },

        {
          model: Employee,
          include: [
            { model: EmployeeInfos },
            {
              model: Position,
            },
          ],
        },
      ],
      raw: true,
      nest: true,
      includeAll: true,
    });

    const formatedData = data.map((employeeInfo) => ({
      PayrollMonth: employeeInfo?.PayrollDefinition?.payrollName,
      fullname: employeeInfo.Employee?.fullname,
      Position: employeeInfo?.Employee?.Positions?.positionName,
      siteLocation: employeeInfo?.Employee?.EmployeeInfos?.siteLocation,
      grossSalary: employeeInfo?.grossSalary,
      basicSalary: employeeInfo?.basicSalary,
      taxableIncome: employeeInfo?.taxableIncome,
      incomeTax: employeeInfo?.incomeTax,
      totalDeduction: employeeInfo?.totalDeduction,
      totalAllowance: employeeInfo?.totalAllowance,
      NetSalary: employeeInfo?.NetSalary,
      employee_pension_amount: employeeInfo?.employee_pension_amount,
      employer_pension_amount: employeeInfo?.Employee?.employer_pension_amount,
    }));

    return res.status(200).json({
      success: true,
      data: formatedData,
    });
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);

    return next(createError.createError(500, "Internal Server Error"));
  }
};





























