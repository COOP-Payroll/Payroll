const DeductionDefinition = require('../models/deductionDefinition');
const Company = require('../models/company');
// Define controller methods for handling User requests for deduction definition 
exports.getAllDeductionDefinition = async (req, res) => {
    try {
        const deductionDefinitions = await DeductionDefinition.findAll();
        res.status(200).json({
            count: deductionDefinitions.length,
            deductionDefinitions
        });

    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }
};

exports.getDeductionDefinitionById = async (req, res) => {
    try {
        const { id } = req.params;
        const deductionDefinition = await DeductionDefinition.findByPk(id);
        res.json(deductionDefinition);
    } catch (er) {
        res.status(500).json('Something gonna wrong')
    }
};

exports.createDeductionDefinition = async (req, res, next) => {

    try {
        //insert required field
        const companyId = req.params.companyId;
       // const { name,startingAmount, ispercent} = req.body;
        console.log(Company)
        const name=req.body.name;
        const startingAmount=req.body.startingAmount;
        const  isPercent=req.body.isPercent;
        console.log(name,startingAmount,isPercent)
// save here const name = req.body.name;
        

        const deductionDefinition = await DeductionDefinition.create({
        name: name,
        startingAmount: startingAmount,
        isPercent: isPercent
        });

        const company = await Company.findByPk(companyId);
        if (company) {
        await deductionDefinition.setCompany(company);
        } else {
        // Handle the case where the company with the given ID is not found
        console.log("no company with this id")
        }

        res.status(200).json({
            message: 'Successfully Registered',
            deductionDefinition
        });
        //console.log(deductionDefinition)
    } catch (err) {
        res.status(500).json('Something gonna 1wrong')
    }
};
exports.updateDeductionDefinition = async (req, res, next) => {

    try {
        //insert required field
        const { name,startingAmount, ispercent } = req.body;
        const updates = {};
        const { id } = req.params;
        
        if (name) {
            updates.name = name;
        }
        if (startingAmount) {
            updates.startingAmount = startingAmount;
        }
        if (ispercent) {
            updates.ispercent = ispercent;
        }
       
      

        const result = await DeductionDefinition.update(updates, { where: { id: id } });

        res.status(200).json({
            message: "updated successfully"
        })
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.deleteDeductionDefinition = async (req, res, next) => {

    try {
        const { id } = req.params;

        const deductionDefinition = await DeductionDefinition.findOne({ where: { id: id } });
        if (deductionDefinition) {

            await DeductionDefinition.destroy({ where: { id } });
            res.status(200).json({ message: 'Deleted successfully' });
        }
        else {
            res.status(409).json({ message: 'There is no Deduction Definition with this ID' });
        }
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};
