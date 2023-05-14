const Department = require('../models/department.js');

// Define controller methods for handling User requests
exports.getAllDepartment = async (req, res) => {
    try {
        const departments = await Department.findAll();
        res.status(200).json({
            count: departments.length,
            departments
        });

    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await Department.findByPk(id);
        res.json({department});
    } catch (er) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.createDepartment = async (req, res, next) => {

    try {

        const { deptName, location, shorthandRepresentation } = req.body;

        const departments = await Department.create({ deptName, location, shorthandRepresentation });
        res.status(200).json({
            message: 'Successfully Registered',
            departments
        });
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.updateDepartment = async (req, res, next) => {


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
        

        const result = await Department.update(updates, { where: { id: id } });

        res.status(200).json({
            message: "updated successfully"
        })

    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.deleteDepartment = async (req, res, next) => {

    try {
        const { id } = req.params;

        const department = await Department.findOne({ where: { id: id } });
        if (department) {

            await Department.destroy({ where: { id } });
            res.status(200).json({ message: 'Department deleted successfully' });
        }
        else {
            res.status(409).json({ message: 'There is no Department with this ID' });
        }
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};
