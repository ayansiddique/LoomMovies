(async () => {
  console.log("Fetching live site HTML...");
  const htmlRes = await fetch("https://loom-movies.vercel.app/");
  const htmlText = await htmlRes.text();
  
  // Find index JS bundle URL (Vite uses /assets/index-*.js)
  const match = htmlText.match(/src="(\/assets\/index-[a-zA-Z0-9_\-]+\.js)"/);
  if (!match) {
    console.error("Could not find index JS bundle in HTML!");
    process.exit(1);
  }
  
  const jsUrl = "https://loom-movies.vercel.app" + match[1];
  console.log(`Found JS bundle URL: ${jsUrl}`);
  
  console.log("Fetching JS bundle content...");
  const jsRes = await fetch(jsUrl);
  const jsText = await jsRes.text();
  
  // Search for our newly added string 'rawMediaId'
  const hasFix = jsText.includes("rawMediaId");
  if (hasFix) {
    console.log("VERIFICATION SUCCESS: The live Vercel site is deployed and has the fix!");
  } else {
    console.log("VERIFICATION FAILED: The live Vercel site does NOT have the fix yet. It is still running the old code.");
  }
})();
