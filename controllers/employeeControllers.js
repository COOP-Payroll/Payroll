const Employee = require('../models/employee.js');

// Define controller methods for handling User requests
exports.getAllEmployee = async (req, res) => {
    try {
        const Employees = await Employee.findAll();
        res.status(200).json({
            count: Employees.length,
            Employees
        });

    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const Employee = await Employee.findByPk(id);
        res.json({ Employee });
    } catch (er) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.createEmployee = async (req, res, next) => {

    try {

        const { deptName, location, shorthandRepresentation } = req.body;

        const Employees = await Employee.create({ deptName, location, shorthandRepresentation });
        res.status(200).json({
            message: 'Successfully Registered',
            Employees
        });
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.updateEmployee = async (req, res, next) => {


    try {

        const { deptName, location, shorthandRepresentation } = req.body;
        const updates = {};
        const { id } = req.params;

        if (deptName) {
            updates.deptName = deptName;
        }
        if (location) {
            updates.location = location;
        }
        if (shorthandRepresentation) {
            updates.shorthandRepresentation = shorthandRepresentation;
        }


        const result = await Employee.update(updates, { where: { id: id } });

        res.status(200).json({
            message: "updated successfully"
        })

    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.deleteEmployee = async (req, res, next) => {

    try {
        const { id } = req.params;

        const Employee = await Employee.findOne({ where: { id: id } });
        if (Employee) {

            await Employee.destroy({ where: { id } });
            res.status(200).json({ message: 'Employee deleted successfully' });
        }
        else {
            res.status(409).json({ message: 'There is no Employee with this ID' });
        }
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};
