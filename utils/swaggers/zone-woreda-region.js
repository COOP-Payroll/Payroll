/**
 * @swagger
 * /api/zones:
 *   post:
 *     summary: Create a new zone
 *     description: Creates a new zone and associates it with an active region. Requires a valid token for authentication.
 *     tags:
 *       - Zone
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
 *                 description: The name of the zone.
 *               regionId:
 *                 type: integer
 *                 description: The ID of the region to associate with the zone.
 *     responses:
 *       '201':
 *         description: Zone created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the operation was successful.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created zone.
 *                     name:
 *                       type: string
 *                       description: The name of the zone.
 *                     regionId:
 *                       type: integer
 *                       description: The ID of the region associated with the zone.
 *       '400':
 *         description: Bad Request - Missing or invalid data.
 *       '401':
 *         description: Unauthorized - Invalid or missing token.
 *       '404':
 *         description: Region not found or inactive.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
/**
 * @swagger
 * /api/zones/get-woredas/{id}:
 *   get:
 *     summary: Get all woredas under a specific zone
 *     description: Retrieves a list of all woredas associated with a specific zone ID.
 *     tags:
 *       - Zone
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the zone to retrieve woredas from.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved woredas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the woreda.
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: The name of the woreda.
 *                         example: "Woreda A"
 *       '400':
 *         description: Bad Request - Invalid zone ID.
 *       '401':
 *         description: Unauthorized - Invalid or missing token.
 *       '404':
 *         description: Zone not found.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/zones:
 *   get:
 *     summary: Get all active zones
 *     description: Retrieves a list of all active zones, including their associated regions.
 *     tags:
 *       - Zone
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved all active zones.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the operation was successful.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the zone.
 *                       name:
 *                         type: string
 *                         description: The name of the zone.
 *                       region:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: The ID of the region.
 *                           name:
 *                             type: string
 *                             description: The name of the region.
 *       '401':
 *         description: Unauthorized - Invalid or missing token.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/zones/{id}:
 *   get:
 *     summary: Get a single zone by ID
 *     description: Retrieves a zone by its ID if it is active.
 *     tags:
 *       - Zone
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the zone to retrieve.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the zone.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the operation was successful.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the zone.
 *                     name:
 *                       type: string
 *                       description: The name of the zone.
 *                     region:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the region.
 *                         name:
 *                           type: string
 *                           description: The name of the region.
 *       '400':
 *         description: Bad Request - Invalid zone ID.
 *       '401':
 *         description: Unauthorized - Invalid or missing token.
 *       '404':
 *         description: Zone not found.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/zones/{id}:
 *   put:
 *     summary: Update a zone by ID
 *     description: Updates the name of an existing zone by its ID. Requires a valid token for authentication.
 *     tags:
 *       - Zone
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the zone to update.
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
 *                 description: The updated name of the zone.
 *     responses:
 *       '200':
 *         description: Successfully updated the zone.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the operation was successful.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the zone.
 *                     name:
 *                       type: string
 *                       description: The updated name of the zone.
 *       '400':
 *         description: Bad Request - Invalid zone ID or missing zone name.
 *       '401':
 *         description: Unauthorized - Invalid or missing token.
 *       '404':
 *         description: Zone not found.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/zones/{id}:
 *   delete:
 *     summary: Delete a zone by ID (soft delete)
 *     description: Soft deletes a zone by setting its `isActive` field to false. Requires a valid token for authentication.
 *     tags:
 *       - Zone
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the zone to delete.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully deleted the zone.
 *       '400':
 *         description: Bad Request - Invalid zone ID.
 *       '401':
 *         description: Unauthorized - Invalid or missing token.
 *       '404':
 *         description: Zone not found.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/////==============================REGION ==============================
/**
 * @swagger
 * /api/regions:
 *   post:
 *     summary: Create a new region
 *     description: Creates a new region. Requires authentication.
 *     tags:
 *       - Regions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the region
 *     responses:
 *       '201':
 *         description: Region created successfully
 *       '400':
 *         description: Bad request - Missing or invalid parameters
 *       '401':
 *         description: Unauthorized - Token is missing or invalid
 *       '503':
 *         description: Service unavailable - Server error
 */

/**
 * @swagger
 * /api/regions:
 *   get:
 *     summary: Get all active regions
 *     description: Retrieves a list of all active regions. Requires authentication.
 *     tags:
 *       - Regions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of regions retrieved successfully
 *       '401':
 *         description: Unauthorized - Token is missing or invalid
 *       '503':
 *         description: Service unavailable - Server error
 */

/**
 * @swagger
 * /api/regions/{id}:
 *   get:
 *     summary: Get a region by ID
 *     description: Retrieves a specific region by its ID. Requires authentication.
 *     tags:
 *       - Regions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the region to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Region retrieved successfully
 *       '400':
 *         description: Bad request - Invalid region ID
 *       '401':
 *         description: Unauthorized - Token is missing or invalid
 *       '404':
 *         description: Region not found
 *       '503':
 *         description: Service unavailable - Server error
 */
/**
 * @swagger
 * /api/regions/get-zones/{regionId}:
 *   get:
 *     summary: Get all zones under a specific region
 *     description: Retrieves a list of all active zones associated with a specific region ID.
 *     tags:
 *       - Regions
 *     parameters:
 *       - in: path
 *         name: regionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the region to retrieve zones from.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved zones.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the zone.
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: The name of the zone.
 *                         example: "Zone A"
 *       '400':
 *         description: Bad Request - Invalid Region ID.
 *       '401':
 *         description: Unauthorized - Invalid or missing token.
 *       '404':
 *         description: Region not found.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

/**
 * @swagger
 * /api/regions/{id}:
 *   put:
 *     summary: Update a region
 *     description: Updates a region's name based on the provided ID. Requires authentication.
 *     tags:
 *       - Regions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the region to update
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the region
 *     responses:
 *       '200':
 *         description: Region updated successfully
 *       '400':
 *         description: Bad request - Invalid region ID or missing region name
 *       '401':
 *         description: Unauthorized - Token is missing or invalid
 *       '404':
 *         description: Region not found
 *       '503':
 *         description: Service unavailable - Server error
 */

/**
 * @swagger
 * /api/regions/{id}:
 *   delete:
 *     summary: Delete a region
 *     description: Soft deletes a region by setting isActive to false. Requires authentication.
 *     tags:
 *       - Regions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the region to delete
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Region deleted successfully
 *       '400':
 *         description: Bad request - Invalid region ID
 *       '401':
 *         description: Unauthorized - Token is missing or invalid
 *       '404':
 *         description: Region not found
 *       '503':
 *         description: Service unavailable - Server error
 */
