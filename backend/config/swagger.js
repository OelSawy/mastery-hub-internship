import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // OpenAPI version
    info: {
      title: 'Marketplace Hub', // Title of the API
      version: '1.0.0', // Version of the API
      description: 'API documentation for your project.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`, // Update this based on your environment
      },
    ],
  },
  apis: [path.resolve('backend/routes/*.js')], // Path to the API docs (corrected path)
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerUi, swaggerDocs };