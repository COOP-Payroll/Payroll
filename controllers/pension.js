const Pension = require("../models/pension.js");

exports.getAllPension = async (req, res,next) => {
  try {
    if (req.user.role === "superAdmin") {
      const pensions = await Pension.findAll({
        where: { userId: req.user.id, isActive: true },
      });
      res.status(200).json({
        total: pensions.length,
        pensions,
      });
    } else if (req.user.role === "companyAdmin") {
      const pensions = await Pension.findAll({
        where: { CompanyId: req.user.id },
      });
      res.status(200).json({
        count: pensions.length,
        pensions,
      });
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
  }
};

exports.getpensionById = async (req, res,next) => {
  try {
    const { id } = req.params;
    const pension = await Pension.findByPk(id);
    res.json(pension);
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
  }
};

exports.createPension = async (req, res, next) => {
  try {
    const { employerContribution, employeeContribution } = req.body;

    console.log("user ID", req.user.id);

    if (req.user.role === "superAdmin") {
      const getAllPension = await Pension.findAll({
        where: { userId: req.user.id },
      });

      if (getAllPension.length != 0) {
        res.status(409).json("Pension is already defined update it ");
      } else {
        const pensions = await Pension.create({
          employerContribution,
          employeeContribution,
        });
        await pensions.setUser(Number(req.user.id));
        return res.status(200).json({
          message: "Successfully Registered",
          pensions,
        });
      }
    } else if (req.user.role === "companyAdmin") {
      const getAllPension = await Pension.findAll({
        where: { CompanyId: req.user.id },
      });
      if (getAllPension.length != 0) {
        res.status(409).json("Pension is already defined update it ");
      } else {
        const pensions = await Pension.create({
          employerContribution,
          employeeContribution,
        });
        await pensions.setCompany(Number(req.user.id));
        return res.status(200).json({
          message: "Successfully Registered",
          pensions,
        });
      }
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
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
          newPension,
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
          newPension,
        });
      }
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
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
      return res
        .status(409)
        .json({ message: "There is no pension with this ID" });
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
  }
};


exports.getAllPensionIncludingInActive = async (req, res,next) => {
  try {
    if (req.user.role === "superAdmin") {
      const pensions = await Pension.findAll({
        where: { userId: req.user.id },
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
        pensions,
      });
    }
  } catch (error) {
    console.log(error)
    return next(createError.createError(500,"Internal server error"))
  }
};


exports.restoreToDefault = async (req, res, next) => {
  try {
    const superAdmin = await User.findAll({ where: { role: "superAdmin" } });

    return res.json(superAdmin)
    const taxslabs = await Taxslab.findAll({
      where: { UserId: Number(superAdmin.id), isActive: true },
    });

    const deletedData = await Taxslab.destroy({
      where: {
        CompanyId: req.user.id,
        isActive: true,
      },
    });


    const tax = await Promise.all(
      taxslabs.map((taxslab) => {
        return Taxslab.create({
          from_Salary: Number(taxslab.from_Salary),
          to_Salary: Number(taxslab.to_Salary),
          income_tax_payable: Number(taxslab.income_tax_payable),
          deductible_Fee: Number(taxslab.deductible_Fee),
          CompanyId: Number(req.user.id),
          UserId: null,
        });
      })
    );
    res.status(200).json({
      message: "Restored to default",
      deletedData: tax,
      tax,
    });
  } catch (error) {
    console.log(error);
    return next(createError.createError(500,"Internal server error"))
  }
};
