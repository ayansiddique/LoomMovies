async function test() {
  const urls = [
    "https://vidlink.pro/api/movie/299534",
    "https://vidlink.pro/api/movie/22448",
    "https://vidlink.pro/api/movie/99999999"
  ];
  
  for (const url of urls) {
    try {
      console.log(`\nFetching: ${url}`);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Length: ${text.length}`);
      console.log(`Snippet:\n${text.slice(0, 500)}`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

test();
