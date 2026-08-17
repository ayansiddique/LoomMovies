async function test() {
  const url = "https://vidsrc.xyz/embed/movie/299534";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("Status:", res.status);
  } catch (e) {
    console.log("Error name:", e.name);
    console.log("Error message:", e.message);
    if (e.cause) {
      console.log("Error cause code:", e.cause.code);
      console.log("Error cause message:", e.cause.message);
    }
  }
}

test();
