async function test() {
  const workingId = "299534"; // Avengers
  const brokenId = "22448"; // Awarapan
  const fakeId = "99999999";
  
  const sources = [
    { name: "vidsrc.me", url: (id) => `https://vidsrc.me/embed/movie/${id}` }, // wait! VidSrc.me uses IMDb, so let's check with IMDb ID
    { name: "vidsrc.to", url: (id) => `https://vidsrc.to/embed/movie/${id}` }
  ];
  
  // Note: Avengers Endgame IMDb is tt4154796. Awarapan IMDb is tt1000723. Fake is tt9999999
  const ids = [
    { tmdb: "299534", imdb: "tt4154796", name: "Avengers" },
    { tmdb: "22448", imdb: "tt1000723", name: "Awarapan" },
    { tmdb: "99999999", imdb: "tt9999999", name: "Fake" }
  ];
  
  for (const src of sources) {
    console.log(`\n================== ${src.name} ==================`);
    for (const item of ids) {
      const targetId = src.name.includes("me") ? item.imdb : item.tmdb;
      const targetUrl = src.url(targetId);
      try {
        console.log(`Fetching: ${item.name} (${targetUrl})`);
        const res = await fetch(targetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        const html = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`HTML Length: ${html.length}`);
        
        // Let's check if the HTML contains error messages
        const textLower = html.toLowerCase();
        const hasError = textLower.includes("not found") || textLower.includes("no source") || textLower.includes("error") || textLower.includes("not available");
        console.log(`Has error text: ${hasError}`);
        if (html.length < 500) {
          console.log(`Snippet:\n${html}`);
        } else {
          console.log(`Snippet (first 200 chars):\n${html.slice(0, 200).replace(/\s+/g, ' ')}`);
        }
      } catch (e) {
        console.log(`Error: ${e.message}`);
      }
    }
  }
}

test();
