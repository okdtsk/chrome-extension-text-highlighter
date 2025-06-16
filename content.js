let highlightRules = [];
let highlightedElements = [];
let isApplyingHighlights = false;
let pendingHighlight = null;
let highlightDebounceTimer = null;
let notificationsEnabled = true;
let lastNotificationTime = 0;

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function showNotification(matchCount, ruleCount) {
  // Only show notifications if enabled and not too frequent (once per 5 seconds per page)
  const now = Date.now();
  if (!notificationsEnabled || now - lastNotificationTime < 5000) {
    return;
  }
  
  lastNotificationTime = now;
  
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  const matchText = matchCount === 1 ? '1 match' : `${matchCount} matches`;
  const ruleText = ruleCount === 1 ? '1 rule' : `${ruleCount} rules`;
  
  notification.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">Text Highlighter</div>
    <div>Found ${matchText} for ${ruleText} on this page</div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 300);
  }, 3000);
}

function createHighlightStyles(rule) {
  const styles = [];
  
  if (rule.bgColor) {
    styles.push(`background-color: ${rule.bgColor}`);
  }
  
  if (rule.textColor) {
    styles.push(`color: ${rule.textColor}`);
  }
  
  if (rule.fontSize) {
    styles.push(`font-size: ${rule.fontSize}`);
  }
  
  if (rule.fontWeight) {
    styles.push(`font-weight: ${rule.fontWeight}`);
  }
  
  if (rule.padding > 0) {
    styles.push(`padding: ${rule.padding}px`);
  }
  
  if (rule.borderStyle === 'underline') {
    styles.push(`border-bottom: 2px solid ${rule.borderColor}`);
  } else if (rule.borderStyle === 'double-underline') {
    styles.push(`border-bottom: 3px double ${rule.borderColor}`);
  } else if (rule.borderStyle === 'wavy-underline') {
    styles.push(`text-decoration: underline wavy ${rule.borderColor}`);
    styles.push(`text-decoration-thickness: 2px`);
  } else if (rule.borderStyle === 'dashed-underline') {
    styles.push(`border-bottom: 2px dashed ${rule.borderColor}`);
  } else if (rule.borderStyle === 'border') {
    styles.push(`border: 2px solid ${rule.borderColor}`);
  }
  
  return styles.join('; ');
}

function removeHighlights() {
  highlightedElements.forEach(element => {
    const parent = element.parentNode;
    if (parent) {
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }
  });
  highlightedElements = [];
}

function highlightText(node, pattern, styles, ruleId) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue;
    if (!text || text.trim() === '') return;
    
    const regex = new RegExp(pattern, 'gi');
    let match;
    let lastIndex = 0;
    const fragments = [];
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        fragments.push(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      
      const span = document.createElement('span');
      span.style.cssText = styles;
      span.textContent = match[0];
      span.setAttribute('data-highlight', 'true');
      span.setAttribute('data-rule-id', ruleId);
      fragments.push(span);
      highlightedElements.push(span);
      
      lastIndex = match.index + match[0].length;
    }
    
    if (fragments.length > 0) {
      if (lastIndex < text.length) {
        fragments.push(document.createTextNode(text.slice(lastIndex)));
      }
      
      const parent = node.parentNode;
      fragments.forEach(fragment => {
        parent.insertBefore(fragment, node);
      });
      parent.removeChild(node);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE && 
             !['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT'].includes(node.tagName) &&
             !node.hasAttribute('data-highlight')) {
    // Create a copy of childNodes to avoid issues with live NodeList
    const childNodes = Array.from(node.childNodes);
    for (let i = childNodes.length - 1; i >= 0; i--) {
      highlightText(childNodes[i], pattern, styles, ruleId);
    }
  }
}

function applyHighlights(showNotifications = false) {
  if (isApplyingHighlights) {
    pendingHighlight = true;
    return;
  }
  
  if (!highlightRules || highlightRules.length === 0) {
    removeHighlights();
    return;
  }
  
  isApplyingHighlights = true;
  
  removeHighlights();
  
  let totalMatches = 0;
  let rulesWithMatches = 0;
  
  try {
    highlightRules.forEach(rule => {
      if (!rule.targetText) return;
      
      const pattern = rule.useRegex 
        ? rule.targetText 
        : escapeRegExp(rule.targetText);
      
      const styles = createHighlightStyles(rule);
      
      try {
        const matchesBeforeRule = highlightedElements.length;
        highlightText(document.body, pattern, styles, rule.id);
        const matchesForRule = highlightedElements.length - matchesBeforeRule;
        
        if (matchesForRule > 0) {
          totalMatches += matchesForRule;
          rulesWithMatches++;
        }
      } catch (e) {
        console.error('Error applying highlight rule:', e);
      }
    });
    
    // Show notification if requested and matches were found
    if (showNotifications && totalMatches > 0) {
      showNotification(totalMatches, rulesWithMatches);
    }
  } finally {
    isApplyingHighlights = false;
    
    // If there was a pending highlight request while we were applying, process it now
    if (pendingHighlight) {
      pendingHighlight = false;
      setTimeout(() => applyHighlights(), 100);
    }
  }
}

function debouncedApplyHighlights() {
  if (highlightDebounceTimer) {
    clearTimeout(highlightDebounceTimer);
  }
  
  highlightDebounceTimer = setTimeout(() => {
    applyHighlights();
  }, 300);
}

function loadAndApplySettings() {
  chrome.storage.sync.get({ 
    highlightRules: [], 
    notificationsEnabled: true 
  }, function(data) {
    highlightRules = data.highlightRules;
    notificationsEnabled = data.notificationsEnabled;
    // Show notifications on initial page load
    applyHighlights(true);
  });
}

chrome.runtime.onMessage.addListener(function(request, _sender, sendResponse) {
  if (request.action === 'updateHighlights') {
    highlightRules = request.rules;
    if (request.hasOwnProperty('notificationsEnabled')) {
      notificationsEnabled = request.notificationsEnabled;
    }
    applyHighlights();
    sendResponse({status: 'highlights updated'});
  }
  return true; // Keep the message channel open for async response
});

const observer = new MutationObserver(function(mutations) {
  // Skip if we're currently applying highlights to prevent infinite loops
  if (isApplyingHighlights) {
    return;
  }
  
  let shouldReapply = false;
  
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      for (let node of mutation.addedNodes) {
        // Skip if this is a highlight span we just added
        if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-highlight')) {
          continue;
        }
        
        // Skip empty text nodes
        if (node.nodeType === Node.TEXT_NODE && (!node.nodeValue || node.nodeValue.trim() === '')) {
          continue;
        }
        
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
          shouldReapply = true;
          break;
        }
      }
    }
  });
  
  if (shouldReapply && highlightRules && highlightRules.length > 0) {
    debouncedApplyHighlights();
  }
});

// Wait for document.body to be available
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  loadAndApplySettings();
} else {
  document.addEventListener('DOMContentLoaded', function() {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    loadAndApplySettings();
  });
}