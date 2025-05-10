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
 * /api/participants/{campaignId}/assignParticipants:
 * post:
 *    summary: add all participants to a campaign
 *    tags:
 *      - CampaignParticipants
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
 *   post:
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
 * /api/participants/update:
 *   post:
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
 */

/**
 * @swagger
 * /api/getAllParticipantsPublished:
 *   get:
 *     summary: Get all published participants for a campaign
 *     description: Retrieves all participants who have been published for a specific campaign, including participant and location details.
 *     tags: [CampaignParticipants]
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         required: true
 *         description: The ID of the campaign.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: regionId
 *         required: false
 *         description: The region ID for filtering.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: zoneId
 *         required: false
 *         description: The zone ID for filtering.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: woredaId
 *         required: false
 *         description: The woreda ID for filtering.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of participants who have been published
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       amount:
 *                         type: number
 *                       status:
 *                         type: string
 *                       paymentStatus:
 *                         type: string
 *                       approvalStatus:
 *                         type: string
 *                       isPublished:
 *                         type: boolean
 *                       isActive:
 *                         type: boolean
 *                       regionId:
 *                         type: integer
 *                       zoneId:
 *                         type: integer
 *                       woredaId:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       ParticipantId:
 *                         type: integer
 *                       CampaignId:
 *                         type: integer
 *                       Participant:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           fullName:
 *                             type: string
 *                           sex:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           age:
 *                             type: integer
 *                           nationalId:
 *                             type: string
 *                           address:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                           accountNumber:
 *                             type: string
 *                           paymentMethod:
 *                             type: string
 *                           detail:
 *                             type: string
 *                           isVerified:
 *                             type: boolean
 *                           status:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           regionId:
 *                             type: integer
 *                           zoneId:
 *                             type: integer
 *                           woredaId:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       Region:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           code:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       Zone:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           RegionId:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       Woreda:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           ZoneId:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Missing or invalid campaignId
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/getAllParticipantsApproved:
 *   get:
 *     summary: Get all participants with 'APPROVED' status for a campaign
 *     description: Retrieves all participants who have an 'APPROVED' status for a specific campaign. Optionally filters by zone or woreda. Authorization is required.
 *     tags: [CampaignParticipants]
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         required: true
 *         description: The ID of the campaign.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: zoneId
 *         required: false
 *         description: Optional zone ID for filtering.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: woredaId
 *         required: false
 *         description: Optional woreda ID for filtering.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of participants with 'APPROVED' status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       amount:
 *                         type: number
 *                       status:
 *                         type: string
 *                       paymentStatus:
 *                         type: string
 *                       approvalStatus:
 *                         type: string
 *                       isPublished:
 *                         type: boolean
 *                       isActive:
 *                         type: boolean
 *                       regionId:
 *                         type: integer
 *                       zoneId:
 *                         type: integer
 *                       woredaId:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       ParticipantId:
 *                         type: integer
 *                       CampaignId:
 *                         type: integer
 *                       Participant:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           fullName:
 *                             type: string
 *                           sex:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           age:
 *                             type: integer
 *                           nationalId:
 *                             type: string
 *                           address:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                           accountNumber:
 *                             type: string
 *                           paymentMethod:
 *                             type: string
 *                           detail:
 *                             type: string
 *                           isVerified:
 *                             type: boolean
 *                           status:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           regionId:
 *                             type: integer
 *                           zoneId:
 *                             type: integer
 *                           woredaId:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       Region:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           code:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       Zone:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           RegionId:
 *                             type: integer
 *                       Woreda:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           ZoneId:
 *                             type: integer
 *       400:
 *         description: Missing or invalid campaignId
 *       403:
 *         description: Unauthorized to view participants outside assigned zone or woreda
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/assignParticipants:
 *   post:
 *     summary: Assign participants to a campaign
 *     tags: [CampaignParticipants]
 *     description: Assigns participants with amounts to a specific campaign using the logged-in user's company region/zone/woreda.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the campaign to assign participants to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assignmentsData:
 *                 type: array
 *                 description: List of participant assignments
 *                 items:
 *                   type: object
 *                   required:
 *                     - participantId
 *                     - amount
 *                   properties:
 *                     participantId:
 *                       type: integer
 *                       example: 1
 *                     amount:
 *                       type: number
 *                       example: 150.5
 *     responses:
 *       200:
 *         description: Participants assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Participants assigned successfully
 *       400:
 *         description: Invalid request (e.g., empty array or campaign not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Request body must be a non-empty array.
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Company not found
 *       503:
 *         description: Server error while assigning participants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to assign participants
 */

