// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     Campaign:
//  *       type: object
//  *       properties:
//  *         id:
//  *           type: integer
//  *           example: 1
//  *         name:
//  *           type: string
//  *           example: "Clean Water Campaign"
//  *         description:
//  *           type: string
//  *           example: "Campaign to provide clean water in rural areas."
//  *         startDate:
//  *           type: string
//  *           format: date
//  *           example: "2025-05-01"
//  *         endDate:
//  *           type: string
//  *           format: date
//  *           example: "2025-06-01"
//  *         isActive:
//  *           type: boolean
//  *           example: true
//  *         regionId:
//  *           type: integer
//  *           example: 1
//  *         createdAt:
//  *           type: string
//  *           format: date-time
//  *           example: "2025-05-01T10:00:00Z"
//  *         updatedAt:
//  *           type: string
//  *           format: date-time
//  *           example: "2025-05-01T10:00:00Z"
//  *         Region:
//  *           type: object
//  *           properties:
//  *             id:
//  *               type: integer
//  *               example: 1
//  *             name:
//  *               type: string
//  *               example: "Oromia"
//  *
//  * /api/campaign:
//  *   get:
//  *     summary: Get all campaigns with region info
//  *     tags:
//  *       - Campaign
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Successfully retrieved all campaign records.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/Campaign'
//  *       500:
//  *         description: Server error when fetching campaigns.
//  */


/**
 * @swagger
 * components:
 *   schemas:
 *     Campaign:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Clean Water Campaign"
 *         description:
 *           type: string
 *           example: "Campaign to provide clean water in rural areas."
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2025-05-01"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2025-06-01"
 *         budget:
 *           type: number
 *           format: float
 *           example: 15000.50
 *         status:
 *           type: string
 *           example: "PLANNED"
 *         isActive:
 *           type: boolean
 *           example: true
 *         regionId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-01T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-05-01T10:00:00Z"
 *         Region:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "Oromia"
 *
 * /api/campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags:
 *       - Campaign
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               budget:
 *                 type: number
 *                 format: float
 *               status:
 *                 type: string
 *               regionId:
 *                 type: integer
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *               - budget
 *               - status
 *               - regionId
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 *       500:
 *         description: Failed to create campaign
 *
 *   get:
 *     summary: Get all campaigns with region info
 *     tags:
 *       - Campaign
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all campaign records.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campaign'
 *       500:
 *         description: Server error when fetching campaigns.
 *
 * /api/campaigns/{id}:
 *   get:
 *     summary: Get a campaign by ID
 *     tags:
 *       - Campaign
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Campaign retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Failed to fetch campaign
 *
 *   put:
 *     summary: Update a campaign by ID
 *     tags:
 *       - Campaign
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               budget:
 *                 type: number
 *                 format: float
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Failed to update campaign
 *
 *   delete:
 *     summary: Mark a campaign as inactive (soft delete)
 *     tags:
 *       - Campaign
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Campaign marked as inactive successfully
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Failed to mark campaign as inactive
 */