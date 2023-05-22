const ApprovalMethod = require("../models/approvalMethod");
const Company = require("../models/company");
const { getCompanyById } = require("./companyController");
// Define controller methods for handling User requests for deduction definition
exports.getAllApprovalMethod = async (req, res) => {
    const CompanyId = req.user.id;
    console.log(CompanyId)
  try {
    
    const criteria={
      where: {companyId: req.user.id},
    };
    const approvalMethod = await ApprovalMethod.findAll({criteria})
    console.log(CompanyId);
    res.status(200).json({
      count: approvalMethod.length,
      approvalMethod,
    });
  } catch (err) {
    res.status(500).json("Something gonna wrong");
  }
};

exports.createApprovalMethod = async (req, res) => {
  const CompanyId = req.user.id;
  console.log(CompanyId)
  try {
    const minimumApprover = req.body.minimumApprover;
    const approvalLevel = req.body.approvalLevel;
    const isCompleted = req.body.isCompleted;
    const isThereMasterApprover = req.body.isThereMasterApprover;
    const approvalMethod = req.body.approvalMethod;
    const lastUpdated = new Date();

    console.log(
      isCompleted,
      approvalLevel,
      minimumApprover,
      isThereMasterApprover,
      approvalMethod,
      lastUpdated

    );
    const criteria={
      where: {companyId: req.user.id},
    };
    const isExist = await ApprovalMethod.count({criteria})
    console.log("exist",isExist)
    if(isExist>=1){
        res.json("this company setted approval method")
    }else{
        const appMethod = await ApprovalMethod.create({
          minimumApprover,
          approvalLevel,
          approvalMethod,
          isCompleted,
          isThereMasterApprover,
          lastUpdated
        });

        const company = await Company.findByPk(Number(CompanyId));

        if (company) {
          console.log("company");
          await appMethod.setCompany(CompanyId);
        } else {
          console.log("no such company");
        }
        res.json({
          success: true,
          Message: "Successfully defined approvel method",
          created:appMethod
        })
      }
  } catch (err) {
    res.status(500).json("Something gonna wrong");
  }
};

exports.updateApprovalMethod = async (req, res, next) => {
  const id = req.params.id;
  try {
    const appMethod = await ApprovalMethod.findByPk(Number(id));

    const updates = {};
    const minimumApprover = req.body.minimumApprover;
    const approvalLevel = req.body.approvalLevel;
    const isCompleted = req.body.isCompleted;
    const isThereMasterApprover = req.body.isThereMasterApprover;
    const approvalMethod = req.body.approvalMethod;

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

    if (appMethod) {
        const result = await ApprovalMethod.update(updates, {
        where: { id: id },
      });
      res.json({
        message:"success",
        appMethod
      })
    } else {
      console.log("no such approval method");
    }
  } catch (error) {
    res.status(500).json("Something gonna wrong");
  }
};

exports.deleteApprovalMethod = async (req, res, next) => {
  try {
    const id = req.params.id;
    const approvalMethod = await ApprovalMethod.findOne({ where: { id: id } });
    if (approvalMethod) {
      await approvalMethod.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res
        .status(409)
        .json({ message: "There is no  such approval method with this ID" });
    }
  } catch (err) {
    res.status(500).json("Something gonna wrong");
  }
};
