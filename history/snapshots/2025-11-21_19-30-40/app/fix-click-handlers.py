#!/usr/bin/env python3
"""
Surgical replacement of click handlers in folders-trash.js
Removes complex double-click-to-rename logic, keeps everything else intact
"""

import re

# Read the file
with open('/Users/marksexton/Desktop/Email-Briefing-App/js/folders-trash.js', 'r') as f:
    content = f.read()

# Define the new simplified handlers
new_handleIconClick = '''// Handle icon clicks for selection ONLY (rename via right-click menu)
function handleIconClick(event, card, itemKey, itemName, itemType) {
    event.stopPropagation();
    
    // Clear other selections
    document.querySelectorAll('.design-card.selected, .folder-card.selected').forEach(c => {
        if (c !== card) c.classList.remove('selected');
    });
    selectedItems.clear();
    
    // Select this item
    card.classList.add('selected');
    selectedItems.add(itemKey);
}'''

new_handleIconDoubleClick = '''// Handle double-click to open - INSTANT, NO DELAYS
function handleIconDoubleClick(event, itemKey, itemType) {
    event.stopPropagation();
    
    if (itemType === 'folder') {
        openFolder(itemKey);
    } else if (itemType === 'design') {
        loadDesignFromCard(itemKey);
    } else if (itemType === 'export') {
        downloadExportFile(itemKey);
    } else if (itemType === 'template') {
        const templateId = itemKey.replace('template-', '');
        selectTemplate(templateId);
    }
}'''

# Pattern to match the entire handleIconClick function
pattern1 = r'// Handle icon clicks for selection and rename\s*\nfunction handleIconClick\(event, card, itemKey, itemName, itemType\) \{[^}]*?(?:\{[^}]*\}[^}]*?)*\}'

# Pattern to match the entire handleIconDoubleClick function  
pattern2 = r'// Handle double-click to open\s*\nfunction handleIconDoubleClick\(event, itemKey, itemType\) \{[^}]*?(?:\{[^}]*\}[^}]*?)*?\n\}'

# Replace handleIconClick
content = re.sub(pattern1, new_handleIconClick, content, count=1, flags=re.DOTALL)

# Replace handleIconDoubleClick
content = re.sub(pattern2, new_handleIconDoubleClick, content, count=1, flags=re.DOTALL)

# Write back
with open('/Users/marksexton/Desktop/Email-Briefing-App/js/folders-trash.js', 'w') as f:
    f.write(content)

print("✓ Successfully replaced click handlers!")
print("  - handleIconClick: Simplified to selection only")
print("  - handleIconDoubleClick: Removed delays, instant open")
print("\nRefresh your browser to test!")
