import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Auth Service API",
        description: "Gerado automaticamente com documentação do Swagger!",
        version: "1.0.2"
    },

    host: "localhost:6001",
    schemes: ["http"]
};

const outputFile = "./swagger-output.json";
const endpointsFile = ["./routes/auth.router.ts"];

swaggerAutogen()(outputFile, endpointsFile, doc); 