// Start Timer Button Click Event
document.getElementById("start").addEventListener("click", () => {
  const minutes = parseInt(document.getElementById("timer").value);
  const status = document.getElementById("status");

  if (isNaN(minutes) || minutes <= 0) {
    status.textContent = "Enter a valid number!";
    return;
  }

  const timeLimit = minutes * 60 * 1000; // Convert minutes to milliseconds
  const endTime = Date.now() + timeLimit;

  // Send the timer details to the background script
  chrome.runtime.sendMessage({ action: "startTimer", endTime });

  status.textContent = `Timer set for ${minutes} minutes.`;
  startCountdown(endTime, timeLimit); // Pass timeLimit to calculate progress correctly
});

// Button for Enabling Automatic 2-Minute Timer
document.getElementById("enable-automatic").addEventListener("change", (event) => {
  const isChecked = event.target.checked;
  chrome.storage.sync.set({ enableAutomatic: isChecked });

  // If enabled, automatically start the 2-minute timer when the popup opens
  if (isChecked) {
    startAutomaticTimer();
  }
});

// Automatic 2-Minute Timer Function
function startAutomaticTimer() {
  const timeLimit = 2 * 60 * 1000; // 2 minutes in milliseconds
  const endTime = Date.now() + timeLimit;

  // Send the timer details to the background script
  chrome.runtime.sendMessage({ action: "startTimer", endTime });

  // Start the countdown
  startCountdown(endTime, timeLimit);
}

// Countdown Function
function startCountdown(endTime, timeLimit) {
  const countdown = document.getElementById("countdown");
  const progressCircle = document.querySelector('.circle-progress');
  const radius = 70; // radius of the circle
  const circumference = 2 * Math.PI * radius; // circumference of the circle

  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = circumference;

  const initialProgress = circumference;
  const interval = setInterval(() => {
    const remaining = Math.max(0, endTime - Date.now());

    if (remaining <= 0) {
      clearInterval(interval);
      countdown.textContent = "Time's up!";
    } else {
      const minutes = Math.floor(remaining / 1000 / 60);
      const seconds = Math.floor((remaining / 1000) % 60);
      countdown.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      const progress = (remaining / timeLimit) * circumference;
      progressCircle.style.strokeDashoffset = initialProgress - progress;
    }
  }, 1000);
}

// Restore Timer or Start Automatic Timer on Popup Open
document.addEventListener("DOMContentLoaded", () => {
  // Restore the checkbox state from chrome.storage
  chrome.storage.sync.get(["enableAutomatic"], (data) => {
    const enableAutomatic = data.enableAutomatic || false;
    document.getElementById("enable-automatic").checked = enableAutomatic;

    // If enabled, automatically start the 2-minute timer when the popup opens
    if (enableAutomatic) {
      startAutomaticTimer();
    }
  });

  // Check and restore the current timer status from background script
  chrome.runtime.sendMessage({ action: "getTimerStatus" }, (response) => {
    if (response && response.endTime) {
      const currentTime = Date.now();
      if (currentTime < response.endTime) {
        startCountdown(response.endTime, response.endTime - currentTime);
      }
    }
  });
});
