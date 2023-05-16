const Company = require("../models/company.js");
const Taxslab = require("../models/taxslab.js");
const User = require("../models/user.js");

// Define controller methods for handling User requests
exports.getAllTaxslabs = async (req, res) => {
  try {
    const taxslab = await Taxslab.findAll({
      include: [
        {
          model: Company,
          attributes: { exclude: ["password"] },
        },
        {
          model: User,
          attributes: { exclude: ["password"] },
        },
      ],
    });
    res.status(200).json({
      count: taxslab.length,
      taxslab,
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).json("Something gonna wrong");
  }
};





exports.getTaxslabById = async (req, res) => {
  try {
    const { id } = req.params;
    const taxslab = await Taxslab.findByPk(id);
    res.json(taxslab);
  } catch (er) {
    res.status(500).json("Something gonna wrong");
  }
};

exports.createTaxslab = async (req, res, next) => {
  try {
    const { from_Salary, to_Salary, income_tax_payable, deductible_Fee } =
      req.body;
    const taxslab = await Taxslab.create({
      from_Salary,
      to_Salary,
      income_tax_payable,
      deductible_Fee,
    });

    await taxslab.setUser(Number(req.user.id));

    res.status(200).json({
      message: "Successfully Registered",
      taxslab,
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).json("Something gonna wrong");
  }
};

exports.updateTaxslab = async (req, res, next) => {
  try {
    const {
      from_Salary,
      to_Salary,
      income_tax_payable,
      deductible_Fee,
      companyId,
      isActive,
    } = req.body;
    const updates = {};
    const { id } = req.params;

    if (from_Salary) {
      updates.from_Salary = from_Salary;
    }
    if (to_Salary) {
      updates.to_Salary = to_Salary;
    }
    if (income_tax_payable) {
      updates.income_tax_payable = income_tax_payable;
    }
    if (deductible_Fee) {
      updates.deductible_Fee = deductible_Fee;
    }
    if (companyId) {
      updates.companyId = companyId;
    }
    if (isActive) {
      updates.isActive = isActive;
    }

    const result = await Taxslab.update(updates, { where: { id: id } });

    res.status(200).json({
      message: "updated successfully",
    });
  } catch (err) {
    res.status(500).json("Something gonna wrong");
  }
};

exports.deleteTaxslab = async (req, res, next) => {
  try {
    const { id } = req.params;

    const taxslab = await Taxslab.findOne({ where: { id: id } });
    if (taxslab) {
      await Taxslab.destroy({ where: { id } });
      res.status(200).json({ message: " deleted successfully" });
    } else {
      res.status(409).json({ message: "There is no tax rule with this ID" });
    }
  } catch (err) {
    res.status(500).json("Something gonna wrong");
  }
};

/////

// API endpoint for super admin to update tax rules
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
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
