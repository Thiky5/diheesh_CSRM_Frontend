import puppeteer from 'puppeteer-core';

async function check() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log(`HTTP ${resp.status()}: ${resp.url()}`);
    }
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await browser.close();
}

check().catch(console.error);
