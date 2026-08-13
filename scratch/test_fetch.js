import { fetchMediaDetails, CURATED_LISTS } from '../src/config/tmdb.js';

(async () => {
  console.log("Starting test for all curated lists...");
  for (const [category, list] of Object.entries(CURATED_LISTS)) {
    console.log(`--- Category: ${category} ---`);
    for (const item of list) {
      console.log(`Fetching id: ${item.id}, type: ${item.type} ...`);
      const details = await fetchMediaDetails(item.id, item.type);
      console.log("Result:", details ? `Loaded title: ${details.title || details.name}` : "Failed (null)");
    }
  }
  console.log("Done.");
})();
