let isFocusActive = false;
let focusTimeout = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getState") {
    sendResponse({ isActive: isFocusActive });
  }
  
  if (message.action === "toggleFocus") {
    isFocusActive = !isFocusActive;
    
    if (isFocusActive) {
      // 1. Start the timer to auto-turn off
      const ms = message.duration * 60 * 1000;
      focusTimeout = setTimeout(() => {
        endFocusMode();
      }, ms);
      
      // 2. Pause other tabs
      pauseOtherTabs();
    } else {
      // Manually stopped
      clearTimeout(focusTimeout);
      endFocusMode();
    }
    
    // Update YouTube tabs immediately
    broadcastState();
    sendResponse({ isActive: isFocusActive });
  }
  return true; 
});

function endFocusMode() {
  isFocusActive = false;
  broadcastState();
}

function broadcastState() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      // Safeguard to only send to tabs that are loaded
      if (tab.url && tab.url.includes("youtube.com")) {
        chrome.tabs.sendMessage(tab.id, { action: "updateVisibility", isActive: isFocusActive }).catch(() => {});
      }
    });
  });
}

// Queries all tabs and executes a script to pause HTML5 video/audio elements
function pauseOtherTabs() {
  chrome.tabs.query({ active: false }, (tabs) => {
    tabs.forEach(tab => {
      if (!tab.url || tab.url.startsWith("chrome://")) return;
      
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          document.querySelectorAll('video, audio').forEach(media => media.pause());
        }
      }).catch(() => {}); // Catch errors for protected browser pages
    });
  });
}