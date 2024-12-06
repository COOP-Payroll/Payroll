const Company = require("../models/company.js");
const Taxslab = require("../models/taxslab.js");
const User = require("../models/user.js");
const createError = require("../utils/error.js");

function parseInfinityBack(value) {
  return value === 1000000000 ? "Infinity" : value;
}

exports.getAllTaxslabs = async (req, res, next) => {
  try {
    if (req.user.role === "superAdmin") {
      const taxslabs = await Taxslab.findAll({
        where: { UserId: req.user.id, isActive: true },
        include: [
          {
            model: Company,
            attributes: { exclude: ["password"] },
          },
        ],
      });
      const taxslab = taxslabs.map((taxslab) => {
        return {
          ...taxslab.toJSON(),
          to_Salary: parseInfinityBack(taxslab.to_Salary),
        };
      });
      return res.status(200).json({
        count: taxslab.length,
        taxslab,
      });
    } else {
      const taxslabs = await Taxslab.findAll({
        where: { CompanyId: req.user.id, isActive: true },
      });

      const taxslab = taxslabs.map((taxslab) => {
        return {
          length: taxslab.length,
          ...taxslab.toJSON(),
          to_Salary: parseInfinityBack(taxslab.to_Salary),
        };
      });

      return res.status(200).json({
        count: taxslab.length,
        taxslab,
      });
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.getTaxslabById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const taxslab = await Taxslab.findOne({ where: { id: id } });

    if (!taxslab) {
      return res.status(404).json({ message: "TaxSlab not found" });
    } else {
      if (taxslab.to_Salary === 1000000000) {
        taxslab.to_Salary = "Infinity";
      }
      return res.json(taxslab);
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.createTaxslab = async (req, res, next) => {
  try {
    //CHECK SUPER ADMIN
    if (req.user.role === "superAdmin") {
      const {
        from_Salary,
        to_Salary,
        income_tax_payable,
        deductible_Fee,
        remark,
      } = req.body;

      const checkTax = await Taxslab.findAll({
        where: {
          UserId: req.user.id,
          from_Salary: from_Salary,
          to_Salary: to_Salary,
        },
      });

      if (checkTax.length != 0) {
        res.status(400).json("Taxslab is already defined");
      } else {
        const data = to_Salary == "Infinity" ? 1000000000 : to_Salary;
        // to_Salary === "Infinity" ? Infinity :to_Salary;
        const taxslab = await Taxslab.create({
          from_Salary,
          to_Salary: data,
          income_tax_payable,
          deductible_Fee,
          remark,
        });

        await taxslab.setUser(req.user.id);
        return res.status(200).json({
          message: "Successfully Registered",
          taxslab,
        });
      }
    } else if (req.user.role === "companyAdmin") {
      const {
        from_Salary,
        to_Salary,
        income_tax_payable,
        deductible_Fee,
        remark,
      } = req.body;
      const data = to_Salary == "Infinity" ? 1000000000 : to_Salary;
      const checkTax = await Taxslab.findAll({
        where: {
          CompanyId: req.user.id,
          from_Salary: from_Salary,
          to_Salary: data,
        },
      });

      if (checkTax === "undefined" || checkTax.length === 0) {
       
        const taxslab = await Taxslab.create({
          from_Salary,
          to_Salary: data,
          income_tax_payable,
          deductible_Fee,
          remark,
        });

        const company = await Company.findByPk(req.user.id);
        await taxslab.setCompany(company);

        return res.status(200).json({
          message: "Successfully Registered",
          taxslab,
        });
      } else {
        res.status(400).json("Taxslab is already defined");
      }
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.updateTaxslab = async (req, res, next) => {
  try {
    const data = req.body;
    const { id } = req.params;

    const { remark, ...otherData } = data;

    if (req.user.role === "superAdmin") {
      const taxslab = await Taxslab.findOne({ where: { id: id } });
      if (taxslab) {
        const result = await Taxslab.update(
          { isActive: false, remark: remark },
          { where: { id: id } }
        );

        const taxslab = await Taxslab.create(otherData);
        await taxslab.setUser(req.user.id);

        return res
          .status(200)
          .json({ message: " Tax Rule is updated successfully", taxslab });
      } else {
        return res
          .status(400)
          .json({ message: "There is no tax rule with this ID" });
      }
    } else if (req.user.role === "companyAdmin") {
      const taxslab = await Taxslab.findOne({ where: { id: id } });
      if (taxslab) {
        const result = await Taxslab.update(
          { isActive: false, remark: remark },
          { where: { id: id } }
        );
        const taxslab = await Taxslab.create(otherData);
        await taxslab.setCompany(req.user.id);

        return res
          .status(200)
          .json({ message: " Tax Rule is updated successfully", taxslab });
      } else {
        return res
          .status(400)
          .json({ message: "There is no tax rule with this ID" });
      }
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.deleteTaxslab = async (req, res, next) => {
  try {
    const { id } = req.params;

    const taxslab = await Taxslab.findOne({ where: { id: id } });
    if (taxslab) {
      await taxslab.destroy({ where: { id } });

      return res
        .status(200)
        .json({ message: " Tax Rule is Deleted successfully" });
    } else {
      return res
        .status(400)
        .json({ message: "There is no tax rule with this ID" });
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.assignTaxruleToCompany = async (req, res, next) => {
  try {
    const { taxRuleId } = req.params;
    const { name, rate } = req.body;

    // Find the tax rule
    const taxRule = await TaxRule.findByPk(taxRuleId);
    if (!taxRule) {
      return res.status(404).json({ error: "Tax rule not found" });
    }

    // Update the tax rule
    taxRule.name = name;
    taxRule.rate = rate;
    await taxRule.save();

    // Retrieve the super admin
    const superAdmin = await SuperAdmin.findOne();
    if (!superAdmin) {
      return res.status(404).json({ error: "Super admin not found" });
    }

    // Update the tax rule for the super admin
    await superAdmin.addTaxRule(taxRule);

    // Retrieve all companies
    const companies = await Company.findAll();

    // Update the tax rule for each company
    for (const company of companies) {
      await company.setTaxRule(taxRule);
    }

    return res.json(taxRule);
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

//

exports.getCompanyWITHtAXSLAB = async (req, res, next) => {
  try {
    const taxRuleId = 1; // ID of the tax rule

    const taxRule = await Taxslab.findByPk(taxRuleId);

    if (!taxRule) {
      return;
    }

    const associatedCompanies = await Taxslab.getCompany();

  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
//RESTORE

//MULTIPLE UPDATE

exports.updateMany = async (req, res, next) => {
  try {
    const updatedTaxSlabs = req.body; // Assuming the request body contains an array of tax slab updates
    if (req.user.role === "superAdmin") {
      // Perform bulk update using Sequelize
      const updatePromises = updatedTaxSlabs.map(async (updateData) => {
        // const {from_Salary,...other}=from_Salary;
        const { id, ...updateFields } = updateData;

        const [updatedCount] = await Taxslab.update(
          { isActive: false },
          {
            where: { id },
          }
        );
        const newTaxslab = await Taxslab.create(updateFields);
        await newTaxslab.setUser(req.user.id);
        return updatedCount;
      });

      const updateResults = await Promise.all(updatePromises);
      const totalUpdatedCount = updateResults.reduce(
        (acc, count) => acc + count,
        0
      );
      res
        .status(201)
        .json({ message: `Updated ${totalUpdatedCount} tax slabs` });
    } else if (req.user.role === "companyAdmin") {
      const updatePromises = updatedTaxSlabs.map(async (updateData) => {
        // const {from_Salary,...other}=from_Salary;
        const { id, ...updateFields } = updateData;

        const [updatedCount] = await Taxslab.update(
          { isActive: false },
          {
            where: { id },
          }
        );
        const newTaxslab = await Taxslab.create(updateFields);
        await newTaxslab.setCompany(req.user.id);
        return updatedCount;
      });

      const updateResults = await Promise.all(updatePromises);
      const totalUpdatedCount = updateResults.reduce(
        (acc, count) => acc + count,
        0
      );
      res
        .status(201)
        .json({ message: `Updated ${totalUpdatedCount} tax slabs` });
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.restoreToDefault = async (req, res, next) => {
  try {
    const superAdmin = await User.findOne({ where: { role: "superAdmin" } });
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
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};

exports.createNewTaxslab = async (req, res, next) => {
  try {
    const { first_Name, last_Name, email } = req.body;
    if (!first_Name) {
      return res.status(404).json({
        message: "please enter firstname",
      });
    }
  } catch (error) {
    return next(createError.createError(503, "An error occurred, please try again later"));
  }
};
