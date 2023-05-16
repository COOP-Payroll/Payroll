const express = require("express");
const router = express.Router();

const subscriptionController = require("../controllers/subscription.js");

// Define routes for handling User requests
router.get("/", subscriptionController.getAllSubscription);
// router.post('/', subscriptionController.createPackage);
// router.delete('/:id', subscriptionController.deletePackage);
// router.put('/:id', subscriptionController.updatePackage);
// router.get('/:id', subscriptionController.getpackageById)

module.exports = router;
