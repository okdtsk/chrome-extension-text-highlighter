let highlightRules = [];
let editingIndex = -1;

document.addEventListener('DOMContentLoaded', function() {
  const elements = {
    addNewBtn: document.getElementById('addNewBtn'),
    exportBtn: document.getElementById('exportBtn'),
    importBtn: document.getElementById('importBtn'),
    importFile: document.getElementById('importFile'),
    highlightsList: document.getElementById('highlightsList'),
    noHighlights: document.getElementById('noHighlights'),
    editModal: document.getElementById('editModal'),
    modalTitle: document.getElementById('modalTitle'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    targetText: document.getElementById('targetText'),
    useRegex: document.getElementById('useRegex'),
    bgColor: document.getElementById('bgColor'),
    textColor: document.getElementById('textColor'),
    fontSize: document.getElementById('fontSize'),
    fontWeight: document.getElementById('fontWeight'),
    margin: document.getElementById('margin'),
    padding: document.getElementById('padding'),
    borderStyle: document.getElementById('borderStyle'),
    borderColor: document.getElementById('borderColor'),
    borderColorGroup: document.getElementById('borderColorGroup'),
    saveRuleBtn: document.getElementById('saveRuleBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    status: document.getElementById('status')
  };

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function showStatus(message, type) {
    elements.status.textContent = message;
    elements.status.className = `status ${type}`;
    setTimeout(() => {
      elements.status.className = 'status';
    }, 3000);
  }

  function updateNoHighlightsDisplay() {
    if (highlightRules.length === 0) {
      elements.noHighlights.style.display = 'block';
      elements.highlightsList.style.display = 'none';
    } else {
      elements.noHighlights.style.display = 'none';
      elements.highlightsList.style.display = 'block';
    }
  }

  function createHighlightItemElement(rule, index) {
    const item = document.createElement('div');
    item.className = 'highlight-item';
    
    const header = document.createElement('div');
    header.className = 'highlight-item-header';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'highlight-text';
    textDiv.textContent = rule.targetText;
    
    const typeSpan = document.createElement('span');
    typeSpan.className = 'highlight-type';
    typeSpan.textContent = rule.useRegex ? 'Regex' : 'Text';
    
    header.appendChild(textDiv);
    header.appendChild(typeSpan);
    
    const preview = document.createElement('div');
    preview.className = 'highlight-preview';
    preview.textContent = 'Preview';
    preview.style.backgroundColor = rule.bgColor;
    preview.style.color = rule.textColor;
    if (rule.fontSize) preview.style.fontSize = rule.fontSize;
    if (rule.fontWeight) preview.style.fontWeight = rule.fontWeight;
    if (rule.margin > 0) preview.style.margin = `${rule.margin}px`;
    if (rule.padding > 0) preview.style.padding = `${rule.padding}px`;
    if (rule.borderStyle === 'underline') {
      preview.style.borderBottom = `2px solid ${rule.borderColor}`;
    } else if (rule.borderStyle === 'double-underline') {
      preview.style.borderBottom = `3px double ${rule.borderColor}`;
    } else if (rule.borderStyle === 'wavy-underline') {
      preview.style.textDecoration = `underline wavy ${rule.borderColor}`;
      preview.style.textDecorationThickness = '2px';
    } else if (rule.borderStyle === 'dashed-underline') {
      preview.style.borderBottom = `2px dashed ${rule.borderColor}`;
    } else if (rule.borderStyle === 'border') {
      preview.style.border = `2px solid ${rule.borderColor}`;
    }
    
    const actions = document.createElement('div');
    actions.className = 'highlight-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>`;
    editBtn.onclick = () => editRule(index);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn delete';
    deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>`;
    deleteBtn.onclick = () => deleteRule(index);
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    item.appendChild(header);
    item.appendChild(preview);
    item.appendChild(actions);
    
    return item;
  }

  function renderHighlightsList() {
    elements.highlightsList.innerHTML = '';
    highlightRules.forEach((rule, index) => {
      elements.highlightsList.appendChild(createHighlightItemElement(rule, index));
    });
    updateNoHighlightsDisplay();
  }

  function showModal(title) {
    elements.modalTitle.textContent = title;
    elements.editModal.style.display = 'flex';
  }

  function hideModal() {
    elements.editModal.style.display = 'none';
    resetForm();
  }

  function resetForm() {
    elements.targetText.value = '';
    elements.useRegex.checked = false;
    elements.bgColor.value = '#ffff00';
    elements.textColor.value = '#000000';
    elements.fontSize.value = '';
    elements.fontWeight.value = '';
    elements.margin.value = '0';
    elements.padding.value = '0';
    elements.borderStyle.value = 'none';
    elements.borderColor.value = '#000000';
    elements.borderColorGroup.style.display = 'none';
    editingIndex = -1;
  }

  function loadRuleIntoForm(rule) {
    elements.targetText.value = rule.targetText;
    elements.useRegex.checked = rule.useRegex;
    elements.bgColor.value = rule.bgColor;
    elements.textColor.value = rule.textColor;
    elements.fontSize.value = rule.fontSize;
    elements.fontWeight.value = rule.fontWeight;
    elements.margin.value = rule.margin;
    elements.padding.value = rule.padding;
    elements.borderStyle.value = rule.borderStyle;
    elements.borderColor.value = rule.borderColor;
    
    if (rule.borderStyle !== 'none') {
      elements.borderColorGroup.style.display = 'flex';
    }
  }

  function saveRule() {
    const targetText = elements.targetText.value.trim();
    if (!targetText) {
      showStatus('Please enter text to highlight', 'error');
      return;
    }

    const rule = {
      id: editingIndex >= 0 ? highlightRules[editingIndex].id : generateId(),
      targetText: targetText,
      useRegex: elements.useRegex.checked,
      bgColor: elements.bgColor.value,
      textColor: elements.textColor.value,
      fontSize: elements.fontSize.value,
      fontWeight: elements.fontWeight.value,
      margin: parseInt(elements.margin.value) || 0,
      padding: parseInt(elements.padding.value) || 0,
      borderStyle: elements.borderStyle.value,
      borderColor: elements.borderColor.value
    };

    if (editingIndex >= 0) {
      highlightRules[editingIndex] = rule;
    } else {
      highlightRules.push(rule);
    }

    saveToStorage();
    renderHighlightsList();
    hideModal();
    showStatus('Rule saved successfully!', 'success');
  }

  function editRule(index) {
    editingIndex = index;
    const rule = highlightRules[index];
    loadRuleIntoForm(rule);
    showModal('Edit Highlight Rule');
  }

  function deleteRule(index) {
    if (confirm('Are you sure you want to delete this rule?')) {
      highlightRules.splice(index, 1);
      saveToStorage();
      renderHighlightsList();
      showStatus('Rule deleted successfully!', 'success');
    }
  }

  function saveToStorage() {
    chrome.storage.sync.set({ highlightRules: highlightRules }, function() {
      // Send update to all tabs
      chrome.tabs.query({}, function(tabs) {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateHighlights',
            rules: highlightRules
          }, function() {
            // Ignore errors for tabs that don't have content script
            if (chrome.runtime.lastError) {
              console.log('Tab not ready:', chrome.runtime.lastError.message);
            }
          });
        });
      });
    });
  }

  function loadFromStorage() {
    chrome.storage.sync.get({ highlightRules: [] }, function(data) {
      highlightRules = data.highlightRules;
      renderHighlightsList();
    });
  }

  function exportSettings() {
    if (highlightRules.length === 0) {
      showStatus('No rules to export', 'error');
      return;
    }

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      highlightRules: highlightRules
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const filename = `text-highlighter-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('Settings exported successfully!', 'success');
  }

  function importSettings(file) {
    if (!file) {
      showStatus('Please select a file to import', 'error');
      return;
    }

    if (!file.name.endsWith('.json')) {
      showStatus('Please select a valid JSON file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate the import data structure
        if (!importData.highlightRules || !Array.isArray(importData.highlightRules)) {
          throw new Error('Invalid file format: missing or invalid highlightRules array');
        }

        // Validate each rule has required fields
        for (let rule of importData.highlightRules) {
          if (!rule.hasOwnProperty('targetText') || !rule.hasOwnProperty('id')) {
            throw new Error('Invalid file format: rules missing required fields');
          }
        }

        // Ask for confirmation if there are existing rules
        if (highlightRules.length > 0) {
          const confirmed = confirm(
            `This will replace your current ${highlightRules.length} rule(s) with ${importData.highlightRules.length} imported rule(s). Continue?`
          );
          if (!confirmed) {
            return;
          }
        }

        // Import the rules
        highlightRules = importData.highlightRules;
        saveToStorage();
        renderHighlightsList();
        showStatus(`Successfully imported ${highlightRules.length} rule(s)!`, 'success');

      } catch (error) {
        console.error('Import error:', error);
        showStatus('Error importing file: ' + error.message, 'error');
      }
    };

    reader.onerror = function() {
      showStatus('Error reading file', 'error');
    };

    reader.readAsText(file);
  }

  // Event listeners
  elements.addNewBtn.addEventListener('click', () => {
    resetForm();
    showModal('Add New Highlight Rule');
  });

  elements.exportBtn.addEventListener('click', exportSettings);
  
  elements.importBtn.addEventListener('click', () => {
    elements.importFile.click();
  });
  
  elements.importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importSettings(file);
      // Reset the file input so the same file can be selected again
      e.target.value = '';
    }
  });

  elements.closeModalBtn.addEventListener('click', hideModal);
  elements.cancelBtn.addEventListener('click', hideModal);
  elements.saveRuleBtn.addEventListener('click', saveRule);

  elements.borderStyle.addEventListener('change', function() {
    if (this.value === 'none') {
      elements.borderColorGroup.style.display = 'none';
    } else {
      elements.borderColorGroup.style.display = 'flex';
    }
  });

  // Close modal when clicking outside
  elements.editModal.addEventListener('click', function(e) {
    if (e.target === elements.editModal) {
      hideModal();
    }
  });

  // Initialize
  loadFromStorage();
});