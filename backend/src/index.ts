import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRouter from './routes/auth';
import agentsRouter from './routes/agents';
import chatRouter from './routes/chat';
import usersRouter from './routes/users';
import webhooksRouter from './routes/webhooks';
import integrationsRouter from './routes/integrations';
import knowledgeRouter from './routes/knowledge';
import knowledgeSimpleRouter from './routes/knowledgeSimple';
import { prisma } from './services/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());

// Parse CORS origins (supports comma-separated list)
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : '*';

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/users', usersRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/knowledge-simple', knowledgeSimpleRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Better Coaching API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
