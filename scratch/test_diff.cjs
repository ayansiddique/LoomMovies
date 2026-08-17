async function test() {
  const tmdbId = "299534"; // Working (170 KB)
  const awarapan = "22448"; // Non-working (18 KB)
  const fakeId = "99999999"; // Fake (8 KB)
  
  const ids = [tmdbId, awarapan, fakeId];
  
  for (const id of ids) {
    try {
      console.log(`\n--- ID: ${id} ---`);
      const res = await fetch(`https://vidlink.pro/movie/${id}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      const html = await res.text();
      console.log(`Status: ${res.status}`);
      console.log(`Length: ${html.length}`);
      
      // Let's count how many script tags or specific keywords are present
      const hasSource = html.includes('source') || html.includes('playlist') || html.includes('stream') || html.includes('.m3u8');
      console.log(`Contains "source": ${html.includes('source')}`);
      console.log(`Contains ".m3u8": ${html.includes('.m3u8')}`);
      console.log(`Contains "hls": ${html.includes('hls')}`);
      console.log(`Contains "subtitle": ${html.includes('subtitle')}`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

test();
