const express = require("express");
const router = express.Router();
const middleware = require("../middleware/auth.js");

const subscriptionController = require("../controllers/subscription.js");

// Define routes for handling User requests
router.get(
  "/",
  middleware.validateUserAgent,
  subscriptionController.getAllSubscription
);
/**
 * @swagger
 * /api/subscription/company:
 *   get:
 *     summary: Get company subscription
 *     description: Retrieve the subscription details of the authenticated user's company.
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the company subscription.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '404':
 *         description: Subscription not found.
 *       '500':
 *         description: Internal Server Error.
 */

router.get(
  "/company",

  middleware.protectAll,
  middleware.validateUserAgent,
  subscriptionController.getCompanySubscription
);
// router.post('/', subscriptionController.createPackage);
// router.delete('/:id', subscriptionController.deletePackage);
// router.put('/:id', subscriptionController.updatePackage);
// router.get('/:id', subscriptionController.getpackageById)

module.exports = router;
