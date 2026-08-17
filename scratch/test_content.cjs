const cheerio = require('cheerio');

async function test() {
  const url = "https://vidlink.pro/movie/22448";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('title').text().trim();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    console.log(`Title: "${title}"`);
    console.log(`Body Length: ${bodyText.length}`);
    console.log(`Body Text (first 1000 chars):\n${bodyText.slice(0, 1000)}`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}
test();
