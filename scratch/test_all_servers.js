const dns = require('dns').promises;

const domains = [
  "vidlink.pro",
  "vidsrc.me",
  "embed.su",
  "vidsrc.xyz",
  "vidsrc.cc",
  "vidsrc.to",
  "multiembed.mov",
  "vidsrc.pm"
];

async function checkDomains() {
  console.log("Checking domain DNS resolutions:");
  for (const domain of domains) {
    try {
      const addresses = await dns.resolve(domain);
      console.log(`✅ ${domain} resolves to: ${addresses.join(', ')}`);
    } catch (err) {
      console.log(`❌ ${domain} failed to resolve: ${err.code || err.message}`);
    }
  }
}

checkDomains();
