let selectedMinutes = null;
let countdownInterval = null;

function clearWarning() {
  const warningText = document.getElementById('warning-text');
  const statusText = document.getElementById('status-text');
  
  warningText.classList.remove('visible');
  statusText.style.display = 'block';
  statusText.style.opacity = 1;
}

function showWarning() {
  const warningText = document.getElementById('warning-text');
  const statusText = document.getElementById('status-text');
  
  // Hide standard status text cleanly to prevent layout shifting
  statusText.style.opacity = 0;
  setTimeout(() => {
    statusText.style.display = 'none';
    warningText.classList.add('visible');
  }, 150);
}

// Handle Presets Selection
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    clearWarning();
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
    e.target.classList.add('selected');
    selectedMinutes = parseInt(e.target.dataset.mins);
    document.getElementById('custom-time').value = '';
    
    const statusText = document.getElementById('status-text');
    statusText.innerText = `Ready: ${selectedMinutes} minute focus window`;
    statusText.style.color = "#ffffff";
  });
});

// Handle Custom Inputs
document.getElementById('custom-time').addEventListener('input', (e) => {
  clearWarning();
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
  const statusText = document.getElementById('status-text');
  
  if(e.target.value) {
    selectedMinutes = parseInt(e.target.value);
    statusText.innerText = `Ready: ${selectedMinutes} minute focus window`;
    statusText.style.color = "#ffffff";
  } else {
    selectedMinutes = null;
    statusText.innerText = "Select focus depth";
    statusText.style.color = "rgba(255, 255, 255, 0.45)";
  }
});

// Primary Toggle Logic
const toggleBtn = document.getElementById('toggle-btn');
toggleBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "getState" }, (state) => {
    if (!state.isActive) {
      if (!selectedMinutes || selectedMinutes <= 0 || isNaN(selectedMinutes)) {
        showWarning();
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
  clearWarning();
  
  if (isActive && endTime) {
    inputSection.classList.add('hidden');
    
    statusText.style.opacity = 0;
    setTimeout(() => {
      statusText.innerText = "Deep Focus Active";
      statusText.style.color = "rgba(255, 255, 255, 0.45)";
      statusText.style.opacity = 1;
    }, 200);

    setTimeout(() => {
      countdownDisplay.classList.add('visible');
    }, 150);

    toggleBtn.innerText = 'Interrupt Focus';
    toggleBtn.className = 'action-btn stop';
    
    runCountdown(endTime);
    countdownInterval = setInterval(() => runCountdown(endTime), 1000);
  } else {
    countdownDisplay.classList.remove('visible');
    inputSection.classList.remove('hidden');
    
    toggleBtn.innerText = 'Start Focus';
    toggleBtn.className = 'action-btn start';
    
    statusText.innerText = "Select focus depth";
    statusText.style.color = "rgba(255, 255, 255, 0.45)";
    
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