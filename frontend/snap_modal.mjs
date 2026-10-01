import puppeteer from 'puppeteer-core';

async function snapModal() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Sign In -> Admin
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Sign In')) { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 500));

  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.trim() === 'Admin') { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1200));

  // Admin Control
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Admin Control')) { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 800));

  // All User Accounts
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('All User Accounts')) { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 800));

  // Click Add New User
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Add New User')) { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 600));

  const savePath = 'C:\\Users\\tharn\\.gemini\\antigravity-ide\\brain\\406ec962-6e2e-4367-913c-3cb016f9c748\\admin_add_user_modal_preview.png';
  await page.screenshot({ path: savePath });
  console.log('Saved modal screenshot to:', savePath);
  await browser.close();
}

snapModal().catch(console.error);
