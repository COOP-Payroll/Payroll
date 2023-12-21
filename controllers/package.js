const Package = require("../models/package.js");

// Define controller methods for handling User requests
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.findAll();

    return res.status(200).json({
      count: packages.length,
      packages,
    });
  } 
  catch (error) {
   next(error);
  }
};


exports.getMonthlyPackages = async (req, res,next) => {
try {
   const monthlyPackages=await Package.findAll({where:{packageType:"Monthly"}});

   res.status(200).json({count: monthlyPackages.length
  ,monthlyPackages
  }
    
    );

  
} catch (error) {
  console.log(error);
  next(error);
}

}



exports.getYearlyPackages = async (req, res,next) => {
  try {
     const yearlyPackages=await Package.findAll({where:{packageType:"Yearly"}});
  
     res.status(200).json({count: yearlyPackages.length
    ,yearlyPackages
    }
      
      );
  
    
  } catch (error) {
    console.log(error);
    next(error);
  }
  
  }

exports.getpackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const package = await Package.findByPk(id);
    return res.json(package);
  } catch (error) {
    next(error);
  }
};

exports.createPackage = async (req, res, next) => {
  try {
    
    const {
      packageType,
      packageName,
      min_employee,
      max_employee,
      price,
      service,
      discount,
      isTrial,
    } = req.body;

    const existingPackage = await Package.findOne({
      where: {
        packageType:packageType,
        packageName: packageName,
        max_employee: max_employee,
        min_employee: min_employee,
        price: price,
      },
    });

    if (existingPackage) {
      return res.status(409).json({
        message: "Package already created ",
      });
    } else {
      const packages = await Package.create({
        packageType,
        packageName,
        price,
        max_employee,
        min_employee,
        service,
        discount,
        isTrial,
      });

  
      return res.status(200).json({
        message: "Successfully Registered",
        packages,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.updatePackage = async (req, res, next) => {
  try {
    const {
      packageType,
      packageName,
      min_employee,
      max_employee,
      price,
      service,
      discount,
      isTrial,
    } = req.body;
    const updates = {};
    const { id } = req.params;

    if (packageName) {
      updates.packageName = packageName;
    }
    if (min_employee) {
      updates.min_employee = min_employee;
    }
    if (max_employee) {
      updates.max_employee = max_employee;
    }
    if (price) {
      updates.price = price;
    }
    if (service) {
      updates.service = service;
    }
    if (discount) {
      updates.discount = discount;
    }
    if (isTrial) {
      updates.isTrial = isTrial;
    }

    const result = await Package.update(updates, { where: { id: id } });

    return res.status(200).json({
      message: "updated successfully",
    });
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
  }
};

exports.deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const package = await Package.findOne({ where: { id: id } });
    if (package) {
      await Package.destroy({ where: { id } });
      return res.status(200).json({ message: "package deleted successfully" });
    } else {
      return res
        .status(409)
        .json({ message: "There is no package with this ID" });
    }
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
  }
};
