import * as cheerio from 'cheerio';

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SERVERS = [
  {
    id: 'vidlink-pro',
    name: 'Server 1 (VidLink - Clean)',
    movie: (id) => `https://vidlink.pro/movie/${id}`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrc-me',
    name: 'Server 2 (VidSrc.me)',
    movie: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`
  },
  {
    id: 'embed-su',
    name: 'Server 3 (Embed.su)',
    movie: (id) => `https://embed.su/embed/movie/${id}`,
    tv: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrc-xyz',
    name: 'Server 4 (VidSrc.xyz)',
    movie: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrc-cc',
    name: 'Server 5 (VidSrc.cc)',
    movie: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'vidsrc-to',
    name: 'Server 6 (VidSrc.to)',
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`
  },
  {
    id: 'autoembed',
    name: 'Server 7 (MultiEmbed)',
    movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
  },
  {
    id: 'vidsrc-pm',
    name: 'Server 8 (VidSrc.pm)',
    movie: (id) => `https://vidsrc.pm/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`
  }
];

// Helper to fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = 2000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "User-Agent": UA,
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Simple heuristic availability checker
function heuristicCheck(html) {
  if (!html) return false;
  
  const text = html.toLowerCase();
  
  // Common error signatures in third-party video players
  const errorSignatures = [
    "video not found",
    "no source found",
    "video is missing",
    "no video",
    "404 not found",
    "404 - file or directory not found",
    "not available in your country",
    "error occurred while processing",
    "file was deleted",
    "file has been deleted",
    "currently unavailable",
    "this video has been removed",
    "we are sorry, but the video was deleted",
    "no player available",
    "no stream found",
    "not yet available"
  ];
  
  const hasError = errorSignatures.some(sig => text.includes(sig));
  if (hasError) return false;
  
  // Check if page size is extremely small (like empty templates or 404 pages)
  if (text.length < 300 && (text.includes("error") || text.includes("not found"))) {
    return false;
  }
  
  return true;
}

// Call Groq LLM to analyze ambiguous player HTML
async function checkWithGroq(title, bodyText) {
  if (!GROQ_API_KEY) {
    console.warn("Groq API Key not found. Falling back to heuristic check.");
    return true; // Default to true if no API key is available to avoid false negatives
  }

  try {
    const prompt = `You are a technical web analyzer checking if a third-party movie embed iframe page contains a working movie stream/player, or if it is displaying an error/missing page.

Analyze the title and body text snippet below and determine if the movie/video is successfully available and ready to stream, or if the page shows a "not found", "deleted", "unavailable", "404", "error", or similar warning.

Respond strictly in JSON format: {"available": true/false}

Page Details:
Title: ${title}
Content Snippet: ${bodyText.slice(0, 700)}
`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a precise JSON assistant. Output only JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 50
      })
    });

    if (!res.ok) {
      console.warn(`Groq API returned status: ${res.status}`);
      return true;
    }

    const data = await res.json();
    const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    return content.available === true;
  } catch (err) {
    console.error("Groq Check Error:", err);
    return true; // Fallback
  }
}

export default async function handler(req, res) {
  // CORS setup
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const mediaId = url.searchParams.get("id");
  const mediaType = url.searchParams.get("type") || "movie";
  const season = url.searchParams.get("season") || "1";
  const episode = url.searchParams.get("episode") || "1";

  if (!mediaId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: "Missing parameter 'id'" }));
  }

  // Security Check: Validate id parameter to prevent SSRF
  if (!/^[a-zA-Z0-9\-_]+$/.test(mediaId)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: "Invalid ID parameter" }));
  }

  try {
    // Perform checks in parallel for all servers
    const checkPromises = SERVERS.map(async (server) => {
      // YouTube IDs are custom, they always work (they play in default player)
      if (mediaId.startsWith('youtube-')) {
        return { id: server.id, available: true };
      }
      
      const embedUrl = mediaType === 'movie' 
        ? server.movie(mediaId)
        : server.tv(mediaId, season, episode);

      try {
        const response = await fetchWithTimeout(embedUrl, { method: 'GET' }, 2000);
        if (!response.ok) {
          // If VidLink returns 500 status, it is definitely down/not found
          return { id: server.id, available: false };
        }
        
        const html = await response.text();
        
        // If request is blocked by Cloudflare, we cannot verify, so assume available: true to prevent false negatives
        const isCloudflare = html.toLowerCase().includes('cloudflare') || 
                             html.toLowerCase().includes('cf-challenge') || 
                             html.toLowerCase().includes('challenge-platform') ||
                             html.toLowerCase().includes('just a moment');
        
        if (isCloudflare) {
          return { id: server.id, available: true };
        }
        
        // VidLink returns a very small template size (~18KB) if the movie has no sources
        if (server.id === 'vidlink-pro' && html.length < 50000) {
          return { id: server.id, available: false };
        }
        
        // Fast heuristic text checks first
        const heuristicPassed = heuristicCheck(html);
        if (!heuristicPassed) {
          return { id: server.id, available: false };
        }

        // Parse title and main snippet to pass to Groq for verification
        const $ = cheerio.load(html);
        const title = $('title').text().trim() || "";
        const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 1000) || "";
        
        // If the title or body contains highly suspicious terms, run AI check
        const suspiciousWords = ["error", "sorry", "missing", "not found", "deleted", "remove", "unavail", "country", "block"];
        const isSuspicious = suspiciousWords.some(word => 
          title.toLowerCase().includes(word) || bodyText.toLowerCase().includes(word)
        );

        if (isSuspicious) {
          const aiCheckResult = await checkWithGroq(title, bodyText);
          return { id: server.id, available: aiCheckResult };
        }

        return { id: server.id, available: true };
      } catch (err) {
        // Fetch failed or timed out
        const code = err.cause?.code || err.code || "";
        const name = err.name || "";
        
        const deadErrorCodes = [
          'ENOTFOUND',
          'ENODATA',
          'EAI_AGAIN',
          'ECONNREFUSED',
          'EHOSTUNREACH',
          'ECONNRESET',
          'ETIMEDOUT',
          'EADDRNOTAVAIL'
        ];
        
        if (deadErrorCodes.includes(code) || name === 'AbortError') {
          return { id: server.id, available: false };
        }
        
        // Default to true for other transient errors/timeouts to prevent false negatives
        return { id: server.id, available: true };
      }
    });

    const results = await Promise.all(checkPromises);
    const workingServers = results.filter(r => r.available).map(r => r.id);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ workingServers }));
  } catch (error) {
    console.error("Checker Server Error:", error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: error.message || "Internal server error" }));
  }
}