/**
 * @swagger
 * /api/getAssignedParticipants:
 *   get:
 *     summary: Get assigned participants for a campaign
 *     tags: [CampaignParticipants]
 *     description: Retrieves participants assigned to the specified campaign, including their details and assigned Region, Zone, and Woreda.
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the campaign
 *     responses:
 *       200:
 *         description: A list of assigned participants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       amount:
 *                         type: number
 *                       status:
 *                         type: string
 *                       paymentStatus:
 *                         type: string
 *                       approvalStatus:
 *                         type: string
 *                       isPublished:
 *                         type: boolean
 *                       isActive:
 *                         type: boolean
 *                       regionId:
 *                         type: integer
 *                       zoneId:
 *                         type: integer
 *                         nullable: true
 *                       woredaId:
 *                         type: integer
 *                         nullable: true
 *                       ParticipantId:
 *                         type: integer
 *                       CampaignId:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       Participant:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           fullName:
 *                             type: string
 *                           sex:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           age:
 *                             type: integer
 *                           nationalId:
 *                             type: string
 *                           address:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phoneNumber:
 *                             type: string
 *                           accountNumber:
 *                             type: string
 *                           paymentMethod:
 *                             type: string
 *                           detail:
 *                             type: string
 *                           isVerified:
 *                             type: boolean
 *                           status:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           regionId:
 *                             type: integer
 *                           zoneId:
 *                             type: integer
 *                             nullable: true
 *                           woredaId:
 *                             type: integer
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       Region:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           code:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       Zone:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           RegionId:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       Woreda:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           ZoneId:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Campaign ID is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Provide campaign ID
 *       503:
 *         description: Failed to fetch assigned participants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch assigned participants
 */

/**
 * @swagger
 * /api/approval-status:
 *   post:
 *     summary: Update approval status of participants in a campaign
 *     description: Allows the update of approval status (PENDING, APPROVED, REJECTED) for participants in a specific campaign.
 *     tags: [CampaignParticipants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignId:
 *                 type: integer
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               newStatus:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Approval status updated successfully
 *       400:
 *         description: Missing or invalid input
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Campaign or participant not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/publishParticipants:
 *   post:
 *     summary: Publish participants for a specific campaign
 *     description: Publishes participants for a campaign by marking them as published.
 *     tags: [CampaignParticipants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignId:
 *                 type: integer
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Published successfully
 *       400:
 *         description: Missing or invalid campaignId or participantIds
 *       404:
 *         description: Campaign or participant not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/updatePaymentStatus:
 *   post:
 *     summary: Update approval status of participants in a campaign
 *     description: Allows the update of approval status (PENDING, COMPLETED, FAILED,REJECTED) for participants in a specific campaign.
 *     tags: [CampaignParticipants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignId:
 *                 type: integer
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               newStatus:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, FAILED,REJECTED]
 *     responses:
 *       200:
 *         description: Approval status updated successfully
 *       400:
 *         description: Missing or invalid input
 *       403:
 *         description: Forbidden, insufficient permissions
 *       404:
 *         description: Campaign or participant not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/participants:
 *   get:
 *     summary: Get all participants
 *     tags: [CampaignParticipants]
 *     description: Retrieves all active participants  of the company making the request.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of participants matching the company location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       fullName:
 *                         type: string
 *                       sex:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       age:
 *                         type: integer
 *                       nationalId:
 *                         type: string
 *                       address:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *                       accountNumber:
 *                         type: string
 *                       paymentMethod:
 *                         type: string
 *                       detail:
 *                         type: string
 *                       isVerified:
 *                         type: boolean
 *                       status:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       regionId:
 *                         type: integer
 *                       zoneId:
 *                         type: integer
 *                         nullable: true
 *                       woredaId:
 *                         type: integer
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Company not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Company not found
 *       500:
 *         description: Failed to fetch participants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch participants
 */
