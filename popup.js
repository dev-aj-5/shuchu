let selectedMinutes = null;
let countdownInterval = null;

// Handle Presets Selection
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
    e.target.classList.add('selected');
    selectedMinutes = parseInt(e.target.dataset.mins);
    document.getElementById('custom-time').value = '';
    document.getElementById('status-text').innerText = `Ready: ${selectedMinutes} minute focus window`;
    document.getElementById('status-text').style.color = "#191919";
  });
});

// Handle Custom Inputs
document.getElementById('custom-time').addEventListener('input', (e) => {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
  if(e.target.value) {
    selectedMinutes = parseInt(e.target.value);
    document.getElementById('status-text').innerText = `Ready: ${selectedMinutes} minute focus window`;
    document.getElementById('status-text').style.color = "#191919";
  } else {
    selectedMinutes = null;
  }
});

// Primary Toggle Logic
const toggleBtn = document.getElementById('toggle-btn');
toggleBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "getState" }, (state) => {
    if (!state.isActive) {
      // Input Validation Guard (Production Validation)
      if (!selectedMinutes || selectedMinutes <= 0 || isNaN(selectedMinutes)) {
        const statusText = document.getElementById('status-text');
        statusText.innerText = "⚠️ Please select or input a duration";
        statusText.style.color = "#e03131";
        return;
      }
    }
    
    chrome.runtime.sendMessage({ action: "toggleFocus", duration: selectedMinutes }, (response) => {
      updateUI(response.isActive, response.endTime);
    });
  });
});

// Sync on Popup Load
chrome.runtime.sendMessage({ action: "getState" }, (response) => {
  updateUI(response.isActive, response.endTime);
});

function updateUI(isActive, endTime) {
  const inputSection = document.getElementById('interactive-inputs');
  const statusText = document.getElementById('status-text');
  const countdownDisplay = document.getElementById('countdown-display');
  
  clearInterval(countdownInterval);
  
  if (isActive && endTime) {
    inputSection.style.display = 'none';
    toggleBtn.innerText = 'Interrupt Focus';
    toggleBtn.className = 'action-btn stop';
    statusText.innerText = "Deep Focus Active";
    statusText.style.color = "#666666";
    countdownDisplay.style.display = 'block';
    
    // Start Live Clock Sync Loop
    runCountdown(endTime);
    countdownInterval = setInterval(() => runCountdown(endTime), 1000);
  } else {
    inputSection.style.display = 'block';
    toggleBtn.innerText = 'Start Focus';
    toggleBtn.className = 'action-btn start';
    countdownDisplay.style.display = 'none';
    statusText.innerText = "Select focus depth";
    statusText.style.color = "#666666";
    selectedMinutes = null;
    document.getElementById('custom-time').value = '';
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
  }
}

function runCountdown(endTime) {
  const remaining = endTime - Date.now();
  if (remaining <= 0) {
    clearInterval(countdownInterval);
    chrome.runtime.sendMessage({ action: "getState" }, (res) => updateUI(res.isActive, res.endTime));
    return;
  }
  
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  document.getElementById('countdown-display').innerText = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}