// Function to inject or remove CSS hiding elements
function setFocusMode(isActive) {
  let styleEl = document.getElementById('focus-flow-styles');
  
  if (isActive) {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'focus-flow-styles';
      // CSS selectors targeting YouTube comments, sidebar recommendations, and home feed
      styleEl.innerHTML = `
        ytd-comments, 
        #comments, 
        #related, 
        ytd-browse[page-subtype="home"],
        ytd-watch-next-secondary-results-renderer {
          display: none !important;
        }
      `;
      document.documentElement.appendChild(styleEl);
    }
  } else {
    if (styleEl) styleEl.remove();
  }
}

// Listen for messages from background script to turn on/off
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateVisibility") {
    setFocusMode(message.isActive);
  }
});

// Check state on load
chrome.runtime.sendMessage({ action: "getState" }, (response) => {
  setFocusMode(response.isActive);
});