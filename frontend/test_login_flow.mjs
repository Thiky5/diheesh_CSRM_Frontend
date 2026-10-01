import puppeteer from 'puppeteer-core';

async function testManualLogin() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Click Sign In
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Sign In')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  // Type in username and password for admin
  await page.type('#simple-username', 'admin');
  await page.type('#simple-password', 'admin123');
  await page.click('#simple-auth-submit');

  await new Promise(r => setTimeout(r, 1200));
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Admin Manual Login Successful:', bodyText.includes('Eleanor Vance'));

  await browser.close();
}

testManualLogin().catch(console.error);
