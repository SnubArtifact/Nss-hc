import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NSS Hour Count API",
      version: "1.0.0",
      description: "API documentation for the NSS Hour Count backend.",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // files containing annotations as above
};

export const swaggerSpec = swaggerJSDoc(options);
