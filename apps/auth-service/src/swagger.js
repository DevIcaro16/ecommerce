import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Auth Servuce API",
        description: "Gerado automaticamente com documentação do Swagger!",
        version: "1.0.0"
    },

    host: "localhost:6001",
    schemes: ["http"]
};

const outputFile = "./swagger-output.json";
const endpointsFile = ["./routes/auth.router.ts"];

swaggerAutogen()(outputFile, endpointsFile, doc); 