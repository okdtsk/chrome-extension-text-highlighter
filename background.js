chrome.runtime.onInstalled.addListener(function(details) {
  // Only initialize on fresh install, not on browser/extension updates
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      highlightRules: [],
      globalExcludedDomains: []
    });
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.status === 'complete') {
    // Add a small delay to ensure content script is ready
    setTimeout(() => {
      chrome.storage.sync.get({ 
        highlightRules: [], 
        notificationsEnabled: true,
        globalExcludedDomains: []
      }, function(data) {
        if (data.highlightRules && data.highlightRules.length > 0) {
          chrome.tabs.sendMessage(tabId, {
            action: 'updateHighlights',
            rules: data.highlightRules,
            notificationsEnabled: data.notificationsEnabled,
            globalExcludedDomains: data.globalExcludedDomains
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