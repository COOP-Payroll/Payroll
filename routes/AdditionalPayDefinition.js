const express = require("express");
const additionPayDefinition = require("../controllers/AdditionalPayDefinition.js");
const middleware = require("../middleware/auth.js");
const router = express.Router();

/**
 * @swagger
 * /api/additionalPay:
 *   get:
 *     summary: Get all additional pay definitions for the company
 *     description: Fetches all additional pay definitions associated with the company.
 *     tags:
 *       - Additional Pay Definitions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully fetched all additional pay definitions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Number of additional pay definitions fetched.
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The additional pay definition ID.
 *                       name:
 *                         type: string
 *                         description: The name of the additional pay definition.
 *                       type:
 *                         type: string
 *                         description: The type of the additional pay definition.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/additionalPay/{id}:
 *   get:
 *     summary: Get an additional pay definition by ID
 *     description: Fetches a specific additional pay definition for the company based on the provided ID.
 *     tags:
 *       - Additional Pay Definitions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the additional pay definition to fetch.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully fetched the additional pay definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The additional pay definition ID.
 *                     name:
 *                       type: string
 *                       description: The name of the additional pay definition.
 *                     type:
 *                       type: string
 *                       description: The type of the additional pay definition.
 *       '404':
 *         description: Not Found - Additional pay definition not found with the given ID.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/additionalPay:
 *   post:
 *     summary: Create an additional pay definition
 *     description: Creates a new additional pay definition for the company.
 *     tags:
 *       - Additional Pay Definitions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the additional pay definition.
 *               type:
 *                 type: string
 *                 description: The type of the additional pay definition.
 *     responses:
 *       '200':
 *         description: Successfully created the additional pay definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The additional pay definition ID.
 *                     name:
 *                       type: string
 *                       description: The name of the additional pay definition.
 *                     type:
 *                       type: string
 *                       description: The type of the additional pay definition.
 *       '400':
 *         description: Bad Request - Invalid data or additional pay definition already exists.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/additionalPay/update/{id}:
 *   put:
 *     summary: Update an existing additional pay definition
 *     description: Updates an additional pay definition by ID.
 *     tags:
 *       - Additional Pay Definitions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the additional pay definition to update.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the additional pay definition.
 *               type:
 *                 type: string
 *                 description: The type of the additional pay definition.
 *     responses:
 *       '200':
 *         description: Successfully updated the additional pay definition.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The additional pay definition ID.
 *                     name:
 *                       type: string
 *                       description: The name of the additional pay definition.
 *                     type:
 *                       type: string
 *                       description: The type of the additional pay definition.
 *       '404':
 *         description: Not Found - Additional pay definition not found with the given ID.
 *       '400':
 *         description: Bad Request - Invalid data or duplicate resource.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/additionalPay/{id}:
 *   delete:
 *     summary: Delete an additional pay definition by ID
 *     description: Deletes an additional pay definition by the provided ID.
 *     tags:
 *       - Additional Pay Definitions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the additional pay definition to delete.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted the additional pay definition.
 *       '404':
 *         description: Not Found - Additional pay definition not found with the given ID.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - User does not have necessary permissions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

//get allowance defined by this company
router.get(
  "/:id",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  additionPayDefinition.getAdditionalPayDefinitionById
);

router.get(
  "/",
  middleware.protectAll,
  middleware.restrictTo("companyAdmin"),
  additionPayDefinition.getAllAdditionalPayDefinition
);

//allowance definition for this company
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  additionPayDefinition.createAdditionalPayDefinition
);

// update allowance definition
router.put(
  "/update/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  additionPayDefinition.updateAdditionalPayDefinition
);

// //delete allowance definition
router.delete(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictTo("companyAdmin"),
  additionPayDefinition.deleteAdditionalPayDefinition
);

module.exports = router;
