import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handle/error-middleware';
// import { errorMiddleware } from '@packages/error-handle/error-middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.js");

const app = express();

//Permite reqs do seguinte endereço 
app.use(cors({
    origin: '*', // Liberado para todos para teste
    allowedHeaders: ['Authorization', "Content-Type"],
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());

app.get('/', (req, res) => {
    res.send({ 'message': 'Olá, API, ominx!' });
});

//Docs - Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
    res.json(swaggerDocument);
});

//Routes
app.use("/api", router);

app.use(errorMiddleware);

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const server = app.listen(port, host, () => {
    console.log(`Serviço de Autenticação ON no endereço:  http://${host}:${port}/api`);
    console.log(`Swagger Docs ON em http://${host}:${port}/api-docs`);
});

server.on('error', (err) => {
    console.log("Erro no Servidor: ", err);
    console.log();
});