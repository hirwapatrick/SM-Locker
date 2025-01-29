let timerEndTime = null; // Stores the timer's end time

// Function to block social media websites and switch active tabs
function blockSocialMedia() {
  const blockedSites = ["https://www.facebook.com/", "https://www.instagram.com/", "https://x.com/"];
  
  // Store the time when the sites should be unblocked (24 hours from now)
  const unblockTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  chrome.storage.local.set({ blockedUntil: unblockTime }, () => {
    console.log("Sites will be blocked until: " + new Date(unblockTime).toLocaleString());
  });

  // Get all open tabs and block them if they match a blocked site
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      blockedSites.forEach((site) => {
        if (tab.url.includes(site)) {
          chrome.tabs.update(tab.id, { url: "about:blank" }, () => {
            chrome.tabs.update(tab.id, { active: true });
          });
        }
      });
    });
  });
}

// Function to check if social media sites should remain blocked
function shouldBlockSites(callback) {
  chrome.storage.local.get("blockedUntil", (result) => {
    const unblockTime = result.blockedUntil;
    if (unblockTime && Date.now() < unblockTime) {
      callback(true); // Sites should remain blocked
    } else {
      callback(false); // Sites can be unblocked
    }
  });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Sender Info:", sender);

  if (message.action === "startTimer") {
    timerEndTime = message.endTime;

    // Set an interval to monitor the timer
    const interval = setInterval(() => {
      if (Date.now() >= timerEndTime) {
        clearInterval(interval); // Clear the interval
        blockSocialMedia(); // Trigger blocking of social media sites
        timerEndTime = null; // Reset the timer
      }
    }, 1000);

    sendResponse({ success: true });
  }

  if (message.action === "getTimerStatus") {
    sendResponse({ endTime: timerEndTime });
  }

  if (message.action === "checkIfBlocked") {
    shouldBlockSites((sitesBlocked) => {
      sendResponse({ blocked: sitesBlocked });
    });
    return true; // Indicate asynchronous response
  }
});

// Check and block sites when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  shouldBlockSites((sitesBlocked) => {
    if (sitesBlocked) {
      const blockedSites = ["https://www.facebook.com/", "https://www.instagram.com/", "https://x.com/"];
      blockedSites.forEach((site) => {
        if (tab.url.includes(site)) {
          chrome.tabs.update(tabId, { url: "about:blank" }, () => {
            chrome.tabs.update(tabId, { active: true });
          });
        }
      });
    }
  });
});

// Handle new tabs being opened
chrome.tabs.onCreated.addListener((tab) => {
  shouldBlockSites((sitesBlocked) => {
    if (sitesBlocked) {
      const blockedSites = ["https://www.facebook.com/", "https://www.instagram.com/", "https://x.com/"];
      blockedSites.forEach((site) => {
        if (tab.url.includes(site)) {
          chrome.tabs.update(tab.id, { url: "about:blank" }, () => {
            chrome.tabs.update(tab.id, { active: true });
          });
        }
      });
    }
  });
});

// Listen for the browser startup event and check if the automatic timer should start
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(["enableAutomatic"], (data) => {
    if (data.enableAutomatic) {
      // Start the 2-minute timer automatically when the browser opens
      const timeLimit = 2 * 60 * 1000; // 2 minutes in milliseconds
      const endTime = Date.now() + timeLimit;
      chrome.runtime.sendMessage({ action: "startTimer", endTime });
    }
  });
});

// Listen for changes to the "enableAutomatic" flag
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["enableAutomatic"], (data) => {
    if (data.enableAutomatic) {
      // Start the 2-minute timer automatically if enabled
      const timeLimit = 2 * 60 * 1000; // 2 minutes in milliseconds
      const endTime = Date.now() + timeLimit;
      chrome.runtime.sendMessage({ action: "startTimer", endTime });
    }
  });
});
