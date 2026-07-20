let isFocusActive = false;
let focusTimeout = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getState") {
    sendResponse({ isActive: isFocusActive });
  }
  
  if (message.action === "toggleFocus") {
    isFocusActive = !isFocusActive;
    
    if (isFocusActive) {
      const ms = message.duration * 60 * 1000;
      focusTimeout = setTimeout(() => {
        endFocusMode();
      }, ms);
      
      pauseOtherTabs();
    } else {
      clearTimeout(focusTimeout);
      endFocusMode();
    }
    
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
      // Ensure the tab has a valid ID and is a loaded YouTube page
      if (tab.id && tab.url && tab.url.includes("youtube.com")) {
        chrome.tabs.sendMessage(tab.id, { action: "updateVisibility", isActive: isFocusActive }, () => {
          // Catch structural disconnects silently
          if (chrome.runtime.lastError) { /* Context invalidated placeholder */ }
        });
      }
    });
  });
}

function pauseOtherTabs() {
  chrome.tabs.query({ active: false }, (tabs) => {
    tabs.forEach(tab => {
      if (!tab.id || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("brave://")) return;
      
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          document.querySelectorAll('video, audio').forEach(media => media.pause());
        }
      }).catch(() => {});
    });
  });
}