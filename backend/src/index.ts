import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { query } from './db';
import dotenv from 'dotenv';
import initDb from './setupDb';
import swaggerUi from 'swagger-ui-express';
import openapiSpec from './swagger';
import productsRouter from './routes/products';
import authRouter from './routes/authRoutes';
import cartRouter from './routes/cartRoutes';
import ordersRouter from './routes/orderRoutes';
import categoriesRouter from './routes/categoryRoutes';
import addressRouter from './routes/addressRoutes';

dotenv.config();

const app = express();
// Security middlewares
app.use(helmet());

// CORS: allow origins from env or allow all in development
const isDev = process.env.NODE_ENV !== 'production';
const allowed = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://127.0.0.1:3000'];
if (isDev) {
  // allow any origin in development (including curl / Postman with no Origin)
  app.use(cors());
} else {
  app.use(cors({ origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow server-to-server or curl
    if (allowed.indexOf(origin) !== -1) return cb(null, true);
    return cb(new Error('CORS not allowed'));
  }}));
}

// Rate limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

app.use(express.json());

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get('/openapi.json', (_req: Request, res: Response) => res.json(openapiSpec));

// Centralized error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (err.message && err.message.indexOf('CORS') !== -1) return res.status(403).json({ error: 'CORS error' });
  res.status(500).json({ error: 'Server error' });
});

type Product = {
  id?: number;
  name: string;
  description?: string;
  price?: number;
};

// Mount modular routers
app.use('/products', productsRouter);
app.use('/auth', authRouter);
app.use('/cart', cartRouter);
app.use('/orders', ordersRouter);
app.use('/categories', categoriesRouter);
app.use('/addresses', addressRouter);

const port = process.env.PORT || 4000;

async function main() {
  try {
    await initDb();
    app.listen(port, () => console.log(`Backend running on port ${port}`));
  } catch (err) {
    console.error('Server failed to start due to DB init error');
    process.exit(1);
  }
}

main();
