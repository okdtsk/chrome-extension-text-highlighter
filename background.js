chrome.runtime.onInstalled.addListener(function() {
  // Initialize with empty array of rules
  chrome.storage.sync.set({
    highlightRules: []
  });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.status === 'complete') {
    // Add a small delay to ensure content script is ready
    setTimeout(() => {
      chrome.storage.sync.get({ highlightRules: [] }, function(data) {
        if (data.highlightRules && data.highlightRules.length > 0) {
          chrome.tabs.sendMessage(tabId, {
            action: 'updateHighlights',
            rules: data.highlightRules
          }, function() {
            // Handle any errors silently
            if (chrome.runtime.lastError) {
              console.log('Tab not ready yet:', chrome.runtime.lastError.message);
            }
          });
        }
      });
    }, 100);
  }
});