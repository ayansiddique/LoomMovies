const fs = require('fs');
const path = require('path');

const tmdbConfigPath = path.join(__dirname, '../src/config/tmdb.js');
const sitemapPath = path.join(__dirname, '../public/sitemap.xml');

try {
  const content = fs.readFileSync(tmdbConfigPath, 'utf8');

  // Extract all movie and tv objects from curated lists
  // e.g. { id: 299534, type: 'movie', title: 'Avengers: Endgame' }
  // or { id: 'youtube-kYJvM99T73k', type: 'movie', title: '...' }
  const regex = /\{\s*id:\s*(['"]?youtube-[\w\-]+['"]?|\d+),\s*type:\s*['"](movie|tv)['"]/g;
  
  const urls = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    let id = match[1].replace(/['"]/g, '');
    let type = match[2];
    urls.push({ id, type });
  }

  console.log(`Found ${urls.length} media items in tmdb.js`);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // Add homepage
  xml += `  <url>\n`;
  xml += `    <loc>https://loom-movies.vercel.app/</loc>\n`;
  xml += `    <lastmod>2026-08-17</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // Add all other URLs
  urls.forEach(item => {
    xml += `  <url>\n`;
    xml += `    <loc>https://loom-movies.vercel.app/?watch=${item.id}&amp;type=${item.type}</loc>\n`;
    xml += `    <lastmod>2026-08-17</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`Successfully generated sitemap.xml at ${sitemapPath}`);
} catch (err) {
  console.error('Error generating sitemap:', err);
}
