function setFocusMode(isActive) {
  let styleEl = document.getElementById('shuchu-focus-styles');
  
  if (isActive) {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'shuchu-focus-styles';
      styleEl.innerHTML = `
        ytd-comments, #comments, #related, 
        ytd-browse[page-subtype="home"], 
        #primary #comments, #secondary,
        ytd-watch-next-secondary-results-renderer,
        #contents.ytd-rich-grid-renderer {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
      `;
      (document.head || document.documentElement).appendChild(styleEl);
    }
  } else {
    if (styleEl) styleEl.remove();
  }
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateVisibility") {
    setFocusMode(message.isActive);
  }
});

// Run immediately on script load check
chrome.runtime.sendMessage({ action: "getState" }, (response) => {
  if (response && response.isActive) {
    setFocusMode(true);
  }
});