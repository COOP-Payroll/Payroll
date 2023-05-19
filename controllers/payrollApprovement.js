const PayrollApprovement = require('../models/payrollApprovement');
const Payroll = require('../models/Payroll')
const Approver = require('../models/approver')

//reusable function for payroll approvement
async function handlePayrollApproval  (payrollId, approverId, level, status)  {
    try {
      const approve1 = new PayrollApproval({ 
        level,
        status,
      });
      const payroll = await Payroll.findById(payrollId);
      if (!payroll) {
        throw new Error("Payroll not found");
      }
      payroll.status = "pending";
      await payroll.save();
      await approve1.save();
      return "Payroll approved successfully";
    } catch (error) {
      console.log("An error occurred:", error.message);
      throw error;
    }
  };
  
// Create a new payrollApprovement

const createPayrollApprovement = async (req, res) => {
        // const payrollId = req.body.payrollId;
        // const approverId = req.body.approverId;
        // const level = 1;
        // const status = 'approved';
        console.log("approve PayrollApprovement")
    try {
        console.log("approve PayrollApprovement")
        const payrollApprovement = await PayrollApprovement.create(req.body);
        res.status(201).json(payrollApprovement);
        const result = await handlePayrollApproval(payrollId, approverId, level, status);
        console.log(result);
    } catch (error) {
        console.log("An error occurred:", error.message);
    }
};

// Get all payrollApprovements
const getAllPayrollApprovements = async (req, res) => {
    console.log("getall")
    const CompanyId= req.user.id;
    console.log(CompanyId);
    try {

        const payrollApprovements = await PayrollApprovement.findAll();

        res.json({
            count:payrollApprovements.length,
            payrollApprovements:payrollApprovements
        });
    } catch (error) {
        console.error('Error getting payrollApprovements:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a specific payrollApprovement by ID
const getPayrollApprovementById = async (req, res) => {
   console.log("get by id PayrollApprovement")
  const { id } = req.params;
  try {
    const payrollApprovement = await PayrollApprovement.findByPk(id);
    if (payrollApprovement) {
      res.json(payrollApprovement);
    } else {
      res.status(404).json({ error: 'PayrollApprovement not found' });
    }
  } catch (error) {
    console.error('Error getting payrollApprovement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a specific payrollApprovement by ID
const updatePayrollApprovement = async (req, res) => {
    console.log("update id PayrollApprovement")
  const { id } = req.params;
  try {
    const payrollApprovement = await PayrollApprovement.findByPk(id);
    if (payrollApprovement) {
      await payrollApprovement.update(req.body);
      res.json(payrollApprovement);
    } else {
      res.status(404).json({ error: 'PayrollApprovement not found' });
    }
  } catch (error) {
    console.error('Error updating payrollApprovement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a specific payrollApprovement by ID
const deletePayrollApprovement = async (req, res) => {
    console.log("delete id PayrollApprovement")
  const { id } = req.params;
  try {
    const payrollApprovement = await PayrollApprovement.findByPk(id);
    if (payrollApprovement) {
      await payrollApprovement.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'PayrollApprovement not found' });
    }
  } catch (error) {
    console.error('Error deleting payrollApprovement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createPayrollApprovement,
  getAllPayrollApprovements,
  getPayrollApprovementById,
  updatePayrollApprovement,
  deletePayrollApprovement,
};
