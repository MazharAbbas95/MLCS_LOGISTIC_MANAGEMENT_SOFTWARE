import puppeteer from 'puppeteer-core';
import { generateBiltyHtml } from '../templates/biltyTemplate';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { Cluster } from 'puppeteer-cluster';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as any);

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

let cluster: Cluster | null = null;

const getCluster = async () => {
  if (cluster) return cluster;
  
  cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 5,
    puppeteerOptions: {
      headless: true,
      executablePath: chromePath,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ]
    }
  });

  await cluster.task(async ({ page, data: formData }) => {
    await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });
    const sanitizedData = sanitizeData(formData);
    const html = generateBiltyHtml(sanitizedData);
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    return await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true
    });
  });

  return cluster;
};
const sanitizeData = (data: any) => {
  const sanitized: any = {};
  for (const key in data) {
    if (typeof data[key] === 'string') {
      sanitized[key] = DOMPurify.sanitize(data[key]);
    } else if (Array.isArray(data[key])) {
      sanitized[key] = data[key].map((item: any) => 
        typeof item === 'string' ? DOMPurify.sanitize(item) : item
      );
    } else {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
};

export const generateBiltyPdf = async (formData: any) => {
  const log = (msg: string) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync('debug.log', `[${timestamp}] [Service] ${msg}\n`);
  };

  try {
    log('Queueing PDF task in cluster...');
    const c = await getCluster();
    const pdf = await c.execute(formData);
    log('PDF task completed successfully');
    return pdf;
  } catch (error: any) {
    log(`Service Error: ${error.message}`);
    throw error;
  }
};


