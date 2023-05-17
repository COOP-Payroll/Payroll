const Grade = require('../models/grade');
const Company = require('../models/company');
// Define controller methods for handling User requests

exports.getAllGrade = async (req, res) => {
    try {
        const grades = await Grade.findAll();
        res.status(200).json({
            count: grades.length,
            grades
        });

    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.getGradeById = async (req, res) => {
    try {
        const { id } = req.params;
        const grade = await Grade.findByPk(id);
        res.json(grade);
    } catch (er) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.createGrade = async (req, res, next) => {

    try {
        //insert required field
       // console.log(req.params.companyId)
        const { name, minSalary,maxSalary } = req.body;
        const companyId = req.params.companyId;
        console.log(companyId)

        const grade = await Grade.create({ name, minSalary,maxSalary });
                       await grade.setCompany(companyId)
        
        res.status(200).json({
            message: 'Successfully Registered',
            grade
        });
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.updateGrade = async (req, res, next) => {


    try {
        //insert required field
        const { name, minSalary, maxSalary } = req.body;
        const updates = {};
        const { id } = req.params;

        if (name) {
            updates.name = name;
        }
        if (minSalary) {
            updates.minSalary = minSalary;
        }
        if (maxSalary) {
            updates.maxSalary = maxSalary;
        }
      

        const result = await Grade.update(updates, { where: { id: id } });

        res.status(200).json({
            message: "updated successfully"
        })

    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.deleteGrade = async (req, res, next) => {

    try {
        const { id } = req.params;

        const grade = await Grade.findOne({ where: { id: id } });
        if (grade) {

            await grade.destroy({ where: { id } });
            res.status(200).json({ message: 'Deleted successfully' });
        }
        else {
            res.status(409).json({ message: 'There is no grade with this ID' });
        }
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};
