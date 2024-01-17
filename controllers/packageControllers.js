const Package = require("../models/packages.js");
const Service = require("../models/services.js");
const sequelize = require('../database/db.js')
const createError = require('.././utils/error.js');

const successResponse = require('.././utils/successResponse.js')

// Define controller methods for handling User requests
exports.getAllPackages = async (req, res, next) => {
  try {
    const packages = await Package.findAll(
      {
        include: [
          {
            model: Service,
            attributes: {
              exclude: ['createdAt', 'updatedAt', "PackageId"],
            },
          },
        ],
      }
    );

    return res.status(200).json({
      success: true,
      message: "Data Found",
      data:  packages 
      ,
    });
  }
  catch (error) {
    console.log(error);
    return next(createError.createError(500, "Internal server Error"));

  }
};

exports.getMonthlyPackages = async (req, res, next) => {
  try {

    const monthlyPackages = await Package.findAll(
      { where: { packageType: "Monthly" } ,
      
        include: [
          {
            model: Service,
            attributes: {
              exclude: ['createdAt', 'updatedAt', "PackageId"],
            },
          },
        ],
      }
    );

 

    res.status(200).json({
      count: monthlyPackages.length
      , monthlyPackages
    }

    );


  } catch (error) {
    console.log(error);
    return next(createError.createError(500, "Internal server Error"));
  }

}


exports.getYearlyPackages = async (req, res, next) => {
  try {
   
    const yearlyPackages = await Package.findAll(
      { where: { packageType: "Yearly" } ,
      
        include: [
          {
            model: Service,
            attributes: {
              exclude: ['createdAt', 'updatedAt', "PackageId"],
            },
          },
        ],
      }
    );
    res.status(200).json({
      count: yearlyPackages.length
      , yearlyPackages
    }

    );


  } catch (error) {
    console.log(error);
    return next(createError.createError(500, "Internal server Error"));
  }

}

exports.getpackageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const package = await Package.findByPk(id,
      {
        include: [
          {
            model: Service,
            attributes: {
              exclude: ['createdAt', 'updatedAt', "PackageId"],
            },
          },
        ],
      });
    if (!package) {
      return next(createError.createError(404, "Package not found"));
    }
    else {
      return res.status(200).json({
        success: true,
        message: "Data found",
        data: { package }
      });
    }
  } catch (error) {
    return next(createError.createError(500, "Internal server Error"));
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


    // console.log("service data:", service.length)
    const existingPackage = await Package.findOne({
      where: {
        packageType: packageType,
        packageName: packageName,
        max_employee: max_employee,
        min_employee: min_employee,
        price: price,
      },
    });

    if (existingPackage) {
      return next(createError.createError(409, "Package already exists"));
    } else {
      const packages = await Package.create({
        packageType,
        packageName,
        price,
        max_employee,
        min_employee,
        discount,
        isTrial,
      });
      console.log(packages.length);
      if (packages) {

        const services = Service.bulkCreate(service).then(
          (createdService) => {
            packages.setServices(createdService);
          }
        );

        return res.status(200).json({
          success: true,
          message: "Successfully Registered",
          data: { packages },
        });

      }

    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};


exports.updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const packages = await Package.findByPk(id, { include: Service });

    if (!packages) {
      return next(createError.createError(404, "Package not found"));
    }

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
    if (discount) {
      updates.discount = discount;
    }
    if (isTrial) {
      updates.isTrial = isTrial;
    }

    const updatedPackage = await packages.update(updates);

    // Handle services
    if (service) {
      // Create new services
      const createdServices = await Service.bulkCreate(service);

      // Add new services to the existing ones
      await packages.addServices(createdServices);
    }

    return res.status(200).json({
      success: true,
      message: "Updated successfully",
      data:  updatedPackage ,
    });
  } catch (err) {
    console.error(err);
    return next(createError.createError(500, "Internal Server Error"));
  }
};


exports.updateService= async(req,res,next) => 
{
  try {
    const { packageId,serviceId } = req.params;
    const {serviceName}=req.body;

    const existingServices = await Service.findOne({where:{
      id:serviceId,
      PackageInfoId:packageId
    }});
    if(!existingServices){
      return next(createError.createError(404,"Service not found"));
    }

     const updatedServices = await existingServices.update({serviceName:serviceName});
     res.status(200).json({
      success:true,
      message:"updated successfully"
     });
    
  } catch (error) {``
    console.log(error);
    return next(createError.createError(500, "Internal Server Error"));
  }
};

exports.deleteService= async(req,res,next) => 
{
  try {
    const { packageId,serviceId } = req.params;
    const {serviceName}=req.body;

    const existingServices = await Service.findOne({where:{
      id:serviceId,
      PackageInfoId:packageId
    }});
    if(!existingServices){
      return next(createError.createError(404,"Service not found"));
    }

     const updatedServices = await existingServices.destroy();
     res.status(200).json({
      success:true,
      message:"Deleted successfully"
     });
    
  } catch (error) {``
    console.log(error);
    return next(createError.createError(500, "Internal Server Error"));
  }
};

// exports.updatePackage = async (req, res, next) => {
//   try {

//     const { id } = req.params;

//     const packages=await Package.findByPk(id);
//     if(!packages){
//       return next(createError.createError(404,"Package not found"))
//     }
//     const {
//       packageType,
//       packageName,
//       min_employee,
//       max_employee,
//       price,
//       service,
//       discount,
//       isTrial,
//     } = req.body;
//     const updates = {};
 

//     if (packageName) {
//       updates.packageName = packageName;
//     }
//     if (min_employee) {
//       updates.min_employee = min_employee;
//     }
//     if (max_employee) {
//       updates.max_employee = max_employee;
//     }
//     if (price) {
//       updates.price = price;
//     }
//     if (discount) {
//       updates.discount = discount;
//     }
//     if (isTrial) {
//       updates.isTrial = isTrial;
//     }
    
//     if(service){
//       const services = Service.bulkCreate(service).then(
//         (createdService) => {
//           packages.setServices(createdService);
//         }
//       );

//     }
//     const updatedPackage = await Package.update(updates, { where: { id: id } });

//     return res.status(200).json({
//       success: true,
//       message: "updated successfully",
//       data: { updatedPackage }
//     });
//   } catch (err) {
//     return next(createError.createError(500, "Internal Server Error"));

//   }
// };

exports.deletePackage = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {

    const { id } = req.params;

    const packageInstance = await Package.findByPk(id, { include: Service });
    if (!packageInstance) {
      return res
        .status(409)
        .json({ message: "There is no package with this ID" });

    } else {
      console.log(packageInstance)
      // Delete associated services
      const serviceIds = Array.isArray(packageInstance.services)
        ? packageInstance.services.map(service => service.id)
        : [];

      // Delete associated services
      if (serviceIds.length > 0) {
        await Service.destroy({ where: { id: serviceIds }, transaction: t });
      }

      // Delete the package
      await packageInstance.destroy({ transaction: t });

      await t.commit();

      res.json({
        success: true,
        message: 'Package and associated services deleted successfully',
        data: packageInstance 
      });
    }
  } catch (error) {

    await t.rollback();
    console.log(error);
    return next(createError.createError(500, "Internal Server Error "));

  }
};
