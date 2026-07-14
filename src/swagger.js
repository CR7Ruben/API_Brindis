const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Login - Api_Login_Brindis",
      version: "1.0.0",
      description: "Documentación de la API de autenticación (registro y login)",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;