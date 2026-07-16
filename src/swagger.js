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
        url: "https://api-brindis.onrender.com/api-docs/",
        description: "Api hosteada",
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