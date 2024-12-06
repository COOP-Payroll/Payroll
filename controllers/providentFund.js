const ProvidentFund = require("../models/providentFund.js");
const createError = require("../utils/error.js");
const { Op, where } = require("sequelize");
// Define controller methods for handling User requests
exports.getAllProvidentFund = async (req, res, next) => {
  try {
    if (req.user.role === "superAdmin") {
      const ProvidentFunds = await ProvidentFund.findAll({
        where: { userId: req.user.id, isActive: true },
      });
      res.status(200).json({
        count: ProvidentFunds.length,
        ProvidentFunds,
      });
    } else if (req.user.role === "companyAdmin") {
      const ProvidentFunds = await ProvidentFund.findAll({
        where: { CompanyId: req.user.id, isActive: true },
      });
      res.status(200).json({
        count: ProvidentFunds.length,
        ProvidentFunds,
      });
    }
  } catch (error) {

    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.getProvidentFundById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const providentFunds = await ProvidentFund.findByPk(id);
    res.json(providentFunds);
  } catch (error) {
   
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.createProvidentFund = async (req, res, next) => {
  try {
    const { employerContribution, employeeContribution } = req.body;

    if (req.user.role === "superAdmin") {
      const getAllProvidentFund = await ProvidentFund.findAll({
        where: { userId: req.user.id },
      });

      if (!getAllProvidentFund || getAllProvidentFund.length == 0) {
        const ProvidentFunds = await ProvidentFund.create({
          employerContribution,
          employeeContribution,
        });
        await ProvidentFunds.setUser(Number(req.user.id));
        return res.status(200).json({
          message: "Successfully Registered",
          ProvidentFunds,
        });
      } else {
        res.status(400).json("ProvidentFund is already defined update it ");
      }
    } else if (req.user.role === "companyAdmin") {
      const getAllProvidentFund = await ProvidentFund.findAll({
        CompanyId: req.user.id,
      });

      if (!getAllProvidentFund || getAllProvidentFund.length == 0) {
        const ProvidentFunds = await ProvidentFund.create({
          employerContribution,
          employeeContribution,
        });
        await ProvidentFunds.setCompany(Number(req.user.id));
        return res.status(200).json({
          message: "Successfully Registered",
          ProvidentFunds,
        });
      } else {
        return res
          .status(400)
          .json("ProvidentFund is already defined update it ");
      }
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.updateProvidentFund = async (req, res, next) => {
  try {
    const { employeeContribution, employerContribution } = req.body;
    const updates = {};
    const { id } = req.params;

    if (req.user.role === "superAdmin") {
      if (employerContribution) {
        updates.employerContribution = employerContribution;
      }
      if (employeeContribution) {
        updates.employeeContribution = employeeContribution;
      }

      const result = await ProvidentFund.update(
        { isActive: false },
        { where: { id: id } }
      );
      const newProvidentFund = await ProvidentFund.create({
        employeeContribution,
        employerContribution,
      });
      await newProvidentFund.setUser(Number(req.user.id));

      return res.status(200).json({
        message: "updated successfully",
        newProvidentFund,
      });
    } else if (req.user.role === "companyAdmin") {
      if (employerContribution) {
        updates.employerContribution = employerContribution;
      }
      if (employeeContribution) {
        updates.employeeContribution = employeeContribution;
      }

      const result = await ProvidentFund.update(
        { isActive: false },
        { where: { id: id } }
      );
      const newProvidentFund = await ProvidentFund.create({
        employeeContribution,
        employerContribution,
      });
      await newProvidentFund.setCompany(Number(req.user.id));

      return res.status(200).json({
        message: "updated successfully",
        newProvidentFund,
      });
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.deleteProvidentFund = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role === "superAdmin") {
      const providentFund = await ProvidentFund.findOne({
        where: { id: id, UserId: req.user.id },
      });
      if (!providentFund) {
        await ProvidentFund.destroy({ where: { id: id, UserId: req.user.id } });
        return res.status(200).json({ message: "Deleted successfully" });
      } else {
        return res
          .status(400)
          .json({ message: "There is no ProvidentFund with this ID" });
      }
    } else if (req.user.role === "companyAdmin") {
      const providentFund = await ProvidentFund.findOne({
        where: { id: id, CompanyId: req.user.id },
      });
      if (
        !providentFund ||
        providentFund.length === 0 ||
        providentFund === null
      ) {
        return res
          .status(400)
          .json({ message: "There is no ProvidentFund with this ID" });
      } else {
        await ProvidentFund.destroy({ where: { id } });
        return res.status(200).json({ message: "Deleted successfully" });
      }
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.restoreToDefault = async (req, res, next) => {
  try {
    const deletedData = await ProvidentFund.update(
      {
        isActive: false,
      },
      {
        where: {
          CompanyId: req.user.id,
          isActive: true,
        },
      }
    );

    const PF = await ProvidentFund.create({
      employeeContribution: 0,
      employerContribution: 0,
      CompanyId: Number(req.user.id),
      isActive: true,
      UserId: null,
    });

    res.status(200).json({
      success: true,
      message: "Restored to default",
      data: PF,
    });
  } catch (error) {

    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
