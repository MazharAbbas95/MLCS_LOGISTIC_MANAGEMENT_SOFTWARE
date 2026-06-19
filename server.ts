import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Capture NODE_ENV BEFORE dotenv can override it (important for production start)
const presetNodeEnv = process.env.NODE_ENV;

// Load .env first as base config
dotenv.config();
// Then load .env.local with override to allow local overrides
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local', override: true });
}

// Restore NODE_ENV if it was pre-set (e.g. by cross-env in npm run start)
if (presetNodeEnv) {
  process.env.NODE_ENV = presetNodeEnv;
}

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import cors from 'cors';
import prisma from './backend/src/config/prisma';
import authRoutes from './backend/src/routes/auth.routes';
import vehicleRoutes from './backend/src/routes/vehicleRecord.routes';
import expenseRoutes from './backend/src/routes/expense.routes';
import biltyRoutes from './backend/src/routes/bilty.routes';
import letterpadRoutes from './backend/src/routes/letterpad.routes';
import reportRoutes from './backend/src/routes/report.routes';
import { errorHandler } from './backend/src/middleware/errorHandler';
import { authMiddleware } from './backend/src/middleware/auth.middleware';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import logger from './backend/src/utils/logger';
import './backend/src/services/queue.service'; // Initialize Redis worker on startup
import './backend/src/services/backup.service'; // Auto-backup database every 24h
import { ipWhitelistMiddleware } from './backend/src/middleware/ipWhitelist';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: process.env.NODE_ENV === 'production' ? 1000 : 5000, // Generous limit for APIs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log('[Server] Initializing...');
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for Vite dev mode compatibility
  }));
  app.use(compression());
  app.use(cors());
  app.use(express.json());

  // Trust proxy headers (needed to get real client IP behind nginx/reverse proxy)
  app.set('trust proxy', true);

  // ── IP WHITELIST: Block all non-LAN access ──────────────────────────────────
  // Only allows requests from 192.168.x.x, 10.x.x.x, 172.16.x.x, localhost
  // Add extra IPs via ALLOWED_IPS env var (comma separated)
  app.use(ipWhitelistMiddleware);

  // Use pino for logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Apply rate limiter ONLY to API routes
  app.use('/api', apiLimiter);

  // Modular API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/vehicle-records', authMiddleware as any, vehicleRoutes);
  app.use('/api/expenses', authMiddleware as any, expenseRoutes);
  app.use('/api/bilties', authMiddleware as any, biltyRoutes);
  app.use('/api/letterpads', authMiddleware as any, letterpadRoutes);
  app.use('/api/reports', authMiddleware as any, reportRoutes);

  app.get('/api/test-ping', (req, res) => {
    res.json({ success: true, message: 'pong' });
  });

  // Vite middleware for development
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  console.log(`[Server] Environment: NODE_ENV=${process.env.NODE_ENV}, hasDist=${hasDist}`);
  const isDev = process.env.NODE_ENV !== 'production' || !hasDist;
  console.log(`[Server] Selected Mode: ${isDev ? 'Development' : 'Production'}`);

  if (isDev) {
    if (!hasDist && process.env.NODE_ENV === 'production') {
      console.warn('[Server] Production mode requested but "dist/index.html" is missing. Falling back to Vite Dev Mode.');
    }
    console.log('[Server] Starting Vite Development Middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      // Only serve index.html for GET requests that expect HTML
      if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
        const url = req.originalUrl;
        try {
          const indexPath = path.resolve(process.cwd(), 'index.html');
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      } else {
        next();
      }
    });
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler - MUST BE LAST
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
