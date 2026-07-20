function setFocusMode(isActive) {
  let styleEl = document.getElementById('shuchu-focus-styles');
  
  if (isActive) {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'shuchu-focus-styles';
      styleEl.innerHTML = `
        /* 1. Hide the entire right-hand sidebar recommendation column */
        #secondary,
        ytd-browse[page-subtype="home"],
        ytd-watch-next-secondary-results-renderer,
        
        /* 2. Hide comment sections across all video variations */
        #comments,
        ytd-item-section-renderer #comments,
        ytd-comments,
        
        /* 3. Hide the home feed grid loops */
        #contents.ytd-rich-grid-renderer,
        ytd-rich-grid-renderer,
        
        /* 4. Hide end-screen video suggestions when a video finishes */
        .html5-endscreen,
        .ytp-endscreen-content {
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

// Listen for messages from background script
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