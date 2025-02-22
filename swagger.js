// const swaggerJSDoc = require("swagger-jsdoc");

// const options = {
//   definition: {
//     openapi: "3.0.0", // Specify the correct OpenAPI version
//     info: {
//       title: "Payroll SAAS API Documentation",
//       version: "1.0.0",
//       description: "Payroll SAAS API Documentation",
//     },
//   },
//   apis: ["./routes/*.js"], // Path to your API routes
// };

// const swaggerSpec = swaggerJSDoc(options);

// module.exports = swaggerSpec;

const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0", // Specify the correct OpenAPI version
    info: {
      title: "Payroll API Documentation",
      version: "1.0.0",
      description: "Payroll API Documentation",
    },
    // components: {
    //   securitySchemes: {
    //     BearerAuth: {
    //       type: "http",
    //       scheme: "bearer",
    //       bearerFormat: "JWT", // Specify that this is a JWT token
    //     },
    //   },
    // },
    security: [
      {
        BearerAuth: [], // Apply JWT Bearer token globally
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to your API routes  //
  
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

// const swaggerJSDoc = require("swagger-jsdoc");

// const options = {
//   definition: {
//     openapi: "3.0.0", // OpenAPI version
//     info: {
//       title: "Payroll SAAS API Documentation",
//       version: "1.0.0",
//       description: "Payroll SAAS API Documentation",
//     },
//     servers: [
//       {
//         url: "http://localhost:4400", // Update with your actual API base URL
//         description: "Local development server",
//       },
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT", // JSON Web Token
//         },
//       },
//     },
//     security: [
//       {
//         bearerAuth: [],
//       },
//     ],
//   },
//   apis: ["./routes/*.js"], // Path to API route files
// };

// const swaggerSpec = swaggerJSDoc(options);

// module.exports = swaggerSpec;
