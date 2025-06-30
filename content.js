let highlightRules = [];
let highlightedElements = [];
let isApplyingHighlights = false;
let pendingHighlight = null;
let highlightDebounceTimer = null;
let notificationsEnabled = true;
let lastNotificationTime = 0;
let currentHighlightIndex = -1;
let searchNotification = null;

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper function to sort elements by their position in the DOM
function sortElementsByDOMPosition(elements) {
  return elements.sort((a, b) => {
    if (a === b) return 0;
    const position = a.compareDocumentPosition(b);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
}

// Helper function to get valid highlighted elements
function getValidHighlightedElements() {
  // Filter out any elements that are no longer in the DOM
  const validElements = highlightedElements.filter(el => document.body.contains(el));
  // Sort them by DOM position
  return sortElementsByDOMPosition(validElements);
}

function showNotification(rulesWithMatches) {
  // Only show notifications if enabled and not too frequent (once per 5 seconds per page)
  const now = Date.now();
  if (!notificationsEnabled || now - lastNotificationTime < 5000) {
    return;
  }
  
  lastNotificationTime = now;
  
  // Remove existing search notification if any
  if (searchNotification && searchNotification.parentNode) {
    searchNotification.parentNode.removeChild(searchNotification);
  }
  
  // Get sorted valid elements
  const sortedHighlights = getValidHighlightedElements();
  
  // Auto-close timer variables
  let autoCloseTimer = null;
  const AUTO_CLOSE_DELAY = 5000; // 5 seconds
  
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
    max-width: 350px;
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
    .search-button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0 4px;
      font-size: 18px;
      transition: background 0.2s;
    }
    .search-button:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    .search-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .current-highlight {
      outline: 3px solid #2196F3 !important;
      outline-offset: 2px;
    }
    #close-notification:hover {
      background: rgba(255, 255, 255, 0.2) !important;
    }
  `;
  document.head.appendChild(style);
  
  const actualMatchCount = sortedHighlights.length;
  const matchText = actualMatchCount === 1 ? '1 match' : `${actualMatchCount} matches`;
  const ruleText = rulesWithMatches === 1 ? '1 rule' : `${rulesWithMatches} rules`;
  
  notification.innerHTML = `
    <button id="close-notification" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; font-size: 20px; cursor: pointer; padding: 0; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: background 0.2s;" title="Close">×</button>
    <div style="font-weight: 600; margin-bottom: 4px;">Text Highlighter</div>
    <div style="margin-bottom: 10px;">Found ${matchText} for ${ruleText} on this page</div>
    <div style="display: flex; align-items: center; justify-content: center;">
      <button class="search-button" id="prev-highlight" title="Previous highlight">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
      <span id="search-position" style="margin: 0 10px; min-width: 60px; text-align: center;">-</span>
      <button class="search-button" id="next-highlight" title="Next highlight">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  searchNotification = notification;
  
  // Add navigation event handlers
  const prevButton = notification.querySelector('#prev-highlight');
  const nextButton = notification.querySelector('#next-highlight');
  const positionSpan = notification.querySelector('#search-position');
  
  let localHighlightIndex = -1;
  
  function updateSearchPosition() {
    const validElements = getValidHighlightedElements();
    if (validElements.length === 0) {
      positionSpan.textContent = '0 / 0';
      prevButton.disabled = true;
      nextButton.disabled = true;
    } else {
      positionSpan.textContent = `${localHighlightIndex + 1} / ${validElements.length}`;
      prevButton.disabled = validElements.length <= 1;
      nextButton.disabled = validElements.length <= 1;
    }
  }
  
  function navigateToHighlight(index) {
    const validElements = getValidHighlightedElements();
    if (index < 0 || index >= validElements.length) return;
    
    // Remove all current highlight indicators
    document.querySelectorAll('.current-highlight').forEach(el => {
      el.classList.remove('current-highlight');
    });
    
    localHighlightIndex = index;
    const element = validElements[index];
    
    // Check if element is still in DOM
    if (!document.body.contains(element)) {
      console.warn('Highlighted element no longer in DOM');
      return;
    }
    
    // Add current highlight indicator
    element.classList.add('current-highlight');
    
    // Scroll to element with better positioning
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
    
    // Ensure element is not hidden behind fixed headers
    setTimeout(() => {
      const rect = element.getBoundingClientRect();
      if (rect.top < 100) {
        window.scrollBy({ top: -100, behavior: 'smooth' });
      }
    }, 300);
    
    updateSearchPosition();
  }
  
  prevButton.addEventListener('click', (e) => {
    e.stopPropagation();
    stopAutoCloseTimer(); // Cancel auto-close when navigating
    const validElements = getValidHighlightedElements();
    if (validElements.length > 0) {
      const newIndex = localHighlightIndex > 0 ? localHighlightIndex - 1 : validElements.length - 1;
      navigateToHighlight(newIndex);
    }
  });
  
  nextButton.addEventListener('click', (e) => {
    e.stopPropagation();
    stopAutoCloseTimer(); // Cancel auto-close when navigating
    const validElements = getValidHighlightedElements();
    if (validElements.length > 0) {
      const newIndex = localHighlightIndex < validElements.length - 1 ? localHighlightIndex + 1 : 0;
      navigateToHighlight(newIndex);
    }
  });
  
  // Initialize search position
  if (sortedHighlights.length > 0) {
    localHighlightIndex = 0;
    navigateToHighlight(0);
  } else {
    updateSearchPosition();
  }
  
  // Auto-close function
  function closeNotification() {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      // Clear current highlight indicator
      document.querySelectorAll('.current-highlight').forEach(el => {
        el.classList.remove('current-highlight');
      });
      searchNotification = null;
      currentHighlightIndex = -1;
    }, 300);
  }
  
  // Start auto-close timer
  function startAutoCloseTimer() {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }
    autoCloseTimer = setTimeout(closeNotification, AUTO_CLOSE_DELAY);
  }
  
  // Stop auto-close timer
  function stopAutoCloseTimer() {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  }
  
  // Close notification handler - only for close button
  const closeButton = notification.querySelector('#close-notification');
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    closeNotification();
  });
  
  // Hover event handlers for auto-close timer
  notification.addEventListener('mouseenter', () => {
    stopAutoCloseTimer();
  });
  
  notification.addEventListener('mouseleave', () => {
    startAutoCloseTimer();
  });
  
  // Start the auto-close timer initially
  startAutoCloseTimer();
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
  currentHighlightIndex = -1;
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
          rulesWithMatches++;
        }
      } catch (e) {
        console.error('Error applying highlight rule:', e);
      }
    });
    
    // Show notification if requested and matches were found
    if (showNotifications && highlightedElements.length > 0) {
      showNotification(rulesWithMatches);
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