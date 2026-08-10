// Override window.open inside the iframe to block popups
const blockPopups = () => {
  try {
    if (window.open) {
      window.open = function(url, name, specs, replace) {
        console.log("[Loom Ad-Blocker] Blocked window.open popup request to:", url);
        return {
          focus: () => {},
          blur: () => {},
          close: () => {},
          closed: true
        };
      };
    }
  } catch (e) {
    console.error("[Loom Ad-Blocker] Error blocking popups:", e);
  }
};

// Run immediately
blockPopups();

// Also run when DOM is interactive
document.addEventListener('readystatechange', () => {
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    blockPopups();
  }
});
