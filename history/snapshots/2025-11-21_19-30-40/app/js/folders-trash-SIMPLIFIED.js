// SIMPLIFIED CLICK HANDLERS
// Single click = select
// Double click = open
// Right click = context menu (rename/delete)

// Track clicked items
let selectedItems = new Set();

// Handle icon clicks for selection ONLY
function handleIconClick(event, card, itemKey) {
    event.stopPropagation();
    
    // Clear other selections
    document.querySelectorAll('.design-card.selected, .folder-card.selected').forEach(c => {
        if (c !== card) c.classList.remove('selected');
    });
    selectedItems.clear();
    
    // Select this item
    card.classList.add('selected');
    selectedItems.add(itemKey);
}

// Handle double-click to open - INSTANT, NO DELAYS
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
}
