/**
 * @swagger
 * components:
 *   schemas:
 *     CampaignParticipant:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         phoneNumber:
 *           type: string
 *           example: "1234567890"
 *         accountNumber:
 *           type: string
 *           example: "ACC123456"
 *         paymentMethod:
 *           type: string
 *           example: "ACCOUNTNUMBER"
 *         CampaignId:
 *           type: integer
 *           example: 3
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-01T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-01T10:00:00Z"
 *
 *   get:
 *     summary: Get all campaign participants
 *     tags:
 *       - CampaignParticipants
 *     responses:
 *       200:
 *         description: List of campaign participants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CampaignParticipant'
 *       500:
 *         description: Server error
 *
 * /api/participants/download-excel:
 *   get:
 *     summary: Download Excel template for campaign participants
 *     tags:
 *       - CampaignParticipants
 *     responses:
 *       200:
 *         description: Excel file downloaded successfully
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Error generating Excel file
 *
 * /api/participants/upload-excel:
 *   post:
 *     summary: Bulk register campaign participants from Excel
 *     tags:
 *       - CampaignParticipants
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               CampaignId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Bulk registration successful
 *       400:
 *         description: Bad request or invalid Excel
 *       500:
 *         description: Server error
 *
 * /api/participants/{id}:
 *   get:
 *     summary: Get participant by ID
 *     tags:
 *       - CampaignParticipants
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Participant details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CampaignParticipant'
 *       404:
 *         description: Participant not found
 *       500:
 *         description: Server error
 */
