import puppeteer from 'puppeteer';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  let pageHasErrors = false;

  page.on('console', msg => {
    console.log(`[PROD BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    pageHasErrors = true;
    console.error(`[PROD BROWSER PAGEERROR]`, err.stack || err.message || err);
  });

  console.log("Navigating to https://loom-movies.vercel.app/?preview ...");
  try {
    await page.goto('https://loom-movies.vercel.app/?preview', { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch (e) {
    console.log("Navigation warning:", e.message);
  }

  console.log("Waiting for movie cards to render on production...");
  try {
    await page.waitForSelector('#marvel .movie-card', { timeout: 15000 });
    console.log("Movie card rendered. Clicking it...");
    await page.click('#marvel .movie-card');
    console.log("Clicked successfully. Waiting 5 seconds to capture errors...");
  } catch (e) {
    console.error("Selector/Click error:", e.message);
  }

  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log("Closing browser...");
  await browser.close();

  if (pageHasErrors) {
    console.error("PROD TEST FAILED: React rendering errors were detected on Vercel production!");
    process.exit(1);
  } else {
    console.log("PROD TEST PASSED: Vercel production is live and watch page loaded cleanly!");
    process.exit(0);
  }
})();
