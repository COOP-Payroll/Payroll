const { DATEONLY } = require("sequelize");
const { Sequelize, Op } = require("sequelize");
const Payroll = require("../models/payrollDefinition");
const PayrollDefinition = require("../models/payrollDefinition");
const createError=require("../utils/error.js")

// Define controller methods for handling User requests for deduction definition
exports.getAllPayroll = async (req, res, next) => {
  try {
    const CompanyId = req.user.id;
    //console.log(CompanyId)
    const criteria = {
     where: {CompanyId:CompanyId}
    };
    const payroll = await Payroll.findAll(criteria);

    return res.status(200).json({
      count: payroll.length,
      payroll,
    });
  } catch (err) {
    return res.status(500).json("Something gonna wrongi");
  }
};
//get by id
exports.getPayrollDefinitionById = async (req, res) => {
  const { id } = req.params;

  try {
    const payroll = await Payroll.findByPk(Number(id));
    if (!payroll) {
      return res.status(404).json({ error: "payroll does not exist" });
    } else {
      return res.json(payroll);
    }
  } catch (error) {
    return res.json(error);
  }
};
exports.getLatestPayroll = async (req, res) => {
  try{
    console.log("Getting latest payroll");
    const latestPayroll = await Payroll.findOne({
      order: [["createdAt", "DESC"]],
    });
    const lastEndDate = latestPayroll.endDate.toISOString().substring(0, 10);
    const lat="latest"
    console.log({
      payroll:latestPayroll,
      endDate:lastEndDate,
      lat:lat
    })
    res.json(latestPayroll);
  }catch(err){

  }
};
exports.createPayroll = async (req, res,next) => {
  try {
    

    // const criteria = {
    //   CompanyId: CompanyId,
    // };
const CompanyId = req.user.id;

    const payrollData= req.body;

 // Check if any of the provided payroll names already exist for the given CompanyId
    const existingPayrollNames = await PayrollDefinition.findAll({
      where: {
        CompanyId,
        payrollName: payrollData.map((data) => data.payrollName),
      },
    });

    if (existingPayrollNames.length > 0) {
      // Payroll names already exist, handle the case accordingly
      const duplicateNames = existingPayrollNames.map((record) => record.payrollName);
      return next(createError.createError(400,`Payroll names already exist for the given Company: ${duplicateNames.join(', ')}`))
      // return res.status(400).json({
      //   message: `Payroll names already exist for the given CompanyId: ${duplicateNames.join(', ')}`,
      // });
    }


   const updatedPayrollData = payrollData.map((data) => ({
     ...data,
     CompanyId,
   }));



      const payrollDefinition = await PayrollDefinition.bulkCreate(
        updatedPayrollData
      );

   

      return res
        .status(201)
        .json({
          message: "Successfully defined your payroll.",
          payrollDefinition,
        });


      
   
  } catch (error) {
    console.log("first", error);
   return next(createError.createError(500,"Internal server error"))
  }
  
};

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
    return res.status(500).json("Something gonna wrong");
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
      return res
        .status(409)
        .json({ message: "There is no  such payroll with this ID" });
    }
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
  }
};
exports.deletePayrolldefinition= async(req,res,next)=>{
  try {
    
const id= req.params.id;

const checkpayrollDefinition = await   PayrollDefinition.findByPk(id);
console.log("checkPayrollDefinition",checkpayrollDefinition)
if(checkpayrollDefinition) {
await checkpayrollDefinition.destroy(); 
return res.status(200).json({ message: "Deleted successfully"})

}
else{

  return res.status(404).json({
    "message":"There is no such payroll definition ID"
  })
}



  } catch (err) {
     console.log("first", err);
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
}

exports.getCurrentMonth= async(req,res,next)=>{
  try {
    
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(),  1  );
  const endOfMonth = new Date(currentDate.getFullYear(),currentDate.getMonth() + 1,  0  );

  const currentMonthPayrolls = await PayrollDefinition.findAll({
    where: {
      CompanyId:req.user.id,
      startDate: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
    },
  });

console.log("current month",currentMonthPayrolls.length)
if(currentMonthPayrolls.length == 0 ){
  return res.status(404).json({
    message:"Payroll not defined for this month "
  })
  
}
else{
  return res.status(200).json(
    currentMonthPayrolls
  )
}


    
  } catch (error) {
    console.log("error",error)
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
}