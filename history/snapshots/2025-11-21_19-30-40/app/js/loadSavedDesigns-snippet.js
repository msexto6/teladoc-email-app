// Get all folders, designs, and exports
    const allFolders = [];
    const allDesigns = [];
    const allExports = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith('email-folder-') && !key.includes('trashed')) {
            try {
                const folder = JSON.parse(localStorage.getItem(key));
                // Only include folders for designs page
                if (!folder.pageType || folder.pageType === 'designs') {
                    allFolders.push({ key, folder });
                }
            } catch (e) {
                console.error('Error loading folder:', e);
            }
        } else if (key.startsWith('email-export-') && !key.includes('trashed')) {
            try {
                const exportData = JSON.parse(localStorage.getItem(key));
                allExports.push({
                    key: key,
                    name: exportData.projectName || 'Untitled Export',
                    exportType: exportData.exportType,
                    date: exportData.exportDate || 'Unknown date',
                    isExport: true
                });
            } catch (e) {
                console.error('Error loading export:', e);
            }
        } else if (key.startsWith('email-project-') && !key.includes('trashed')) {
            try {
                const project = JSON.parse(localStorage.getItem(key));
                allDesigns.push({
                    key: key,
                    name: project.projectName || 'Untitled',
                    template: project.templateId,
                    date: project.savedDate || 'Unknown date',
                    isExport: false
                });
            } catch (e) {
                console.error('Error loading project:', e);
            }
        }
    }
    
    // Filter items based on current folder
    const currentFolderId = getCurrentFolderId();
    let visibleFolders = [];
    let visibleDesigns = [];
    let visibleExports = [];
    
    if (currentFolderId) {
        // Show items in this folder
        const currentFolder = JSON.parse(localStorage.getItem(currentFolderId));
        if (currentFolder) {
            visibleFolders = allFolders.filter(f => currentFolder.items.includes(f.key));
            visibleDesigns = allDesigns.filter(d => currentFolder.items.includes(d.key));
            visibleExports = allExports.filter(e => currentFolder.items.includes(e.key));
        }
    } else {
        // Show root level items (not in any folder)
        const allFolderItems = new Set();
        allFolders.forEach(f => {
            f.folder.items.forEach(item => allFolderItems.add(item));
        });
        
        visibleFolders = allFolders.filter(f => {
            return !f.folder.parentPath || f.folder.parentPath.length === 0;
        });
        
        visibleDesigns = allDesigns.filter(d => !allFolderItems.has(d.key));
        visibleExports = allExports.filter(e => !allFolderItems.has(e.key));
    }
    
    // Display items
    if (visibleFolders.length === 0 && visibleDesigns.length === 0 && visibleExports.length === 0) {
        grid.innerHTML = '<p class="empty-state">No items here. Create a folder or email!</p>';
    } else {
        grid.innerHTML = '';
        
        // Render folders first
        visibleFolders.forEach(({ key, folder }) => {
            const folderColor = folder.color || 'purple';
            const card = document.createElement('div');
            card.className = 'folder-card';
            card.innerHTML = `
                <div class="folder-card-content">
                    <img src="assets/images/folder-${folderColor}.png" class="folder-icon" alt="Folder">
                    <h3 class="folder-card-title">${folder.name}</h3>
                </div>
            `;
            
            card.addEventListener('click', function() {
                openFolder(key);
            });
            
            card.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                showFolderContextMenu(e, key);
            });
            
            makeDraggable(card, key);
            makeFolderDropTarget(card, key);
            
            grid.appendChild(card);
        });
        
        // Render designs with document icon
        visibleDesigns.forEach(design => {
            const card = document.createElement('div');
            card.className = 'design-card';
            card.innerHTML = `
                <div class="design-card-content">
                    <img src="assets/images/document-icon.png" alt="${design.name}" class="document-icon">
                    <h3 class="design-card-title">${design.name}</h3>
                </div>
            `;
            
            card.addEventListener('click', function() {
                loadDesignFromCard(design.key);
            });
            
            makeDraggable(card, design.key);
            
            grid.appendChild(card);
        });
        
        // Render exports with email icon
        visibleExports.forEach(exportItem => {
            const card = document.createElement('div');
            card.className = 'design-card export-card';
            card.innerHTML = `
                <div class="design-card-content">
                    <img src="assets/images/email-icon.png" alt="${exportItem.name}" class="document-icon">
                    <h3 class="design-card-title">${exportItem.name}</h3>
                    <span class="export-badge">${exportItem.exportType.toUpperCase()}</span>
                </div>
            `;
            
            card.addEventListener('click', function() {
                loadDesignFromCard(exportItem.key);
            });
            
            makeDraggable(card, exportItem.key);
            
            grid.appendChild(card);
        });
    }
    
    updateBreadcrumb();
