const AdditionalPay = require("../models/additionalPay.js");
const AdditionalpayDefinition = require("../models/additionalPayDefinition.js");
const Grade = require("../models/grade");
const Company = require("../models/company.js");
const Employee = require("../models/employee.js");

// Define controller methods for handling User requests for deduction definition
exports.getAllAdditionalPay = async (req, res,next) => {
    try {
      const companyId = req.user.id;
      const additionalPay = await AdditionalPay.findAll({ where: { companyId } });
      res.status(200).json({
        count: additionalPay.length,
        additionalPay,
      });
    } catch (error) {
      next(error)
    }
  };

exports.getAdditionalPayById = async (req, res,next) => {
  try {
    const { id } = req.params;

    const additionalPay = await AdditionalPay.findByPk(id);
    if (!additionalPay) {
      return res.status(404).json({ message: "There is no allowance id" });
    } else {
     return  res.json(additionalPay);
    }
  } catch (error) {
   next(error)
  }
};

exports.createAdditionalPay = async (req, res, next) => {
  try {
    console.log("create additional pay");
    //insert required field
    const amount = req.body.amount;
    const employeeId = req.body.employeeId;
    const additionalPayDefinitionId = req.body.additionalPayDefinitionId;
    const employee = await Employee.findByPk(employeeId);
    const emp2 = await Employee.findAll({
      where: { id: employeeId },
      include: {
        model: AdditionalPay,
       
      },
    });

    const additionalPayDefinition1 = await AdditionalpayDefinition.findByPk(
        additionalPayDefinitionId,
      {
        include: [
          {
            model: AdditionalPay,
            where: { EmployeeId: employeeId },
          },
        ],
      }
    );

    
    
    
    const allDefinition = await AdditionalpayDefinition.findByPk(
      additionalPayDefinitionId,
    );
    // console.log("first",allowanceDefinitionId)
    if (!employee) {
      res.status(404).json("Employee is not defined");
    } else if (!allDefinition) {
      res.status(404).json({
        message: "additional payment definition is not defined",
        additionalPayDefinition1,
      });

      // await allowance.setCompany(Number(req.user.id))
    }
    else if (additionalPayDefinition1) {
      res.status(404).json({
        message: "additional payment definition is already added",
      });
    } else {
      // Handle the case where the company with the given ID is not found
      const additionalPayType = await AdditionalpayDefinition.findByPk(
        additionalPayDefinitionId,
        )
      const type2 = additionalPayType.type;
      if(type2==='deduction'){
        const amount = -(req.body.amount);
        const additionalPay = await AdditionalPay.create({ amount });
        await additionalPay.setCompany(Number(req.user.id));
        await additionalPay.setAdditionalPayDefinition(additionalPayDefinitionId);
        await additionalPay.setEmployee(employee);
        res.status(200).json({
            message: "Successfully Registered",
            additionalPay,
            // additionalAllowanceDefinition1,
        });
      }else{
        const additionalPay = await AdditionalPay.create({ amount });
        await additionalPay.setCompany(Number(req.user.id));
        await additionalPay.setAdditionalPayDefinition(additionalPayDefinitionId);
        await additionalPay.setEmployee(employee);
        res.status(200).json({
            message: "Successfully Registered",
            additionalPay,
            // additionalAllowanceDefinition1,
        });
      }
      
    }
  } catch (error) {
    console.log("error",error)
   next(error)
  }
};

exports.updateAdditionalPay = async (req, res, next) => {
  try {
    //insert required field
    const { amount } = req.body;
    const updates = {};
    const { id } = req.params;
    if (amount) {
      updates.amount = amount;
    }

    const result = await AdditionalPay.update({ amount }, { where: { id: id } });

    res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
   next(error)
  }
};

exports.deleteAdditionalPay = async (req, res, next) => {
  try {
    const { id } = req.params;
    const additionalPay = await AdditionalPay.findOne({ where: { id: id } });
    if (additionalPay) {
      await AdditionalPay.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res
        .status(409)
        .json({ message: "There is no Deduction Definition with this ID" });
    }
  } catch (error) {
   next(error)
  }
};
