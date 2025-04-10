/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     PerDiem:
 *       type: object
 *       required:
 *         - numberofDays
 *         - employeeId
 *       properties:
 *         numberofDays:
 *           type: integer
 *           example: 5
 *           description: The number of days for the per diem.
 *         status:
 *           type: string
 *           example: "processed"
 *           description: The status of the per diem.
 *         isActive:
 *           type: boolean
 *           example: true
 *           description: Whether the per diem is currently active.
 *         employeeId:
 *           type: integer
 *           example: 1
 *           description: The ID of the employee the per diem is assigned to.
 *         CompanyId:
 *           type: integer
 *           example: 1
 *           description: The ID of the company the per diem belongs to.
 *         PayrollDefinitionId:
 *           type: integer
 *           example: 2
 *           description: The ID of the payroll definition associated with this per diem.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-04-07T08:00:00Z"
 *           description: The timestamp when the per diem record was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-04-07T08:00:00Z"
 *           description: The timestamp when the per diem record was last updated.
 * /api/perdiem:
 *   get:
 *     summary: Get all per diem records for the company
 *     tags:
 *       - Per Diem
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all per diem records.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 10
 *                   description: The total number of per diem records.
 *                 message:
 *                   type: string
 *                   example: "Data fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PerDiem'
 *   post:
 *     summary: Create a new per diem record
 *     tags:
 *       - Per Diem
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerDiem'
 *     responses:
 *       201:
 *         description: Successfully created a new per diem record.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerDiem'
 * /api/perdiem/currentmonth:
 *   get:
 *     summary: Get per diem records for the current month
 *     tags:
 *       - Per Diem
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved per diem records for the current month.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 5
 *                   description: The total number of per diem records for the current month.
 *                 message:
 *                   type: string
 *                   example: "Data fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PerDiem'
 * /api/perdiem/currentyear:
 *   get:
 *     summary: Get per diem records for the current year
 *     tags:
 *       - Per Diem
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved per diem records for the current year.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 12
 *                   description: The total number of per diem records for the current year.
 *                 message:
 *                   type: string
 *                   example: "Data fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PerDiem'
 * /api/perdiem/{id}:
 *   get:
 *     summary: Get per diem record by ID
 *     tags:
 *       - Per Diem
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the per diem record.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved per diem record by ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerDiem'
 *       404:
 *         description: Per diem record not found.
 *   put:
 *     summary: Update a per diem record by ID
 *     tags:
 *       - Per Diem
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the per diem record to be updated.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PerDiem'
 *     responses:
 *       200:
 *         description: Successfully updated the per diem record.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PerDiem'
 *       400:
 *         description: The per diem record cannot be updated because the status is not 'processed'.
 *       404:
 *         description: Per diem record not found.
 *   delete:
 *     summary: Delete a per diem record by ID (soft delete if processed)
 *     tags:
 *       - Per Diem
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the per diem record to be deleted.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted the per diem record.
 *       400:
 *         description: The per diem record cannot be deleted because the status is not 'processed'.
 *       404:
 *         description: Per diem record not found.
 */
