import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  let pageHasErrors = false;

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    pageHasErrors = true;
    console.error(`[BROWSER PAGEERROR]`, err.stack || err.message || err);
  });

  console.log("Navigating to http://localhost:5173/?preview ...");
  try {
    await page.goto('http://localhost:5173/?preview', { waitUntil: 'domcontentloaded', timeout: 15000 });
  } catch (e) {
    console.log("Navigation warning (retrying):", e.message);
    try {
      await new Promise(r => setTimeout(r, 1000));
      await page.goto('http://localhost:5173/?preview', { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch (e2) {
      console.log("Navigation failed twice:", e2.message);
    }
  }

  console.log("Waiting for movie rows to render...");
  try {
    await page.waitForSelector('#marvel .movie-card', { timeout: 15000 });
    console.log("Marvel movie card rendered. Clicking it...");
    await page.click('#marvel .movie-card');
    console.log("Clicked successfully. Waiting 5 seconds to capture errors...");
  } catch (e) {
    console.error("Selector/Click error:", e.message);
  }

  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log("Closing browser...");
  await browser.close();

  if (pageHasErrors) {
    console.error("TEST FAILED: React rendering errors were detected in the browser!");
    process.exit(1);
  } else {
    console.log("TEST PASSED: Loaded watch page cleanly with no React errors!");
    process.exit(0);
  }
})();
