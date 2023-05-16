const Payroll = require("../models/payroll")
const Company = require("../models/company");
const { getCompanyById } = require("./companyController");
const { where } = require("sequelize");

// Define controller methods for handling User requests for deduction definition 
exports.getAllPayroll = async (req, res,next) => {
    try {
        const CompanyId = req.params.companyId;
        //console.log(CompanyId)
        const criteria ={
            CompanyId
        }
        console.log(criteria)
        const payroll = await Payroll.findOne({where:criteria});

        console.log(payroll)
        res.status(200).json({
             count: payroll.length,
             payroll,
        
        });
    } catch (err) {
        res.status(500).json('Something gonna wrongi')
    }
};

exports.createPayroll = async (req, res) => {
    try {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      const CompanyId = req.params.companyId;
        const criteria ={
            CompanyId: CompanyId,
            startDate: req.body.startDate,
          }
          console.log(criteria);
      const ifPayroll = await Payroll.count({
        where: criteria
      });
      console.log(ifPayroll)
      if (ifPayroll >= 1) {
        res.json("You have already defined the payroll for this month.");
      } else if (ifPayroll === 0) {
        const newPayroll = await Payroll.create({
          payrollName: req.body.payrollName,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          
        });
        await newPayroll.setCompany(CompanyId);
        res.status(201).json("Successfully defined your first payroll.");
      } else {
        const latestPayroll = await Payroll.findOne({
          order: [['updatedAt', 'DESC']],
        });
  
        let latestDate;
        if (!latestPayroll) {
          const newPayroll = await Payroll.create({
            payrollName: req.body.payrollName,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
          });
          res.json(newPayroll);
        } else {
          latestDate = latestPayroll.updatedAt;
          const interval = Math.round(
            (startDate.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          const newInterval = Math.round(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
  
          if (newInterval < 20 || newInterval > 30) {
            res.json('The payroll duration should be between 20 and 30 days.');
          } else {
            if (interval !== 1) {
              res.json('The payroll should be defined one day after the last month payroll.');
            } else {
              const newPayroll = await Payroll.create({
                payrollName: req.body.payrollName,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                
              });
              res.status(201).json(newPayroll);
            }
          }
        }
      }
    } catch (err) {
      res.status(500).json('Something went wrong.');
    }
  };
  

exports.updateApprovalMethod=async(req,res,next)=>{
    const id = req.params.id;
    try {
        const appMethod = await ApprovalMethod.findByPk(Number(id));

        const updates={};
        const minimumApprover = req.body.minimumApprover;
        const  approvalLevel  = req.body.approvalLevel;
        const isCompleted   = req.body.isCompleted;
        const isThereMasterApprover = req.body.isThereMasterApprover;
        const approvalMethod = req.body.approvalMethod
        if (minimumApprover) {
            updates.minimumApprover = minimumApprover;
        }
        if (approvalLevel) {
            updates.approvalLevel = approvalLevel;
        }
        if (isCompleted) {
            updates.isCompleted = isCompleted;
        }
        if (isThereMasterApprover) {
            updates.isThereMasterApprover = isThereMasterApprover;
        }
        if (approvalMethod) {
            updates.approvalMethod = approvalMethod;
        }

        if(appMethod){
            const result = await ApprovalMethod.update(updates, { where: { id: id } });
        }else{
            console.log("no such approval method")
        }
    } catch (error) {
        res.status(500).json('Something gonna wrong')
    }
}

exports.deleteApprovalMethod= async(req,res,next)=>{

    try {
        const id  = req.params.id;
        const approvalMethod = await ApprovalMethod.findOne({ where: { id: id } });
        if (approvalMethod) {

            await approvalMethod.destroy({ where: { id } });
            res.status(200).json({ message: 'Deleted successfully' });
        }
        else {
            res.status(409).json({ message: 'There is no  such approval method with this ID' });
        }
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }
}