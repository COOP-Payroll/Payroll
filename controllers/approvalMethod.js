const ApprovalMethod = require("../models/approvalMethod");
const Company = require("../models/company");
const Approver = require("../models/approver");

// Define controller methods for handling User requests for deduction definition
exports.getAllApprovalMethod = async (req, res) => {
  console.log("all approval")
  const CompanyId = req.user.id;
  console.log(CompanyId);
  try {
    const criteria = {
      where: { companyId: req.user.id },
    };
    const approvalMethod = await ApprovalMethod.findAll(criteria )
    console.log(CompanyId);
    res.status(200).json({
      count: approvalMethod.length,
      approvalMethod,
    });
  } catch (err) {
    res.status(500).json("Something gonna wrong");
  }
};
exports.getAllActiveApprovalMethod = async (req, res) => {
  
  const CompanyId = req.user.id;
  console.log(CompanyId);
  try {
    const criteria = {
      where: { companyId: req.user.id, isActive: true },
    };
    const approvalMethod = await ApprovalMethod.findAll(criteria);
    console.log("this is active",approvalMethod);
    res.status(200).json({
      count: approvalMethod.length,
      approvalMethod,
    });
  } catch (err) {
    res.status(500).json("Something gonna wrong");
  }
};
exports.getAllInActiveApprovalMethod = async (req, res) => {
  
  const CompanyId = req.user.id;
  console.log(CompanyId);
  try {
    const criteria = {
      where: { companyId: req.user.id, isActive: false },
    };
    const approvalMethod = await ApprovalMethod.findAll(criteria );
    console.log(CompanyId);
    res.status(200).json({
      count: approvalMethod.length,
      approvalMethod,
    });
  } catch (err) {
    res.status(500).json("Something gonna wrong");
  }
};
//save approval method
async function saveApprovalMethod(
  CompanyId,
  minimumApprover,
  approvalLevel,
  isCompleted,
  isThereMasterApprover,
  approvalMethod,
  lastUpdated,
  isActive
) {
  const appMethod = await ApprovalMethod.create({
    minimumApprover,
    approvalLevel,
    approvalMethod,
    isCompleted,
    isThereMasterApprover,
    lastUpdated,
    isActive
  });

  const company = await Company.findByPk(Number(CompanyId));

  if (company) {
    console.log("company");
    await appMethod.setCompany(CompanyId);
  } else {
    console.log("no such company");
    return "no such company";
  }
  return {
    success: true,
    Message: "Successfully defined approvel method",
    created: appMethod,
  };
}

