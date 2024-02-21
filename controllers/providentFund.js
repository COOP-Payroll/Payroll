const ProvidentFund = require("../models/providentFund.js");
const createError=require("../utils/error.js");
const { Op, where } = require('sequelize');
// Define controller methods for handling User requests
exports.getAllProvidentFund = async (req, res) => {
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
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.getProvidentFundById = async (req, res) => {
  try {
    const { id } = req.params;
    const providentFunds = await ProvidentFund.findByPk(id);
    res.json(providentFunds);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.createProvidentFund = async (req, res, next) => {
  try {
    const { employerContribution, employeeContribution } = req.body;

    if (req.user.role === "superAdmin") {
      const getAllProvidentFund = await ProvidentFund.findAll({
        where: { userId: req.user.id },
      });

     if (!getAllProvidentFund || getAllProvidentFund.length == 0){
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
        res.status(409).json("ProvidentFund is already defined update it ");
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
          .status(409)
          .json("ProvidentFund is already defined update it ");
      }
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
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
    console.log("first", error);
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

exports.deleteProvidentFund = async (req, res, next) => {
  try {

    const { id } = req.params;
    if (req.user.role === "superAdmin") {
      const providentFund = await ProvidentFund.findOne({
        where: { id: id, UserId: req.user.id },
      });
      if (!providentFund ) {
        await ProvidentFund.destroy({ where: { id: id, UserId: req.user.id } });
        return res.status(200).json({ message: "Deleted successfully" });
      } else {
        return res
          .status(409)
          .json({ message: "There is no ProvidentFund with this ID" });
      }
    } else if (req.user.role === "companyAdmin") {
        
      const providentFund = await ProvidentFund.findOne({
        where: { id: id, CompanyId: req.user.id },
      });
      console.log("provident fund",providentFund === null)
      if ( !providentFund || providentFund.length === 0 || providentFund ===null) {
        return res
          .status(409)
          .json({ message: "There is no ProvidentFund with this ID" });
      } else {
        await ProvidentFund.destroy({ where: { id } });
        return res.status(200).json({ message: "Deleted successfully" });
      }
    }
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });

      return res.status(404).json({message:errors});
    } else if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} must be unique`];
      });

      return res.status(404).json({message:errors});
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};




exports.restoreToDefault = async (req, res, next) => {
  try {
    // const superAdmin = await User.findAll({ where: { role: "superAdmin" } });

    // 
    // const providentFunds = await ProvidentFund.findAll({
    //   where: {  UserId: { [Op.ne]: null },isActive:true },
    // });
    // if(providentFunds.length === 0){
    //   return next(createError.createError(404,"providentFunds is not Defined define your own"))
    // }
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



 const PF=  await ProvidentFund.create({         
      employeeContribution: 0,
      employerContribution: 0,
      CompanyId: Number(req.user.id),
      isActive:true,
      UserId: null,
    });
    // const providentFund = await Promise.all(
    //   providentFunds.map((providentFund) => {
    //     return ProvidentFund.create({         
    //       employeeContribution: Number(providentFund.employeeContribution),
    //       employerContribution: Number(providentFund.employerContribution),
    //       CompanyId: Number(req.user.id),
    //       isActive:true,
    //       UserId: null,
    //     });
    //   })
    // );
   
    
    res.status(200).json({
      success:true,
      message: "Restored to default",
      data:PF,
    });
  } catch (error) {
    console.log(error);
    return next(createError.createError(500,"Internal server error"))
  }
};