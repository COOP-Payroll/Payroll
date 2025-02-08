const express = require("express");
const middleware = require("../middleware/auth");
const Sponsors = require("../controllers/sponsorContollers.js");

const Position = require("../controllers/positionControllers.js");
const router = express.Router();
//
//get all grade of the same company

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/positions:
 *   post:
 *     summary: Create a new position
 *     description: Create a new position within the company.
 *     tags:
 *       - Positions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               positionName:
 *                 type: string
 *                 description: The name of the position.
 *               description:
 *                 type: string
 *                 description: A description of the position.
 *             required:
 *               - positionName
 *     responses:
 *       '201':
 *         description: Successfully created the position.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the created position.
 *                     positionName:
 *                       type: string
 *                       description: The name of the position.
 *                     description:
 *                       type: string
 *                       description: The description of the position.
 *       '400':
 *         description: Bad Request - Position name already exists or missing required fields.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to create a position.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 *
 *   get:
 *     summary: Get all positions
 *     description: Retrieve a list of all positions in the company.
 *     tags:
 *       - Positions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved list of positions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the position.
 *                   positionName:
 *                     type: string
 *                     description: The name of the position.
 *                   description:
 *                     type: string
 *                     description: The description of the position.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to access positions.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  Position.getAllpositions
);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/positions/{id}:
 *   get:
 *     summary: Get position by ID
 *     description: Retrieve a position by its ID.
 *     tags:
 *       - Positions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the position to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully retrieved the position.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the position.
 *                 positionName:
 *                   type: string
 *                   description: The name of the position.
 *                 description:
 *                   type: string
 *                   description: The description of the position.
 *       '404':
 *         description: Not Found - The position with the given ID does not exist.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to access the position.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.

 *   put:
 *     summary: Update position by ID
 *     description: Update the position details by its ID.
 *     tags:
 *       - Positions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the position to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               positionName:
 *                 type: string
 *                 description: The name of the position.
 *               description:
 *                 type: string
 *                 description: The description of the position.
 *     responses:
 *       '200':
 *         description: Successfully updated the position.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the position.
 *                 positionName:
 *                   type: string
 *                   description: The name of the position.
 *                 description:
 *                   type: string
 *                   description: The description of the position.
 *       '400':
 *         description: Bad Request - Invalid data provided.
 *       '404':
 *         description: Not Found - The position with the given ID does not exist.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to update the position.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.

 *   delete:
 *     summary: Delete position by ID
 *     description: Delete the position by its ID.
 *     tags:
 *       - Positions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the position to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully deleted the position.
 *       '404':
 *         description: Not Found - The position with the given ID does not exist.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to delete the position.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  Position.getOne
);
router.post(
  "/",
  middleware.validateUserAgent,
  middleware.protectAll,
  Position.createPositions
);

router.put(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  Position.updatePosition
);
router.delete(
  "/:id",
  middleware.validateUserAgent,
  middleware.protectAll,
  Position.deletePosition
);
module.exports = router;
