async function test() {
  const url = "http://localhost:5173/api/check-servers?id=99999999";
  try {
    console.log(`Querying local check-servers API: ${url}`);
    const res = await fetch(url);
    console.log(`Status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log("Returned JSON:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Local API query failed:", e.message);
  }
}
test();
