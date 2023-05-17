const Company = require("../models/company.js");
const Subscription = require("../models/subscription.js");

// Define controller methods for handling User requests
exports.getAllSubscription = async (req, res) => {
  try {
    const packages = await Subscription.findAll({
      include: [Company],
    });
    return res.status(200).json({
      count: packages.length,
      packages,
    });
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
  }
};

// exports.getpackageById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const package = await Package.findByPk(id);
//         res.json(package);
//     } catch (er) {
//         res.status(500).json('Something gonna wrong')
//     }

// };

// exports.createPackage = async (req, res, next) => {

//     try {

//         const { packageName, min_employee, max_employee, price, service, discount } = req.body;

//         const packages = await Package.create({ packageName, price, max_employee, min_employee, service, discount });
//         res.status(200).json({
//             message: 'Successfully Registered',
//             packages
//         });
//     } catch (err) {
//         res.status(500).json('Something gonna wrong')
//     }

// };

// exports.updatePackage = async (req, res, next) => {

//     try {

//         const { packageName, min_employee, max_employee, price, service, discount } = req.body;
//         const updates = {};
//         const { id } = req.params;

//         if (packageName) {
//             updates.packageName = packageName;
//         }
//         if (min_employee) {
//             updates.min_employee = min_employee;
//         }
//         if (max_employee) {
//             updates.max_employee = max_employee;
//         }
//         if (price) {
//             updates.price = price;
//         }
//         if (service) {
//             updates.service = service;
//         }
//         if (discount) {
//             updates.discount = discount;
//         }

//         const result = await Package.update(updates, { where: { id: id } });

//         res.status(200).json({
//             message: "updated successfully"
//         })

//     } catch (err) {
//         res.status(500).json('Something gonna wrong')
//     }

// };

// exports.deletePackage = async (req, res, next) => {

//     try {
//         const { id } = req.params;

//         const package = await Package.findOne({ where: { id: id } });
//         if (package) {

//             await Package.destroy({ where: { id } });
//             res.status(200).json({ message: 'package deleted successfully' });
//         }
//         else {
//             res.status(409).json({ message: 'There is no package with this ID' });
//         }
//     } catch (err) {
//         res.status(500).json('Something gonna wrong')
//     }

// };
