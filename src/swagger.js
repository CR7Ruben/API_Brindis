const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API FastParking - Login",
      version: "1.0.0",
      description: "Documentación de la API de autenticación (registro, login y gestión de usuarios) para el proyecto FastParking",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
      {
        url: "https://api-fastparking.onrender.com",
        description: "Servidor de producción (Render)",
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