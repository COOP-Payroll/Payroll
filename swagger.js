const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0', // Specify the correct OpenAPI version
    info: {
      title: 'Payroll SAAS API Documentation',
      version: '1.0.0',
      description: 'Payroll SAAS API Documentation',
    },
  },
  apis: ['./routes/*.js'], // Path to your API routes
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
