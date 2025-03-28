const { DATEONLY } = require("sequelize");
const { Sequelize, Op } = require("sequelize");
const Payroll = require("../models/payrollDefinition");
const PayrollDefinition = require("../models/payrollDefinition");
const createError = require("../utils/error.js");
const ethiopianDate = require("ethiopian-date");
// Define controller methods for handling User requests for deduction definition
exports.getAllPayroll = async (req, res, next) => {
  try {
    const CompanyId = req.user.id;
    const criteria = {
      where: { CompanyId: CompanyId },
    };
    const payroll = await Payroll.findAll(criteria);

    return res.status(200).json({
      count: payroll.length,
      message: "Data fetched successfully",
      data: payroll,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//GET ALL PAYROLL DEFINITION FOR THIS YEAR
exports.getAllPayrollForCurrentYear = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    // Get the current year
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    const [ethiopianYear, ethiopianMonth, ethiopianDay] =
      ethiopianDate.toEthiopian(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate()
      );
    // return res.json(ethiopianYear);
    // Define criteria to get payroll definitions for the current year
    const criteria = {
      where: {
        CompanyId: CompanyId,
        // Filtering by startDate to only include records from the current year
        startDate: {
          [Sequelize.Op.gte]: new Date(`${ethiopianYear}-01-01T00:00:00.000Z`), // January 1st of the current year
        },
        endDate: {
          [Sequelize.Op.lte]: new Date(`${ethiopianYear}-12-31T23:59:59.999Z`), // December 31st of the current year
        },
      },
    };

    const payrollDefinition = await PayrollDefinition.findAll(criteria);

    return res.status(200).json({
      count: payrollDefinition.length,
      message: "Data fetched successfully",
      data: payrollDefinition,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
// exports.getAllPayrollForCurrentYear = async (req, res, next) => {
//   try {
//     const CompanyId =
//       req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

//     // Get the current Gregorian date
//     const currentDate = new Date();

//     // Convert current Gregorian date to Ethiopian date
//     const [ethiopianYear, ethiopianMonth, ethiopianDay] =
//       ethiopianDate.toEthiopian(
//         currentDate.getFullYear(),
//         currentDate.getMonth() + 1,
//         currentDate.getDate()
//       );

//     // Determine the start and end date for the Ethiopian year
//     const meskeremStartDate = new Date(currentDate.getFullYear(), 8, 11); // September 11th, the start of the Ethiopian year
//     const meskeremEndDate = new Date(currentDate.getFullYear() + 1, 8, 10); // The end of the Ethiopian year, September 10th of the next year
//     return res.json({ meskeremEndDate, meskeremEndDate });

//     // Adjust start and end dates based on the Ethiopian year
//     if (ethiopianMonth < 9) {
//       // If the current month is before Meskerem (Ethiopian New Year), adjust the year for the Ethiopian start date
//       meskeremStartDate.setFullYear(currentDate.getFullYear() - 1);
//       meskeremEndDate.setFullYear(currentDate.getFullYear());
//     }

//     // Define criteria to get payroll definitions for the current Ethiopian year
//     const criteria = {
//       where: {
//         CompanyId: CompanyId,
//         startDate: {
//           [Sequelize.Op.gte]: meskeremStartDate, // Start of Ethiopian year
//         },
//         endDate: {
//           [Sequelize.Op.lte]: meskeremEndDate, // End of Ethiopian year
//         },
//       },
//     };

//     const payrollDefinition = await PayrollDefinition.findAll(criteria);

//     return res.status(200).json({
//       count: payrollDefinition.length,
//       message: "Data fetched successfully",
//       data: payrollDefinition,
//     });
//   } catch (error) {
//     return next(
//       createError.createError(503, "An error occurred, please try again later")
//     );
//   }
// };
//get by id
exports.getPayrollDefinitionById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const payroll = await Payroll.findByPk(Number(id));
    if (!payroll) {
      return next(createError.createError(404, "Payroll does not exist"));
      // return res.status(404).json({ error: "payroll does not exist" });
    } else {
      return res.json({ message: "Data fetched successfully", data: payroll });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.getLatestPayroll = async (req, res, next) => {
  try {
    const latestPayroll = await Payroll.findOne({
      order: [["createdAt", "DESC"]],
    });
    const lastEndDate = latestPayroll.endDate.toISOString().substring(0, 10);

    res.json({ message: "Data fetched successfully", data: latestPayroll });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.createPayroll = async (req, res, next) => {
  try {
    const CompanyId = req.user.id;

    // Convert object to array if the payload is an object with numeric keys
    const payrollData = Array.isArray(req.body)
      ? req.body
      : Object.values(req.body);

    // Debug log the payload to ensure it's an array now
    console.log("Received Payroll Data:", payrollData);

    // return res.json(payrollData)

    // Check if any of the provided payroll names already exist for the given CompanyId and different year
    const existingPayrollNames = await PayrollDefinition.findAll({
      where: {
        CompanyId,
        payrollName: payrollData.map((data) => data.payrollName),
      },
    });

    // Filter existing records to check if any payroll name exists with the same year
    const duplicatePayrolls = existingPayrollNames.filter((existing) => {
      return payrollData.some((data) => {
        const existingYear = new Date(existing.startDate).getFullYear();
        const newYear = new Date(data.startDate).getFullYear();
        return (
          existing.payrollName === data.payrollName && existingYear === newYear
        );
      });
    });

    if (duplicatePayrolls.length > 0) {
      // Payroll names already exist for the same year, handle the case accordingly
      const duplicateNames = duplicatePayrolls.map(
        (record) => record.payrollName
      );
      return next(
        createError.createError(
          400,
          `Payroll names already exist for the given Company in the same year: ${duplicateNames.join(
            ", "
          )}`
        )
      );
    }

    const updatedPayrollData = payrollData.map((data) => ({
      ...data,
      CompanyId,
    }));
    // return res.json(updatedPayrollData)
    const payrollDefinition = await PayrollDefinition.bulkCreate(
      updatedPayrollData
    );
    // const payrollDefinition = await PayrollDefinition.bulkCreate([
    //   {id: 18,
    //     payrollName: "February Payroll",
    //     startDate: new Date("2025-02-01"),
    //     endDate: new Date("2025-02-28"),
    //     payDate: new Date("2025-03-05"),
    //     payPeriod: "February 2025",
    //     status: "created",
    //     isRollBacked: false,
    //     isPaid: false,
    //     totalNoOfEmployee: 0,
    //     totalNoOfprocessedEmployee: 0,
    //     processedInPercent: 0,
    //     CompanyId: 1,
    //   },
    // ]);

    return res.status(201).json({
      message: "Successfully defined your payroll.",
      payrollDefinition,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// exports.createPayroll = async (req, res, next) => {
//   try {
//     // const criteria = {
//     //   CompanyId: CompanyId,
//     // };
//     const CompanyId = req.user.id;

//     // const payrollData = req.body;
//     // Ensure req.body is an array
//     const payrollData = Array.isArray(req.body)
//       ? req.body
//       : Object.values(req.body);

//     // return res.json(payrollData);

//     // return res.json(payrollData);

//     // Check if any of the provided payroll names already exist for the given CompanyId
//     const existingPayrollNames = await PayrollDefinition.findAll({
//       where: {
//         CompanyId,
//         payrollName: payrollData.map((data) => data.payrollName),
//       },
//     });

//     if (existingPayrollNames.length > 0) {
//       // Payroll names already exist, handle the case accordingly
//       const duplicateNames = existingPayrollNames.map(
//         (record) => record.payrollName
//       );
//       return next(
//         createError.createError(
//           400,
//           `Payroll names already exist for the given Company: ${duplicateNames.join(
//             ", "
//           )}`
//         )
//       );

//       // return res.status(400).json({
//       //   message: `Payroll names already exist for the given CompanyId: ${duplicateNames.join(', ')}`,
//       // });
//     }

//     const updatedPayrollData = payrollData.map((data) => ({
//       ...data,
//       CompanyId,
//     }));
//     const payrollDefinition = await PayrollDefinition.bulkCreate(
//       updatedPayrollData
//     );

//     return res.status(201).json({
//       message: "Successfully defined your payroll.",
//       data: payrollDefinition,
//     });
//   } catch (error) {
//     // clg(error);
//     console.log(error);
//     return next(
//       createError.createError(503, "An error occurred, please try again later")
//     );
//   }
// };

exports.updatePayrollDefinition = async (req, res, next) => {
  const id = req.params.id;
  try {
    const { payrollName, startDate, endDate, status } = req.body;
    const updates = {};
    const { id } = req.params;

    if (payrollName) {
      updates.payrollName = payrollName;
    }
    if (startDate) {
      updates.startDate = startDate;
    }
    if (endDate) {
      updates.endDate = endDate;
    }
    if (status) {
      updates.status = status;
    }
    const result = await Payroll.update(updates, { where: { id: id } });

    res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.deletePayrollDefinition = async (req, res, next) => {
  try {
    const id = req.params.id;
    const payroll = await Payroll.findOne({ where: { id: id } });
    if (payroll) {
      await Payroll.destroy({ where: { id } });
      return res.status(200).json({ message: "Deleted successfully" });
    } else {
      return next(
        createError.createError(400, "There is no  such payroll with this ID")
      );
      // return res
      //   .status(400)
      //   .json({ message: "There is no  such payroll with this ID" });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
exports.deletePayrolldefinition = async (req, res, next) => {
  try {
    const id = req.params.id;

    const checkpayrollDefinition = await PayrollDefinition.findByPk(id);
    if (checkpayrollDefinition) {
      await checkpayrollDefinition.destroy();
      return res.status(200).json({ message: "Deleted successfully" });
    } else {
      return next(
        createError.createError(404, "There is no such payroll definition ID")
      );
      // return res.status(404).json({
      //   message: "There is no such payroll definition ID",
      // });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getCurrentMonth = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const [ethiopianYear, ethiopianMonth, ethiopianDay] =
      ethiopianDate.toEthiopian(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate()
      );
    const startOfMonth = new Date(ethiopianYear, ethiopianMonth, 1);
    const endOfMonth = new Date(ethiopianYear, ethiopianMonth + 1, 0);

    const currentMonthPayrolls = await PayrollDefinition.findAll({
      where: {
        CompanyId: req.user.id,
        startDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    if (currentMonthPayrolls.length == 0) {
      return next(
        createError.createError(404, "Payroll not defined for this month")
      );
      // return res.status(404).json({
      //   message: "Payroll not defined for this month ",
      // });
    } else {
      return res.status(200).json({
        message: "Data fetched successfully",
        data: currentMonthPayrolls,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getPayrollBeforeCurrentMonth = async (req, res, next) => {
  try {
    const CompanyId = req.user.id;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1); // January 1st of the current year
    const startOfMonth = new Date(currentYear, currentDate.getMonth(), 1); // First day of the current month

    const payrollDefinitions = await PayrollDefinition.findAll({
      where: {
        CompanyId,
        startDate: {
          [Op.gte]: startOfYear, // From the start of the year
          [Op.lt]: startOfMonth, // Before the current month starts
        },
      },
    });

    if (payrollDefinitions.length === 0) {
      return next(
        createError.createError(
          404,
          "No payroll definitions found before this month in the current year."
        )
      );
      // return res.status(404).json({
      //   message:
      //     "No payroll definitions found before this month in the current year.",
      // });
    } else {
      return res.status(200).json({
        count: payrollDefinitions.length,
        data: payrollDefinitions,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
