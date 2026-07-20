let selectedMinutes = 5; // Default

// Handle Preset Clicks
document.querySelectorAll('.btn-grid button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    selectedMinutes = parseInt(e.target.dataset.mins);
    document.getElementById('custom-time').value = '';
    document.getElementById('status-text').innerText = `Set for ${selectedMinutes} mins`;
  });
});

// Handle Custom Input
document.getElementById('custom-time').addEventListener('input', (e) => {
  if(e.target.value) {
    selectedMinutes = parseInt(e.target.value);
    document.getElementById('status-text').innerText = `Set for ${selectedMinutes} mins`;
  }
});

// Toggle Button Logic
const toggleBtn = document.getElementById('toggle-btn');
toggleBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "toggleFocus", duration: selectedMinutes }, (response) => {
    updateUI(response.isActive);
  });
});

// Check current state on popup open
chrome.runtime.sendMessage({ action: "getState" }, (response) => {
  updateUI(response.isActive);
});

function updateUI(isActive) {
  const timerSection = document.getElementById('timer-section');
  const statusText = document.getElementById('status-text');
  
  if (isActive) {
    timerSection.style.display = 'none';
    toggleBtn.innerText = 'Stop Focus';
    toggleBtn.className = 'action-btn stop';
    toggleBtn.style.display = 'block';
    statusText.innerText = "Focus Active";
  } else {
    timerSection.style.display = 'block';
    toggleBtn.innerText = 'Start Focus';
    toggleBtn.className = 'action-btn start';
    statusText.innerText = "Ready to focus";
  }
}