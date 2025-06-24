// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Text Editor API',
      version: '1.0.0',
      description: 'API for a collaborative text editor with authentication, file management, and export features',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              example: 'password123',
            },
            userType: {
              type: 'string',
              enum: ['admin', 'user'],
              example: 'user',
            },
            profilePic: {
              type: 'string',
              example: 'https://example.com/profile.jpg',
            },
          },
        },
        File: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              example: 'Sample text content',
            },
            font: {
              type: 'string',
              example: 'Arial',
            },
            color: {
              type: 'string',
              example: '#000000',
            },
            size: {
              type: 'string',
              example: '12',
            },
            bold: {
              type: 'boolean',
              example: false,
            },
            italic: {
              type: 'boolean',
              example: false,
            },
            underline: {
              type: 'boolean',
              example: false,
            },
          },
        },
        Chat: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Hello AI',
            },
            response: {
              type: 'string',
              example: 'Hello human',
            },
          },
        },
        Verification: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              example: '123456',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server.js'], // Path to your API routes
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};