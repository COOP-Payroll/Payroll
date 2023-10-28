const Company = require("../models/company.js");
const Taxslab = require("../models/taxslab.js");
const User = require("../models/user.js");

function parseInfinityBack(value) {
  return value === 1000000000 ? "Infinity" : value;
}

// Define controller methods for handling User requests
exports.getAllTaxslabs = async (req, res) => {
  try {
    if (req.user.role === "superAdmin") {
      const taxslabs = await Taxslab.findAll({
        where: { userId: req.user.id, isActive: true },
        include: [
          {
            //company
            model: Company,
            attributes: { exclude: ["password"] },
          },
          // {
          //   model: User,
          //   attributes: { exclude: ["password"] },
          // },
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

      // return res.status(200).json({
      //   count: taxslab.length,
      //   taxslab,
      // });
    } else {
      const taxslabs = await Taxslab.findAll({
        where: { CompanyId: req.user.id, isActive: true },
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
      // return res.status(200).json({
      //   count: taxslab.length,
      //   taxslab,
      // });
    }
  } catch (error) {
    console.log("error", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.getTaxslabById = async (req, res) => {
  try {
    const { id } = req.params;
    const taxslab = await Taxslab.findOne({ where: { id: id } });

    //  const taxslab = taxslabs.map((taxslab) => {
    //    return {
    //      ...taxslab.toJSON(),
    //      to_Salary: parseInfinityBack(taxslab.to_Salary),
    //    };
    //  });

    if (!taxslab) {
      return res.status(404).json({ message: "TaxSlab not found" });
    } else {
      if (taxslab.to_Salary === 1000000000) {
        taxslab.to_Salary = "Infinity";
      }
      return res.json(taxslab);
    }
  } catch (error) {
    console.log("first error: " + error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

//CREATE TAXSLAB

exports.createTaxslab = async (req, res, next) => {
  try {
    // console.log(req.user.role === "superAdmin");

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
          userId: req.user.id,
          from_Salary: from_Salary,
          to_Salary: to_Salary,
        },
      });

      if (checkTax.length != 0) {
        res.status(409).json("Taxslab is already defined");
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
          companyId: req.user.id,
          from_Salary: from_Salary,
          to_Salary: data,
        },
      });
      console.log(to_Salary == "Infinity" ? 1000000000 : to_Salary);

      if (checkTax === "undefined" || checkTax.length === 0) {
        //   const data = to_Salary == "Infinity" ? -1 : to_Salary;
        console.log("to_Salary: ", data);
        console.log("to salary", to_Salary);
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
        res.status(409).json("Taxslab is already defined");
      }
    }
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
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
        // console.log(data);

        const taxslab = await Taxslab.create(otherData);
        await taxslab.setUser(req.user.id);

        return res
          .status(200)
          .json({ message: " Tax Rule is updated successfully", taxslab });
      } else {
        return res
          .status(409)
          .json({ message: "There is no tax rule with this ID" });
      }
    } else if (req.user.role === "companyAdmin") {
      const taxslab = await Taxslab.findOne({ where: { id: id } });
      if (taxslab) {
        const result = await Taxslab.update(
          { isActive: false, remark: remark },
          { where: { id: id } }
        );
        // console.log(data);

        const taxslab = await Taxslab.create(otherData);
        await taxslab.setCompany(req.user.id);

        return res
          .status(200)
          .json({ message: " Tax Rule is updated successfully", taxslab });
      } else {
        return res
          .status(409)
          .json({ message: "There is no tax rule with this ID" });
      }
    }
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });
      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  // try {
  //   const {
  //     from_Salary,
  //     to_Salary,
  //     income_tax_payable,
  //     deductible_Fee,
  //     companyId,
  //     isActive,
  //   } = req.body;
  //   const updates = {};
  //   const { id } = req.params;

  //   if (from_Salary) {
  //     updates.from_Salary = from_Salary;
  //   }
  //   if (to_Salary) {
  //     updates.to_Salary = to_Salary;
  //   }
  //   if (income_tax_payable) {
  //     updates.income_tax_payable = income_tax_payable;
  //   }
  //   if (deductible_Fee) {
  //     updates.deductible_Fee = deductible_Fee;
  //   }
  //   if (companyId) {
  //     updates.companyId = companyId;
  //   }
  //   if (isActive) {
  //     updates.isActive = isActive;
  //   }

  //   const result = await Taxslab.update(updates, { where: { id: id } });

  //   return res.status(200).json({
  //     message: "updated successfully",
  //   });
  // } catch (err) {
  //   return res.status(500).json("Something gonna wrong");
  // }
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
        .status(409)
        .json({ message: "There is no tax rule with this ID" });
    }
  } catch (error) {
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });
      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
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
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//

exports.getCompanyWITHtAXSLAB = async (req, res, next) => {
  try {
    const taxRuleId = 1; // ID of the tax rule

    const taxRule = await Taxslab.findByPk(taxRuleId);

    if (!taxRule) {
      console.log("Tax rule not found");
      return;
    }

    const associatedCompanies = await Taxslab.getCompany();

    console.log("Companies assigned to the tax rule:", associatedCompanies);
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
  }
};
//RESTORE

//MULTIPLE UPDATE

// Assuming you have already set up your Express.js server and imported the necessary modules and models

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
      console.log("first", totalUpdatedCount);
      res
        .status(201)
        .json({ message: `Updated ${totalUpdatedCount} tax slabs` });
    } else if (req.user.role === "companyAdmin") {
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
        await newTaxslab.setCompany(req.user.id);
        return updatedCount;
      });

      const updateResults = await Promise.all(updatePromises);
      const totalUpdatedCount = updateResults.reduce(
        (acc, count) => acc + count,
        0
      );
      console.log("first", totalUpdatedCount);
      res
        .status(201)
        .json({ message: `Updated ${totalUpdatedCount} tax slabs` });
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

//RESTORE TO DEFAULT

exports.restoreToDefault = async (req, res, next) => {
  try {
    const superAdmin = await User.findOne({ where: { role: "superAdmin" } });
    const taxslabs = await Taxslab.findAll({
      where: { userId: Number(superAdmin.id), isActive: true },
    });

    const deletedData = await Taxslab.destroy({
      where: {
        companyId: req.user.id,
        isActive: true,
      },
    });

    console.log("first", req.user.id);

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
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({ message: errors });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({ message: errors });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.createNewTaxslab= async(req,res,next)=>{
  try {
    const {first_Name,last_Name,email,}=req.body;
    if(!first_Name){
      return res.status(404).json({
        message:"please enter firstname"
      })
    }


  } catch (error) {
    console.log("error is ", error)
    
  }
}