exports.createApprovalMethod = async (req, res) => {
  const CompanyId = req.user.id;
  let minimumApprover = req.body.minimumApprover;
  let approvalLevel = req.body.approvalLevel;
  const isCompleted = req.body.isCompleted;
  const isThereMasterApprover = req.body.isThereMasterApprover;
  const approvalMethod = req.body.approvalMethod;
  const lastUpdated = new Date();
  const isActive=true
  try {  
    console.log(
      isCompleted,
      approvalLevel,
      minimumApprover,
      isThereMasterApprover,
      approvalMethod,
      lastUpdated,
      isActive,
      
    );
    const criteria = {
      where: { companyId: req.user.id },
    };
    console.log("criteria",criteria)
    const isExist = await ApprovalMethod.count(criteria);
    console.log("exist", isExist);
    if (isExist >= 1) {
      return res.json("this company setted approval method");
    } else {
      if(approvalLevel>3){
        console.log("approval method camnnot be greater than three level ")
        return res.json("approval method camnnot be greater than three ");
      }else{
          if (approvalMethod === "horizontal") {
            approvalLevel = 0;
            let response = saveApprovalMethod(
              CompanyId,
              minimumApprover,
              approvalLevel,
              isCompleted,
              isThereMasterApprover,
              approvalMethod,
              lastUpdated,
              isActive
            );
            return res.status(200).json({
              "message":"approval method created successfully",
              response

            });
          } else if (approvalMethod === "hierarchy") {
            minimumApprover = approvalLevel;
            let response = saveApprovalMethod(
              CompanyId,
              minimumApprover,
              approvalLevel,
              isCompleted,
              isThereMasterApprover,
              approvalMethod,
              lastUpdated,
              isActive
            ); 
            return res.status(200).json({
              "message":"approval method created successfully",
              response

            });
          } else {
            return res.json("please choose your approval method properly");
          }
        }
    }
  } catch (err) {
    console.log("first", err);
    res.status(500).json("Something gonna wrong");
  }
};
async function reSaveApprovalMethod(
  CompanyId,
  minimumApprover,
  approvalLevel,
  isCompleted,
  isThereMasterApprover,
  approvalMethod,
  lastUpdated,
  isActive,
  oldId
) {
  const appMethod = await ApprovalMethod.create({
    minimumApprover,
    approvalLevel,
    approvalMethod,
    isCompleted,
    isThereMasterApprover,
    lastUpdated,
    isActive
  });

  const company = await Company.findByPk(Number(CompanyId));

  if (company) {
    console.log("company");
    await appMethod.setCompany(CompanyId);
    
  } else {
    console.log("no such company");
    return "no such company";
  }
  const approver = await Approver.update({isActive:false},{
    where: {ApprovalMethodId:oldId}
  });
  const result = await ApprovalMethod.update({isActive:false}, {
    where: { id: oldId },
  });
  console.log(result);
  return {
    success: true,
    Message: "Successfully defined approvel method",
    created: appMethod,
  };
}
exports.reCreateApprovalMethod = async(req,res)=>{
  const CompanyId = req.user.id;
  let minimumApprover = req.body.minimumApprover;
  let approvalLevel = req.body.approvalLevel;
  const isCompleted = false;
  const isThereMasterApprover = req.body.isThereMasterApprover;
  const approvalMethod = req.body.approvalMethod;
  const lastUpdated = new Date();
  const isActive=true
  console.log("sent_for_recreation",CompanyId,minimumApprover,approvalLevel,isCompleted,isThereMasterApprover,approvalMethod,lastUpdated,isActive);
  const criteria={
    where: { CompanyId:CompanyId,isActive:true},
    
  }
  const CountOldApprovalMethod = await ApprovalMethod.count(criteria)
  console.log(CountOldApprovalMethod)
    if(CountOldApprovalMethod>=1){
      const activeMethod={
        where:{CompanyId:CompanyId,isActive:true},
      }
      const activeApprovalMethod =await ApprovalMethod.findOne(activeMethod) 

      console.log("latest one",activeApprovalMethod)
      //fetch each data required to set new approval method
      const oldId = activeApprovalMethod.id;
      const oldMinimumApprover = activeApprovalMethod.minimumApprover;
      const oldApprovalLevel = activeApprovalMethod.approvalLevel;
      const oldApprovalMethod = activeApprovalMethod.approvalMethod;
      const isOldThereMasterApprover =
        activeApprovalMethod.isThereMasterApprover;
      const isOldActive = activeApprovalMethod.isActive;                                                                                                                                     
      console.log(
        "active approval",
        oldApprovalLevel,
        oldApprovalMethod,
        oldId,
        oldMinimumApprover,
        isOldActive,
        isOldThereMasterApprover
      );
       // check type of new and old approval are the same
       if(approvalLevel>3){
        console.log("approval level can only be upto three")
        return res.json("approval level can only be upto three level")
       }else{

        if((oldApprovalMethod===approvalMethod&&oldMinimumApprover===minimumApprover&&isOldThereMasterApprover===isThereMasterApprover&&CompanyId===req.user.id)||
          (oldApprovalMethod===approvalMethod&&oldApprovalLevel===approvalLevel&&isOldThereMasterApprover===isThereMasterApprover&&CompanyId===req.user.id)){
            
            console.log("this is the same with your previous approval method",oldApprovalMethod,approvalMethod)
            return res.json({
              message:"this is the same with your previous approval method",
              oldApprovalMethod:oldApprovalMethod,
              approvalMethod:approvalMethod
            })
            
          }else{

            if(oldApprovalMethod==='horizontal' && approvalMethod==='horizontal'){
              approvalLevel = 0;
              let response = reSaveApprovalMethod(
                CompanyId,
                minimumApprover,
                approvalLevel,
                isCompleted,
                isThereMasterApprover,
                approvalMethod,
                lastUpdated,
                isActive,
                oldId
              );
              console.log(response);
              return res.json(response);
            }else if(oldApprovalMethod==='hierarchy' && approvalMethod==='hierarchy'){
              minimumApprover = approvalLevel;
              let response = reSaveApprovalMethod(
                CompanyId,
                minimumApprover,
                approvalLevel,
                isCompleted,
                isThereMasterApprover,
                approvalMethod,
                lastUpdated,
                isActive,
                oldId
              );
              console.log(response);
              return res.json(response);

            }else if((oldApprovalMethod==='horizontal' && approvalMethod==='hierarchy')||(oldApprovalMethod==='hierarchy' && approvalMethod==='horizontal')){
              if(oldApprovalMethod==='horizontal'  && approvalMethod==='hierarchy' )
              {
                minimumApprover = approvalLevel;
              let response = reSaveApprovalMethod(
                CompanyId,
                minimumApprover,
                approvalLevel,
                isCompleted,
                isThereMasterApprover,
                approvalMethod,
                lastUpdated,
                isActive,
                oldId
              );
              console.log(response);
              return res.json(response);

              }else if(oldApprovalMethod==='hierarchy' && approvalMethod==='horizontal'){
                console.log("old  one is hierarchy approval")
                approvalLevel = 0;
                let response = reSaveApprovalMethod(
                  CompanyId,
                  minimumApprover,
                  approvalLevel,
                  isCompleted,
                  isThereMasterApprover,
                  approvalMethod,
                  lastUpdated,
                  isActive,
                  oldId
                );
                return res.json(response);
              }else{
                console.log("undefined approval relationship")
                return res.json("undefined approval relationship");
              }
            }else{
              console.log("undefined approval method")
              return res.json("undefined approval method");
            }
          }
      }
    }else{
        console.log("define your  approval method first")
        return res.json("define your  approval method first");
    }

}


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
    const isActive = req.body.isActive;

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
    if(approvalMethod){
      updates.isActive=isActive;
    }
    
    if (appMethod) {
      const result = await ApprovalMethod.update({minimumApprover:minimumApprover,approvalLevel:approvalLevel,isCompleted:isCompleted,isThereMasterApprover:isThereMasterApprover,isActive:isActive}, {
        where: { id: id },
      });
      res.json({
        message: "success",
        appMethod,
      });
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
