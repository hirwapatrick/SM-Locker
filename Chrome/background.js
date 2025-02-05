let timerEndTime = null; // Stores the timer's end time

// Function to block social media websites and switch active tabs
function blockSocialMedia() {
  const blockedSites = ["facebook.com", "instagram.com", "x.com", "tiktok.com"];

  // Store the time when the sites should be unblocked (24 hours from now)
  const unblockTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  chrome.storage.local.set({ blockedUntil: unblockTime }, () => {
    console.log("Sites will be blocked until:", new Date(unblockTime).toLocaleString());
  });

  // Get all open tabs and block them if they match a blocked site
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (blockedSites.some(site => tab.url && tab.url.includes(site))) {
        chrome.tabs.update(tab.id, { url: "about:blank", active: true });
      }
    });
  });
}

// Function to check if social media sites should remain blocked
function shouldBlockSites(callback) {
  chrome.storage.local.get("blockedUntil", (result) => {
    const unblockTime = result.blockedUntil;
    callback(unblockTime && Date.now() < unblockTime);
  });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);

  if (message.action === "startTimer") {
    timerEndTime = message.endTime;

    // Use alarms to trigger blocking instead of setInterval
    chrome.alarms.create("blockSocialMedia", { when: timerEndTime });

    sendResponse({ success: true });
  }

  if (message.action === "getTimerStatus") {
    sendResponse({ endTime: timerEndTime });
  }

  if (message.action === "checkIfBlocked") {
    shouldBlockSites((sitesBlocked) => sendResponse({ blocked: sitesBlocked }));
    return true; // Indicate asynchronous response
  }
});

// Alarm listener to trigger blocking when timer ends
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "blockSocialMedia") {
    blockSocialMedia();
    timerEndTime = null;
  }
});

// Check and block sites when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  shouldBlockSites((sitesBlocked) => {
    if (sitesBlocked && tab.url && ["facebook.com", "instagram.com", "x.com", "tiktok.com"].some(site => tab.url.includes(site))) {
      chrome.tabs.update(tabId, { url: "about:blank", active: true });
    }
  });
});

// Handle new tabs being opened
chrome.tabs.onCreated.addListener((tab) => {
  shouldBlockSites((sitesBlocked) => {
    if (sitesBlocked && tab.url && ["facebook.com", "instagram.com", "x.com", "tiktok.com"].some(site => tab.url.includes(site))) {
      chrome.tabs.update(tab.id, { url: "about:blank", active: true });
    }
  });
});

// Keep service worker alive using an alarm every 5 minutes
chrome.alarms.create("keepAlive", { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepAlive") {
    console.log("Service worker kept alive.");
  }
});

// Listen for the browser startup event and check if the automatic timer should start
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(["enableAutomatic"], (data) => {
    if (data.enableAutomatic) {
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
      const timeLimit = 2 * 60 * 1000; // 2 minutes in milliseconds
      const endTime = Date.now() + timeLimit;
      chrome.runtime.sendMessage({ action: "startTimer", endTime });
    }
  });
});
