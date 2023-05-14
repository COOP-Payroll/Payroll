const express = require('express');
const router = express.Router();

const packageController=require('../controllers/package.js')

// Define routes for handling User requests
router.get('/', packageController.getAllPackages);
router.post('/',packageController.createPackage);
router.delete('/:id',packageController.deletePackage);
router.put('/:id',packageController.updatePackage);
router.get('/:id',packageController.getpackageById)


module.exports = router;
