let isFocusActive = false;
let focusTimeout = null;
let focusEndTime = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getState") {
    sendResponse({ isActive: isFocusActive, endTime: focusEndTime });
  }
  
  if (message.action === "toggleFocus") {
    isFocusActive = !isFocusActive;
    
    if (isFocusActive) {
      const ms = message.duration * 60 * 1000;
      focusEndTime = Date.now() + ms;
      
      focusTimeout = setTimeout(() => {
        endFocusMode();
      }, ms);
      
      pauseOtherTabs();
    } else {
      clearTimeout(focusTimeout);
      endFocusMode();
    }
    
    broadcastState();
    sendResponse({ isActive: isFocusActive, endTime: focusEndTime });
  }
  return true; 
});

function endFocusMode() {
  isFocusActive = false;
  focusEndTime = null;
  broadcastState();
}

function broadcastState() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id && tab.url && tab.url.includes("youtube.com")) {
        chrome.tabs.sendMessage(tab.id, { action: "updateVisibility", isActive: isFocusActive }, () => {
          if (chrome.runtime.lastError) { /* Clean context catching */ }
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