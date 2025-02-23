const Pension = require("../models/pension.js");
const User = require("../models/user.js");
const createError = require("../utils/error.js");
const { Op, where } = require("sequelize");

exports.getAllPension = async (req, res, next) => {
  try {
    if (req.user.role === "superAdmin") {
      const pensions = await Pension.findAll({
        where: { UserId: req.user.id, isActive: true },
      });
      res.status(200).json({
        total: pensions.length,
        pensions,
      });
    } else if (req.user.role === "companyAdmin") {
      const pensions = await Pension.findAll({
        where: { CompanyId: req.user.id, isActive: true },
      });
      res.status(200).json({
        count: pensions.length,
        message: "Data fetched successfully",
        data: pensions,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getpensionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pension = await Pension.findByPk(id);
    res.json({
      message: "Data fetched successfully",
      data: pension,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.createPension = async (req, res, next) => {
  try {
    const { employerContribution, employeeContribution } = req.body;

    if (req.user.role === "superAdmin") {
      const getAllPension = await Pension.findAll({
        where: { UserId: req.user.id },
      });

      if (getAllPension.length != 0) {
        res.status(400).json("Pension is already defined update it ");
      } else {
        const pensions = await Pension.create({
          employerContribution,
          employeeContribution,
        });
        await pensions.setUser(Number(req.user.id));
        return res.status(200).json({
          message: "Successfully Registered",
          data: pensions,
        });
      }
    } else if (req.user.role === "companyAdmin") {
      const getAllPension = await Pension.findAll({
        where: { CompanyId: req.user.id },
      });
      if (getAllPension.length != 0) {
        res.status(400).json("Pension is already defined update it ");
      } else {
        const pensions = await Pension.create({
          employerContribution,
          employeeContribution,
        });
        await pensions.setCompany(Number(req.user.id));
        return res.status(200).json({
          message: "Successfully Registered",
          data: pensions,
        });
      }
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.updatePension = async (req, res, next) => {
  try {
    const { employeeContribution, employerContribution } = req.body;
    const updates = {};
    const { id } = req.params;

    if (req.user.role === "superAdmin") {
      const checkPension = await Pension.findByPk(id);
      if (!checkPension) {
        return res
          .status(404)
          .json({ message: "There is no pension with these Id" });
      } else {
        if (employerContribution) {
          updates.employerContribution = employerContribution;
        }
        if (employeeContribution) {
          updates.employeeContribution = employeeContribution;
        }

        const result = await Pension.update(
          { isActive: false },
          { where: { id: id } }
        );
        const newPension = await Pension.create({
          employeeContribution,
          employerContribution,
        });
        await newPension.setUser(Number(req.user.id));

        return res.status(200).json({
          message: "updated successfully",
          data: newPension,
        });
      }
    } else if (req.user.role === "companyAdmin") {
      const checkPension = await Pension.findByPk(id);

      if (!checkPension) {
        return res
          .status(404)
          .json({ message: "There is no pension with these Id" });
      } else {
        if (employerContribution) {
          updates.employerContribution = employerContribution;
        }
        if (employeeContribution) {
          updates.employeeContribution = employeeContribution;
        }

        const result = await Pension.update(
          { isActive: false },
          { where: { id: id } }
        );
        const newPension = await Pension.create({
          employeeContribution,
          employerContribution,
        });
        await newPension.setCompany(Number(req.user.id));

        return res.status(200).json({
          message: "updated successfully",
          data: newPension,
        });
      }
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.deletePension = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pension = await Pension.findOne({ where: { id: id } });
    if (pension) {
      await Pension.destroy({ where: { id } });
      return res.status(200).json({ message: "Deleted successfully" });
    } else {
      return res.status(400).json({ message: "Pension not Found" });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.getAllPensionIncludingInActive = async (req, res, next) => {
  try {
    if (req.user.role === "superAdmin") {
      const pensions = await Pension.findAll({
        where: { UserId: req.user.id },
      });
      res.status(200).json({
        count: pensions.length,
        pensions,
      });
    } else if (req.user.role === "companyAdmin") {
      const pensions = await Pension.findAll({
        where: { CompanyId: req.user.id },
      });
      res.status(200).json({
        count: pensions.length,
        message: "Data fetched successfully",
        data: pensions,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

exports.restoreToDefault = async (req, res, next) => {
  try {
    // return res.json("dataa");
    const deletedData = await Pension.update(
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

    const pension = await Pension.create({
      employeeContribution: 0,
      employerContribution: 0,
      CompanyId: Number(req.user.id),
      isActive: true,
      UserId: null,
    });

    res.status(200).json({
      success: true,
      message: "Restored to default",
      data: pension,
    });
  } catch (error) {
    console.log(error);
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
