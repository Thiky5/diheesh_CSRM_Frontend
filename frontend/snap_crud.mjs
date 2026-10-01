import puppeteer from 'puppeteer-core';
import path from 'path';

async function snap() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Click Sign In
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Sign In')) { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 600));

  // Click Admin Quick Demo
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.trim() === 'Admin') { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1200));

  // Click Admin Control button in navbar
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Admin Control')) { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1000));

  // Click All User Accounts Tab
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('All User Accounts')) { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1000));

  const savePath = 'C:\\Users\\tharn\\.gemini\\antigravity-ide\\brain\\406ec962-6e2e-4367-913c-3cb016f9c748\\admin_user_crud_preview.png';
  await page.screenshot({ path: savePath });
  console.log('Saved screenshot to:', savePath);
  await browser.close();
}

snap().catch(console.error);
