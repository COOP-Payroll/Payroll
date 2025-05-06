/**
 * @swagger
 * /api/participants:
 *   post:
 *     summary: Register a new participant
 *     tags: [Participants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Jane Doe"
 *               sex:
 *                 type: string
 *                 enum: [MALE, FEMALE]
 *                 example: FEMALE
 *               amount:
 *                 type: number
 *                 example: 1500
 *               age:
 *                 type: integer
 *                 example: 35
 *               nationalId:
 *                 type: string
 *                 example: "AB123456"
 *               address:
 *                 type: string
 *                 example: "123 Main Street, City"
 *               email:
 *                 type: string
 *                 example: "jane@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "0987654321"
 *               accountNumber:
 *                 type: string
 *                 example: "ACC987654"
 *               paymentMethod:
 *                 type: string
 *                 enum: [PHONENUMBER, ACCOUNTNUMBER]
 *                 example: ACCOUNTNUMBER
 *               detail:
 *                 type: string
 *                 example: "Payment for health service"
 *     responses:
 *       201:
 *         description: Registered Successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registered Successfully"
 *       500:
 *         description: Failed to create participant
 */
