import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import proxy from 'express-http-proxy';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import * as path from 'path';
import { error } from 'console';

const app = express();

//Permite reqs do seguinte endereço 
app.use(cors({
  origin: ['http://localhost:3000'],
  allowedHeaders: ['Authorization', "Content-Type"],
  credentials: true
}));

app.use(morgan('dev'));

app.use(express.json({ limit: '100mb' }));

app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(cookieParser());

app.set('trust proxy', 1);

//Aplicando Rate Limit

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: 'Muitas requisições foram realizadas, por favor aguarde!' },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => req.ip
});

app.use(limiter);

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Bem vindo ao api-gateway!' });
});

app.use('/', proxy("http://localhost:6001"));

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log(`api-gateway ON no endereço: http://localhost:${port}/api`);
});

server.on('error', console.error);
