/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/contactus:
 *   get:
 *     summary: Get all contacts
 *     description: Retrieve a list of all contact messages.
 *     tags:
 *       - Contact Us
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved contacts.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error.
 *
 *   post:
 *     summary: Create a new contact message
 *     description: Submit a new contact request.
 *     tags:
 *       - Contact Us
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
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               message:
 *                 type: string
 *                 example: "I need assistance with your services."
 *     responses:
 *       '201':
 *         description: Contact message created successfully.
 *       '400':
 *         description: Bad request - Missing required fields.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error.
 *
 * /api/contactus/{id}:
 *   get:
 *     summary: Get contact by ID
 *     description: Retrieve a specific contact message by its ID.
 *     tags:
 *       - Contact Us
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The contact message ID.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully retrieved contact message.
 *       '404':
 *         description: Contact message not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *
 *   delete:
 *     summary: Delete contact by ID
 *     description: Remove a contact message from the system.
 *     tags:
 *       - Contact Us
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The contact message ID.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully deleted contact message.
 *       '404':
 *         description: Contact message not found.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '500':
 *         description: Internal Server Error.
 */
