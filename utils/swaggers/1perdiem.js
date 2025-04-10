/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     PerDiemRate:
 *       type: object
 *       required:
 *         - dailyRate
 *       properties:
 *         dailyRate:
 *           type: number
 *           format: float
 *           example: 150.50
 *           description: The daily rate for per diem.
 *         isActive:
 *           type: boolean
 *           example: true
 *           description: Whether the rate is currently active.

 * /api/dailyrate:
 *   get:
 *     summary: Get the active per diem rate for the company
 *     tags:
 *       - Per Diem Rate
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the per diem rate.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/PerDiemRate'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       503:
 *         description: Server error

 *   post:
 *     summary: Create a per diem rate for a company
 *     tags:
 *       - Per Diem Rate
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerDiemRate'
 *     responses:
 *       201:
 *         description: Per diem rate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PerDiemRate'
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Rate already exists
 *       503:
 *         description: Server error

 * /api/dailyrate/{id}:
 *   get:
 *     summary: Get a per diem rate by ID
 *     tags:
 *       - Per Diem Rate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Per diem rate ID
 *     responses:
 *       200:
 *         description: Per diem rate found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerDiemRate'
 *       404:
 *         description: Per diem rate not found
 *       503:
 *         description: Server error

 *   put:
 *     summary: Update per diem rate (creates new version)
 *     tags:
 *       - Per Diem Rate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the per diem rate to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dailyRate:
 *                 type: number
 *                 format: float
 *                 example: 175.00
 *     responses:
 *       200:
 *         description: Per diem rate updated successfully (new version created)
 *       404:
 *         description: Per diem rate not found
 *       503:
 *         description: Server error

 *   delete:
 *     summary: Soft delete per diem rate (marks it as inactive)
 *     tags:
 *       - Per Diem Rate
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the per diem rate to delete
 *     responses:
 *       200:
 *         description: Per diem rate marked as inactive
 *       404:
 *         description: Per diem rate not found
 *       503:
 *         description: Server error
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */




