import * as cheerio from 'cheerio';

const BASE_URL = "https://www.desidubanime.me";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function cleanText(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value) {
  if (!value) return "";
  const $ = cheerio.load(`<div>${value}</div>`);
  return cleanText($("div").text());
}

async function fetchRetry(url, retries = 3) {
  let lastErr = null;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA },
      });
      if (res.ok) return res;
      if (res.status === 404) throw new Error("Status 404");
      throw new Error(`Status ${res.status}`);
    } catch (e) {
      if (e instanceof Error && e.message === "Status 404") throw e;
      lastErr = e;
      if (i < retries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr;
}

async function fetchHtml(paths) {
  let lastErr = null;
  for (const path of paths) {
    try {
      const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
      const res = await fetchRetry(url);
      const html = await res.text();
      if (html && !/coosync\.com|adsboosters|widescreensponsor/i.test(html)) {
        return html;
      }
      lastErr = new Error("Blocked/redirect response");
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Failed to fetch page");
}

export async function search(q) {
  try {
    const apiRes = await fetchRetry(
      `${BASE_URL}/wp-json/wp/v2/anime?search=${encodeURIComponent(q)}&per_page=30&_embed=1`
    );
    const apiJson = await apiRes.json();
    if (Array.isArray(apiJson) && apiJson.length > 0) {
      const results = apiJson
        .map((item) => {
          const title = decodeHtmlEntities(item?.title?.rendered || item?.slug || "");
          const slug = String(item?.slug || "");
          const url = String(item?.link || `${BASE_URL}/anime/${slug}/`);
          const poster =
            item?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            item?._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium?.source_url ||
            "";
          return title && slug ? { title, slug, url, poster } : null;
        })
        .filter(Boolean);

      if (results.length > 0) return { results };
    }
  } catch (e) {
    // Fall back to HTML scraping
  }

  const html = await fetchHtml([
    `/?s=${encodeURIComponent(q)}`,
    `/search?s_keyword=${encodeURIComponent(q)}`,
  ]);
  const $ = cheerio.load(html);
  const results = [];

  $("article.post, article, .search-page article, a[href*='/anime/']").each((_, el) => {
    const a = $(el).is("a") ? $(el) : $(el).find("a.lnk-blk, .entry-title a, h2 a, h3 a, a[href*='/anime/']").first();
    const title = cleanText($(el).find(".entry-title").text() || a.text() || a.attr("title"));
    const url = a.attr("href");
    const img = $(el).find("img").attr("data-src") || $(el).find("img").attr("src");
    let slug = "";
    if (url) {
      const m = url.match(/\/(?:anime|series)\/([^/]+)\/?$/);
      if (m) slug = m[1];
    }
    if (title && slug) results.push({ title, slug, url, poster: img });
  });

  return { results };
}

export async function getInfo(id) {
  const html = await fetchHtml([`/anime/${id}/`, `/series/${id}/`]);
  const $ = cheerio.load(html);

  const title = cleanText($("h1").first().text() || $('meta[property="og:title"]').attr("content") || id.replace(/[-_]+/g, " "));
  const poster = $(".anime-image img").attr("data-src") || $(".anime-image img").attr("src");
  const synopsis = cleanText(
    $("[data-synopsis]").text() ||
    $(".anime-synopsis, .entry-content p, .description").first().text() ||
    $('meta[property="og:description"]').attr("content")
  );
  const episodes = [];

  $(".swiper-episode-anime .swiper-slide a").each((_, el) => {
    const epUrl = $(el).attr("href");
    const epTitle = cleanText($(el).attr("title") || $(el).find(".episode-list-item-title").text());
    const epNumStr =
      $(el).find(".episode-list-item-number").text().trim() ||
      $(el).find("span").text().replace("Episode", "").trim();
    if (epUrl) {
      const m = epUrl.match(/\/watch\/([^/]+)\/?/);
      const epId = m ? m[1] : "";
      const epNumFromUrl = epUrl.match(/episode-(\d+)/i)?.[1];
      const epImage = $(el).find("img").attr("src") || $(el).find("img").attr("data-src");
      const parsedNum = parseFloat(epNumStr || epNumFromUrl || "0") || 0;
      episodes.push({
        id: epId,
        number: parsedNum,
        title: epTitle && !/^watch\s*now$/i.test(epTitle) ? epTitle : `Episode ${parsedNum || epNumFromUrl || "1"}`,
        url: epUrl,
        image: epImage,
      });
    }
  });

  if (episodes.length === 0) {
    $(".episode-list-display-box a, a[href*='/watch/']").each((_, el) => {
      const epUrl = $(el).attr("href");
      if (!epUrl || !epUrl.includes("/watch/")) return;
      const epNum =
        $(el).find(".episode-list-item-number").text().trim() ||
        $(el).text().match(/episode\s*(\d+)/i)?.[1] ||
        epUrl.match(/episode-(\d+)/i)?.[1];
      const epTitle = $(el).find(".episode-list-item-title").text().trim() || $(el).attr("title") || $(el).text().trim();
      const m = epUrl.match(/\/watch\/([^/]+)\/?/);
      const epId = m ? m[1] : "";
      if (epId) {
        const parsedNum = parseFloat(epNum || "0") || 0;
        episodes.push({
          id: epId,
          number: parsedNum,
          title: epTitle && !/^watch\s*now$/i.test(epTitle) ? epTitle : `Episode ${parsedNum || "1"}`,
          url: epUrl,
        });
      }
    });
  }

  if (episodes.length <= 1) {
    $("a[href*='/watch/']").each((_, el) => {
      const epUrl = $(el).attr("href");
      if (!epUrl) return;
      const epId = epUrl.match(/\/watch\/([^/]+)\/?/)?.[1] || "";
      const epNum = parseFloat(epUrl.match(/episode-(\d+)/i)?.[1] || "0");
      const rawText = cleanText($(el).text());
      if (!epId || !epNum) return;
      episodes.push({
        id: epId,
        number: epNum,
        title: rawText && !/^watch\s*now$/i.test(rawText) ? rawText : `Episode ${epNum}`,
        url: epUrl,
      });
    });
  }

  const uniqueEpisodes = Array.from(new Map(episodes.map((ep) => [ep.id, ep])).values()).sort((a, b) => a.number - b.number);

  return {
    id,
    title,
    poster,
    description: synopsis,
    episodes: uniqueEpisodes,
  };
}

export async function watch(id) {
  const html = await fetchHtml([`/watch/${id}/`]);
  const $ = cheerio.load(html);
  const sources = [];

  const decodeB64 = (str) => { try { return atob(str); } catch { return ""; } };

  $("span[data-embed-id]").each((_, el) => {
    const embedData = $(el).attr("data-embed-id");
    if (!embedData) return;
    const [b64Name, b64Url] = embedData.split(":");
    if (!b64Name || !b64Url) return;
    const serverName = decodeB64(b64Name);
    let finalUrl = decodeB64(b64Url);
    if (!finalUrl || !serverName) return;
    if (finalUrl.includes("<iframe")) {
      const m = finalUrl.match(/src=['"]([^'"]+)['"]/);
      if (m) finalUrl = m[1];
    }
    if (finalUrl && !finalUrl.includes("googletagmanager")) {
      const isDub = serverName.toLowerCase().includes("dub");
      sources.push({
        name: serverName.replace(/dub$/i, ""),
        url: finalUrl,
        isM3U8: finalUrl.includes(".m3u8"),
        isEmbed: !finalUrl.includes(".m3u8"),
        category: isDub ? "dub" : "sub",
        language: isDub ? "Hindi" : "Japanese",
      });
    }
  });

  if (sources.length === 0) {
    $("iframe").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src && !src.includes("googletagmanager") && !src.includes("cdn-cgi")) {
        sources.push({
          name: "Default",
          url: src,
          isM3U8: src.includes(".m3u8"),
          isEmbed: true,
          category: "dub",
        });
      }
    });
  }

  return {
    sources,
    headers: { Referer: BASE_URL, "User-Agent": UA },
  };
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = url.searchParams.get("action");
  const q = url.searchParams.get("q");
  const id = url.searchParams.get("id");

  // Security Check: Validate 'id' parameter to prevent directory traversal and SSRF
  if (id && !/^[a-zA-Z0-9\-_]+$/.test(id)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: "Invalid 'id' parameter. Only alphanumeric characters, hyphens, and underscores are allowed." }));
  }

  try {
    if (action === "search") {
      if (!q) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "Missing query parameter 'q'" }));
      }
      const data = await search(q);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(data));
    } 
    
    if (action === "info") {
      if (!id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "Missing parameter 'id'" }));
      }
      const data = await getInfo(id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(data));
    } 
    
    if (action === "watch") {
      if (!id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "Missing parameter 'id'" }));
      }
      const data = await watch(id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(data));
    }

    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: "Invalid action. Use 'search', 'info', or 'watch'." }));
  } catch (error) {
    console.error("Scraper Error:", error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: error.message || "Internal server error" }));
  }
}
