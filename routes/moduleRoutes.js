const express = require("express");
const moduleController = require("../controllers/moduleControllers.js");
const middleware = require("../middleware/auth");
const router = express.Router();
//
//get all module of the same company

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/module:
 *   get:
 *     summary: Get all modules
 *     description: Retrieve a list of all modules available in the system.
 *     tags:
 *       - Modules
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of modules.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the module.
 *                       name:
 *                         type: string
 *                         description: The name of the module.
 *       '401':
 *         description: Unauthorized - Token is missing or invalid.
 *       '403':
 *         description: Forbidden - Insufficient permissions to retrieve the modules.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */

router.get(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  //   middleware.restrictALL({ moduleName: "module", isAccessible: true }),
  // middleware.checkPermissions({ name: 'payroll', value:'approve' }),
  moduleController.getAllModules
);

//get specific module of company
router.get(
  "/:id",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  moduleController.getAllowanceById
);

// //add module of company
router.post(
  "/",
  middleware.protectAll,
  middleware.validateUserAgent,
  middleware.restrictToAll("companyAdmin"),
  moduleController.createModules
);

// //update module of company
// router.put(
//   "/:id",
//   middleware.protectAll,
//   middleware.restrictToAll("companyAdmin"),
//   module.updatemodule
// );

// //delete module of company
// router.delete(
//   "/:id",

//   middleware.protectAll,
//   middleware.restrictToAll("companyAdmin"),

//   module.deletemodule
// );

module.exports = router;
