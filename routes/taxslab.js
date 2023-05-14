const express = require('express');
const router = express.Router();
const taxslabController = require('../controllers/taxslab.js')

// Define routes for handling User requests
router.get('/', taxslabController.getAllTaxslabs);
router.post('/', taxslabController.createTaxslab);
router.delete('/:id', taxslabController.deleteTaxslab);
router.put('/:id', taxslabController.updateTaxslab);
router.get('/:id', taxslabController.getTaxslabById)


module.exports = router;
