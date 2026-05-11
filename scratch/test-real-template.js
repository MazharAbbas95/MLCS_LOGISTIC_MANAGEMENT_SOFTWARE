import puppeteer from 'puppeteer-core';
import { generateBiltyHtml } from '../backend/src/templates/biltyTemplate.js';

async function test() {
  console.log('Testing REAL template PDF generation...');
  try {
    const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: chromePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    const html = generateBiltyHtml({
      biltyNo: 'TEST-123',
      date: '2026-05-09',
      truckNo: 'ABC-123'
    });

    console.log('Setting content...');
    const start = Date.now();
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    console.log('Content set in', Date.now() - start, 'ms');

    console.log('Generating PDF...');
    const pdfStart = Date.now();
    await page.pdf({ format: 'A4', landscape: true });
    console.log('PDF generated in', Date.now() - pdfStart, 'ms');

    await browser.close();
    console.log('Success!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

test();
