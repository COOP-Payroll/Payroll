const Deduction = require('../models/deduction');

// Define controller methods for handling User requests for deduction definition 
exports.getAllDeduction = async (req, res) => {
    try {
        const deductions = await Deduction.findAll();
        res.status(200).json({
            count: deductions.length,
            deductions
        });

    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }
};

exports.getDeductionById = async (req, res) => {
    try {
        const { id } = req.params;
        const deduction = await Deduction.findByPk(id);
        res.json(deduction);
    } catch (er) {
        res.status(500).json('Something gonna wrong')
    }
};

exports.createDeduction = async (req, res, next) => {

    try {
        //insert required field
        const { amount} = req.body;
        const gradeId  = req.params.gradeId;
        const deductionDefinitionId =  req.params.definitionId;

        const deduction = await Deduction.create({ amount});
                          await deduction.setGrade(gradeId);
                          await deduction.setDeductionDefinition(deductionDefinitionId);
                        
        res.status(200).json({
            message: 'Successfully Registered',
            deduction
        });
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }
};
exports.updateDeduction = async (req, res, next) => {

    try {
        //insert required field
        const { amount } = req.body;
        const updates = {};
        const { id } = req.params;
        
        if (amount) {
            updates.amount = amount;
        }
        

        const result = await Deduction.update(updates, { where: { id: id } });

        res.status(200).json({
            message: "updated successfully"
        })
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};
exports.deleteDeduction = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deduction = await Deduction.findOne({ where: { id: id } });
        if (deduction) {
            await Deduction.destroy({ where: { id } });
            res.status(200).json({ message: 'Deleted successfully' });
        }
        else {
            res.status(409).json({ message: 'There is no Deduction Definition with this ID' });
        }
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};
