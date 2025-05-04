// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     CampaignParticipant:
//  *       type: object
//  *       properties:
//  *         id:
//  *           type: integer
//  *           example: 1
//  *         fullName:
//  *           type: string
//  *           example: "John Doe"
//  *         phoneNumber:
//  *           type: string
//  *           example: "1234567890"
//  *         accountNumber:
//  *           type: string
//  *           example: "ACC123456"
//  *         paymentMethod:
//  *           type: string
//  *           example: "ACCOUNTNUMBER"
//  *         CampaignId:
//  *           type: integer
//  *           example: 3
//  *         createdAt:
//  *           type: string
//  *           format: date-time
//  *           example: "2025-05-01T10:00:00Z"
//  *         updatedAt:
//  *           type: string
//  *           format: date-time
//  *           example: "2025-05-01T10:00:00Z"
//  *
//  *   get:
//  *     summary: Get all campaign participants
//  *     tags:
//  *       - CampaignParticipants
//  *     responses:
//  *       200:
//  *         description: List of campaign participants
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/CampaignParticipant'
//  *       500:
//  *         description: Server error
//  *
//  * /api/participants/download-excel:
//  *   get:
//  *     summary: Download Excel template for campaign participants
//  *     tags:
//  *       - CampaignParticipants
//  *     responses:
//  *       200:
//  *         description: Excel file downloaded successfully
//  *         content:
//  *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
//  *             schema:
//  *               type: string
//  *               format: binary
//  *       500:
//  *         description: Error generating Excel file
//  *
//  * /api/participants/upload-excel:
//  *   post:
//  *     summary: Bulk register campaign participants from Excel
//  *     tags:
//  *       - CampaignParticipants
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               file:
//  *                 type: string
//  *                 format: binary
//  *               CampaignId:
//  *                 type: integer
//  *     responses:
//  *       200:
//  *         description: Bulk registration successful
//  *       400:
//  *         description: Bad request or invalid Excel
//  *       500:
//  *         description: Server error
//  *
//  * /api/participants/campaign/{campaignId}:
//  *   get:
//  *     summary: Get all participants for a specific campaign
//  *     tags:
//  *       - CampaignParticipants
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: campaignId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: ID of the campaign to filter participants
//  *     responses:
//  *       200:
//  *         description: List of participants for the given campaign
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/CampaignParticipant'
//  *       404:
//  *         description: Company not found
//  *       500:
//  *         description: Failed to fetch participants
//  */



/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 * /api/participants/download-excel:
 *   get:
 *     summary: Download Excel template for campaign participants
 *     tags:
 *       - CampaignParticipants
 *     security:
 *       - bearerAuth: []
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
 * /api/participants/campaign/{campaignId}:
 *   get:
 *     summary: Get all participants for a specific campaign
 *     tags:
 *       - CampaignParticipants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the campaign to filter participants
 *     responses:
 *       200:
 *         description: List of participants for the given campaign
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CampaignParticipant'
 *       404:
 *         description: Company not found
 *       500:
 *         description: Failed to fetch participants
 *   /api/participants/update:
 *   put:
 *     summary: Update a campaign participant
 *     tags:
 *       - CampaignParticipants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the campaign
 *       - in: query
 *         name: participantId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the participant to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               sex:
 *                 type: string
 *                 enum: [MALE, FEMALE]
 *                 example: MALE
 *               amount:
 *                 type: number
 *               age:
 *                 type: integer
 *               nationalId:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [PHONENUMBER, ACCOUNTNUMBER]
 *                 example: ACCOUNTNUMBER
 *               detail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Participant updated successfully
 *       400:
 *         description: Missing campaignId or participantId
 *       404:
 *         description: Campaign or participant not found
 *       500:
 *         description: Failed to update participant
 * /api/participants:
 *   delete:
 *     summary: Soft delete a campaign participant
 *     tags:
 *       - CampaignParticipants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the campaign
 *       - in: query
 *         name: participantId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the participant to delete
 *     responses:
 *       200:
 *         description: Participant deleted successfully
 *       400:
 *         description: Missing campaignId or participantId
 *       404:
 *         description: Participant not found
 *       500:
 *         description: Failed to delete participant
 * /api/participants/verify:
 *   put:
 *     summary: Verify a campaign participant
 *     tags:
 *       - CampaignParticipants
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the campaign
 *       - in: query
 *         name: participantId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the participant to verify
 *     responses:
 *       200:
 *         description: Participant verified successfully
 *       400:
 *         description: Bad request (Missing campaignId, participantId, or phone number invalid)
 *       404:
 *         description: Campaign or participant not found
 *       500:
 *         description: Failed to verify participant
 */
