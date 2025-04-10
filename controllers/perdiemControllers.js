const PerDiem = require("../models/perdiem.js");
const PerDiemRate = require("../models/dailyperdiemrate.js");
const Company = require("../models/company.js");
const Employee = require("../models/employee.js");
const createError = require("../utils/error");
const ethiopianDate = require("ethiopian-date");
const PayrollDefinition = require("../models/payrollDefinition.js");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../database/db");
// GET ALL PER DIEM
exports.getAllPerDiem = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const perDiem = await PerDiem.findAll({
      where: {
        CompanyId,
        isActive: true,
      },
      attributes: {
        exclude: ["CompanyId", "EmployeeId", "PayrollDefinitionId"],
      },
    });
    res.status(200).json({
      count: perDiem.length,
      message: "Data fetched successfully",
      data: perDiem,
      //   currentMonthPayrolls,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getAllPerDiemCurrentMonth = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const currentDate = new Date();
    const [ethiopianYear, ethiopianMonth, ethiopianDay] =
      ethiopianDate.toEthiopian(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate()
      );
    const startOfMonth = new Date(ethiopianYear, ethiopianMonth, 1);
    const endOfMonth = new Date(ethiopianYear, ethiopianMonth + 1, 0);

    const currentMonthPayrolls = await PayrollDefinition.findOne({
      where: {
        CompanyId: req.user.id,
        startDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    if (!currentMonthPayrolls) {
      return next(
        createError.createError(404, "Please payrolldefinition first")
      );
    }
    const perDiem = await PerDiem.findAll({
      where: {
        CompanyId,
        isActive: true,
        PayrollDefinitionId: currentMonthPayrolls.id,
      },
      attributes: {
        exclude: ["CompanyId", "EmployeeId", "PayrollDefinitionId"],
      },
    });
    res.status(200).json({
      count: perDiem.length,
      message: "Data fetched successfully",
      data: perDiem,
      //   currentMonthPayrolls,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getAllPerDiemCurrentYear = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const currentDate = new Date();

    // Get the current Ethiopian year, month, and day
    const [ethiopianYear, ethiopianMonth, ethiopianDay] =
      ethiopianDate.toEthiopian(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate()
      );

    // Start of the year (January 1st of the current Ethiopian year)
    const startOfYear = new Date(ethiopianYear, 0, 1);

    // End of the year (December 31st of the current Ethiopian year)
    const endOfYear = new Date(ethiopianYear, 11, 31);

    // Query to get payroll data for the entire current year
    const currentYearPayrolls = await PayrollDefinition.findAll({
      where: {
        CompanyId: req.user.id,
        startDate: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
    });

    const ids = currentYearPayrolls.map((payroll) => payroll.id); // Extract the IDs from the result

    // If no payrolls found for the year, return an error
    if (ids.length === 0) {
      return next(
        createError.createError(
          404,
          "No payroll definitions found for the current year"
        )
      );
    }

    // Query to get PerDiem records where the PayrollDefinitionId is in the list of current year payroll IDs
    const perDiem = await PerDiem.findAll({
      where: {
        CompanyId,
        isActive: true,
        PayrollDefinitionId: {
          [Op.in]: ids, // Check if the PayrollDefinitionId is in the list of IDs
        },
      },
      attributes: {
        exclude: ["CompanyId", "EmployeeId", "PayrollDefinitionId"],
      },
    });

    res.status(200).json({
      count: perDiem.length,
      message: "Data fetched successfully",
      data: perDiem,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// GET PER DIEM BY ID
exports.getPerDiemById = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { id } = req.params;
    const perDiem = await PerDiem.findOne({
      where: {
        CompanyId: CompanyId,
        isActive: true,
      },
    });
    if (!perDiem) {
      return next(createError.createError(404, "PerDiem not found"));
    } else {
      return res.json({
        message: "Data fetched successfully",
        data: perDiem,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// CREATE PER DIEM
exports.createPerDiem = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    const currentDate = new Date();
    const [ethiopianYear, ethiopianMonth, ethiopianDay] =
      ethiopianDate.toEthiopian(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        currentDate.getDate()
      );
    const startOfMonth = new Date(ethiopianYear, ethiopianMonth, 1);
    const endOfMonth = new Date(ethiopianYear, ethiopianMonth + 1, 0);

    const currentMonthPayrolls = await PayrollDefinition.findOne({
      where: {
        CompanyId: req.user.id,
        startDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });
    if (currentMonthPayrolls.length === 0) {
      return next(
        createError.createError(400, "Please define payroll definition first")
      );
    }

    const dailyRate = PerDiemRate.findOne({
      where: {
        CompanyId: CompanyId,
        isActive: true,
      },
    });

    if (!dailyRate) {
      return next(
        createError.createError(400, "Please define daily rate first")
      );
    }
    // return res.json(currentMonthPayrolls);
    const { numberofDays, employeeId } = req.body;
    if (!numberofDays || !employeeId) {
      return next(
        createError.createError(400, "All required fields must be provided.")
      );
    }

    // Step 1: Check if the employee exists for the given CompanyId
    const employee = await Employee.findOne({
      where: { id: employeeId, CompanyId },
    });

    if (!employee) {
      return next(createError.createError(404, "Employee not found"));
    }

    // Step 2: Create the new PerDiem
    const perDiem = await PerDiem.create({
      numberofDays: numberofDays,
      CompanyId: CompanyId,
      EmployeeId: employeeId,
      PerDiemRateId: dailyRate.id,
      PayrollDefinitionId: currentMonthPayrolls.id,
    });

    // Step 3: Associate the created PerDiem with the employee and company
    // await perDiem.setCompany(CompanyId);
    // await perDiem.setEmployee(employee);

    // Step 4: Send response back to the client with success message and created data
    res.status(201).json({
      message: "Successfully registered PerDiem",
      data: perDiem,
    });
  } catch (error) {
    console.error(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// UPDATE PER DIEM
exports.updatePerDiem = async (req, res, next) => {
  const t = await sequelize.transaction(); // Start the transaction

  try {
    const { numberofDays } = req.body;
    const updates = {};
    const { id } = req.params;
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;

    if (numberofDays) {
      updates.numberofDays = numberofDays;
    }

    // Find the PerDiem record by its ID and the associated CompanyId
    const perDiem = await PerDiem.findOne({
      where: { id, CompanyId, isActive: true },
      transaction: t,
    });

    if (!perDiem) {
      return next(createError.createError(404, "PerDiem not found"));
    }

    // Check if the status is 'processed'
    if (perDiem.status === "processed") {
      // Set the current PerDiem record as inactive
      await perDiem.update({ isActive: false }, { transaction: t });

      // Create a new PerDiem record with the updated values
      await PerDiem.create(
        {
          CompanyId: perDiem.CompanyId, // Keep the same CompanyId
          EmployeeId: perDiem.EmployeeId, // Keep the same EmployeeId
          PayrollDefinitionId: perDiem.PayrollDefinitionId, // Keep the same PayrollDefinitionId
          status: "processed", // Ensure the status remains 'processed'
          isActive: true, // Set the new record as active
          numberofDays: updates.numberofDays, // Apply the updates (e.g., numberofDays)
          // Do not manually set the `id` field; let Sequelize auto-generate it
        },
        { transaction: t }
      );

      // Commit the transaction
      await t.commit();

      return res.status(201).json({
        message: "Updated successfully",
      });
    } else {
      // If the status is not 'processed', return the status
      return res.status(400).json({
        message: "Status is not processed. No update was made.",
      });
    }
  } catch (error) {
    // If an error occurs, rollback the transaction
    await t.rollback();
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

// DELETE PER DIEM
// DELETE PER DIEM (Soft delete if status is "processed", show message if status is not "processed")
exports.deletePerDiem = async (req, res, next) => {
  try {
    const CompanyId =
      req.user.role === "companyAdmin" ? req.user.id : req.user.CompanyId;
    const { id } = req.params;
    const perDiem = await PerDiem.findOne({
      where: { id: id, CompanyId: CompanyId, isActive: true },
    });

    if (perDiem) {
      // Check if the status is 'processed'
      if (perDiem.status === "processed") {
        // Soft delete by setting isActive to false
        await perDiem.update({ isActive: false });
        return res
          .status(200)
          .json({ message: "PerDiem deleted successfully" });
      } else {
        // If status is not 'processed', return a message
        return res.status(400).json({
          message: "You can't delete a PerDiem that is not processed",
        });
      }
    } else {
      return next(createError.createError(404, "PerDiem not found"));
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
