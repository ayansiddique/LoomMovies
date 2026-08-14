

async function check() {
  try {
    const res = await fetch('https://loom-movies.vercel.app/');
    const htmlText = await res.text();
    console.log("HTML length:", htmlText.length);
    
    // Search for JS bundle
    const match = htmlText.match(/src="([^"]*\/assets\/index-[a-zA-Z0-9_\-]+\.js)"/);
    if (!match) {
      console.log("No index match. HTML snippet around scripts:");
      const scripts = htmlText.match(/<script[^>]*>/g) || [];
      console.log(scripts);
      return;
    }
    
    const jsPath = match[1];
    const jsUrl = jsPath.startsWith('http') ? jsPath : 'https://loom-movies.vercel.app' + jsPath;
    console.log('Fetching JS bundle:', jsUrl);
    
    const jsRes = await fetch(jsUrl);
    const jsText = await jsRes.text();
    
    const hasNewID = jsText.includes('s06p0_0_JpQ');
    const hasSearchDiscover = jsText.includes('with_original_language');
    
    console.log('Production check results:');
    console.log('Has new Islamic video ID s06p0_0_JpQ:', hasNewID);
    console.log('Has Discover search with_original_language:', hasSearchDiscover);
  } catch (err) {
    console.error("Check failed:", err);
  }
}

check();
