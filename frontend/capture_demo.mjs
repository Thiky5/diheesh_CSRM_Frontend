import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\tharn\\.gemini\\antigravity-ide\\brain\\406ec962-6e2e-4367-913c-3cb016f9c748';

async function runDemo() {
  console.log('Launching browser for CSRM interactive demonstration...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Resource Catalog (Guest view)
  console.log('Step 1: Navigating to Resource Catalog...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'csrm_demo_01_catalog.png') });

  // 2. Auth Page (Login / Registration)
  console.log('Step 2: Viewing Login & Registration Portal...');
  const loginNavBtn = await page.$('button[id="nav-login-btn"]');
  if (loginNavBtn) {
    await loginNavBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  } else {
    // Click on Sign In button in header
    const btns = await page.$$('button');
    for (const b of btns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Sign In')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'csrm_demo_02_auth.png') });

  // 3. Admin Login via 1-click Quick Demo
  console.log('Step 3: Logging in as Admin...');
  const adminDemoBtn = await page.$('button span');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Admin') && text.includes('Eleanor Vance')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'csrm_demo_03_admin_catalog.png') });

  // 4. Admin Dashboard (Approvals & Users)
  console.log('Step 4: Opening Admin Dashboard (User Approvals)...');
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Admin Panel')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'csrm_demo_04_admin_dashboard.png') });

  // 5. Admin Reports & Utilization Analytics
  console.log('Step 5: Admin Reports tab...');
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Reports & Analytics')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'csrm_demo_05_admin_reports.png') });

  // 6. Security Audit Trail
  console.log('Step 6: Security Audit Trail tab...');
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Audit Trail')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'csrm_demo_06_audit_trail.png') });

  // 7. Interactive Calendar View
  console.log('Step 7: Interactive Master Calendar...');
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Schedule Calendar')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'csrm_demo_07_calendar.png') });

  // 8. Service Requests & Campus Maintenance
  console.log('Step 8: Service Requests Portal...');
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Service Requests')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'csrm_demo_08_service_requests.png') });

  // 9. Booking Modal Demonstration
  console.log('Step 9: Opening Booking Modal...');
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Resources')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  
  // Click first "Book Resource" or "Reserve" button
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes('Book Resource') || text.includes('Reserve'))) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'csrm_demo_09_booking_modal.png') });

  await browser.close();
  console.log('Demo screenshot capture completed successfully!');
}

runDemo().catch(console.error);
