const express = require('express');
const router = express.Router();
const pensionController = require('../controllers/pension.js')

// Define routes for handling User requests
router.get('/', pensionController.getAllPension);
router.post('/', pensionController.createPension);
router.delete('/:id', pensionController.deletePension);
router.put('/:id', pensionController.updatePension);
router.get('/:id', pensionController.getpensionById)


module.exports = router;
