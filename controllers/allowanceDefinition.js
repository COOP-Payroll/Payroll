const AllowanceDefinition = require('../models/allowanceDefinition');
const Company = require('../models/company')
// Define controller methods for handling User requests
exports.getAllAllowanceDefinition = async (req, res) => {

    const Company = req.user.id;
    console.log(Company)
    try {
        
        const criteria={
            CompanyId: req.user.id
        }
        const allowanceDefinitions = await AllowanceDefinition.findAll(criteria);
        res.status(200).json({
            count: allowanceDefinitions.length,
            allowanceDefinitions
        });

    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.getAllowanceDefinitionById = async (req, res) => {
    try {
        const  {id}  = req.params;
        const allowanceDefinition = await AllowanceDefinition.findByPk(id);
        res.json(allowanceDefinition);
    } catch (er) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.createAllowanceDefinition = async (req, res, next) => {

    try {
        //insert required field
        const Company= req.user.id;
        console.log(Company)
        const { name,isTaxable,isExempted,exemptedAmount,startingAmount } = req.body;

        const allowanceDefinition = await AllowanceDefinition.create({ name,isTaxable,isExempted,exemptedAmount,startingAmount});
                                    await allowanceDefinition.setCompany(Company);
        res.status(200).json({
            message: 'Successfully Registered',
            allowanceDefinition
        });
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }
};
exports.updateAllowanceDefinition = async (req, res, next) => {

    try {
        //insert required field
        const { name,isTaxable,isExempted,exemptedAmount,startingAmount } = req.body;
        const updates = {};
        const { id } = req.params;
        
        if (name) {
            updates.name = name;
        }
        if (isTaxable) {
            updates.isTaxable = isTaxable;
        }
        if (isExempted) {
            updates.isExempted = isExempted;
        }
        if (exemptedAmount) {
            updates.exemptedAmount = exemptedAmount;
        }
        if (startingAmount) {
            updates.startingAmount = startingAmount;
        }
      

        const result = await AllowanceDefinition.update(updates, { where: { id: id } });

        res.status(200).json({
            message: "updated successfully"
        })

    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};

exports.deleteAllowanceDefinition = async (req, res, next) => {

    try {
        const { id } = req.params;

        const allowanceDefinition = await AllowanceDefinition.findOne({ where: { id: id } });
        if (allowanceDefinition) {

            await allowanceDefinition.destroy({ where: { id } });
            res.status(200).json({ message: 'Deleted successfully' });
        }
        else {
            res.status(409).json({ message: 'There is no AllowanceDefinition with this ID' });
        }
    } catch (err) {
        res.status(500).json('Something gonna wrong')
    }

};



//name,isTaxable,isExempted,exemptedAmount,startingAmount