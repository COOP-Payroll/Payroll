const EmployeePromotion = require('../models/employeePromotion');
const Employee = require('../models/employee');
const Grade = require('../models/grade')

const createPromotion = async (req, res) => {
  try {
    const { employeeId, position, salary, gradeId } = req.body;

    if (!employeeId || !position || !salary) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch existing promotions and set their 'active' attribute to false
    await EmployeePromotion.update({ active: false }, { where: { active: true, EmployeeId: employeeId } });

    // Create a new promotion with 'active' set to true
    const [promotion, employee, grade] = await Promise.all([
      EmployeePromotion.create({
        position,
        salary,
        grade: gradeId,
        active: true, // Set 'active' to true for new records
        EmployeeId: employeeId,
      }),
      Employee.findByPk(employeeId),
      Grade.findByPk(gradeId),
    ]);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (!grade) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    return res.status(201).json(promotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    return res.status(500).json({ error: 'An error occurred' });
  }
};


  
  const getEmployeePromotion = async (req, res) => {
    try {
      const employeeId = req.params.employeeId; // Assuming you're passing employeeId in the route parameters
  
      // Fetch promotions for the specified employee and include associated employee and grade data
      const promotions = await EmployeePromotion.findAll({
        where: { EmployeeId: employeeId },
      });
      
      return res.status(200).json(promotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      return res.status(500).json({ error: 'An error occurred' });
    }
  };

  const getActiveEmployeePromotion = async (req, res) => {
    try {
      const employeeId = req.params.employeeId; // Assuming you're passing employeeId in the route parameters
  
      // Fetch only active promotions for the specified employee and include associated employee and grade data
      const promotions = await EmployeePromotion.findAll({
        where: { EmployeeId: employeeId, active: true }, // Filter for active promotions
      });
  
      return res.status(200).json(promotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      return res.status(500).json({ error: 'An error occurred' });
    }
  };
  

  

module.exports = { createPromotion, getEmployeePromotion, getActiveEmployeePromotion };
