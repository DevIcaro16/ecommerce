import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handle/error-middleware';
import cookieParser from 'cookie-parser';

const app = express();

//Permite reqs do seguinte endereço 
app.use(cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', "Content-Type"],
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());

app.use(errorMiddleware);



app.get('/', (req, res) => {
    res.send({ 'message': 'Olá, API, icarus!' });
});

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const server = app.listen(port, host, () => {
    console.log(`Serviço de Autenticação ON no endereço:  http://${host}:${port}`);
});

server.on('error', console.error);