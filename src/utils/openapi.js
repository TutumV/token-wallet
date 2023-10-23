import swaggerJSDoc from 'swagger-jsdoc';


const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Token Wallet',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/views/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
