import puppeteer from 'puppeteer';

async function test() {
  console.log('Testing Puppeteer launch...');
  try {
    const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: chromePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Browser launched successfully!');
    const page = await browser.newPage();
    await page.setContent('<h1>Hello</h1>');
    const pdf = await page.pdf({ format: 'A4' });
    console.log('PDF generated successfully, size:', pdf.length);
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Launch failed:', err);
    process.exit(1);
  }
}

test();
