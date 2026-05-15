import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors.js';
import { globalLimiter } from './config/rateLimit.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);
app.use(globalLimiter);

// Routes
app.use(routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
