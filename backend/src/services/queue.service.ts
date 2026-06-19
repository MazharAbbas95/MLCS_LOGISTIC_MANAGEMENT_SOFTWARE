import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { generateBiltyPdf } from './generateBiltyPdf';
import fs from 'fs';
import path from 'path';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
let pdfQueue: any;
let redisAvailable = false;

// BullMQ bundles its own ioredis version — pass the URL string directly
// to avoid type conflicts between the two ioredis copies.
const bullConnection = { url: REDIS_URL };

// Only attempt Redis connection once at startup. If it fails, disable gracefully.
async function initRedis() {
  try {
    // First verify Redis is reachable using standalone ioredis
    const redis = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: () => null, // Do NOT auto-retry — we handle it ourselves
    });

    // Suppress error events after initial check
    redis.on('error', () => {}); // silenced — we already logged the failure

    // Attempt a single connection with a 3-second timeout
    await Promise.race([
      redis.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]);

    redis.disconnect(); // We don't need this instance anymore
    redisAvailable = true;

    // Use URL string for BullMQ to avoid ioredis version type conflicts
    pdfQueue = new Queue('pdf-generation', { connection: bullConnection as any });
    console.log('[Queue] Redis connected. Batch PDF features enabled.');

    // Start the worker
    const pdfWorker = new Worker(
      'pdf-generation',
      async (job: Job) => {
        const { formData, outputPath } = job.data;
        console.log(`[Worker] Processing PDF batch job ${job.id} for Bilty ${formData.biltyNo}`);

        const pdfBuffer = await generateBiltyPdf(formData);

        if (outputPath) {
          const fullPath = path.resolve(outputPath);
          const dir = path.dirname(fullPath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(fullPath, pdfBuffer);
          return { success: true, path: fullPath };
        }

        return { success: true };
      },
      {
        connection: bullConnection as any,
        concurrency: 2,
      }
    );

    pdfWorker.on('completed', (job) => {
      console.log(`[Worker] Job ${job.id} completed successfully`);
    });

    pdfWorker.on('failed', (job, err) => {
      console.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
    });
  } catch {
    console.warn('[Queue] Redis unavailable — Batch PDF features disabled. App will run normally without it.');
    redisAvailable = false;
  }
}

// Fire and forget — do not block server startup
initRedis();

export { pdfQueue };

export const addPdfToQueue = async (formData: any, outputPath?: string) => {
  if (!pdfQueue || !redisAvailable) {
    throw new Error('Batch PDF processing is currently unavailable (Redis Offline)');
  }
  return await pdfQueue.add('generate-single', { formData, outputPath }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
};
