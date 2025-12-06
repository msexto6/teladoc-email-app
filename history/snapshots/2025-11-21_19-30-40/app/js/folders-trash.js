/**
 * Folders & Trash Management - Firebase Version
 * Handles folder creation, organization, and trash bin functionality
 */

// Current folder path (for navigation)
let currentFolderPath = [];
let selectedFolderColor = 'purple'; // Default color
let currentPageType = 'designs'; // Track which page we're on: 'designs' or 'templates'
let navigationHistory = { page: 'landing', folderPath: [] }; // Track where we came from for back button

// Track clicked items
let selectedItems = new Set();

// ============================================
// FIREBASE HELPER FUNCTIONS (FOLDERS)
// ============================================

async function saveFolderToDB(folderId, folderData) {
    await EmailBriefingDB.saveFolder(folderId, folderData);
}

async function getFolderFromDB(folderId) {
    const folder = await EmailBriefingDB.getFolder(folderId);
    return folder;
}

async function getAllFoldersFromDB() {
    const folders = await EmailBriefingDB.getAllFolders();
    return Array.isArray(folders) ? folders : [];
}

async function deleteFolderFromDB(folderId) {
    await EmailBriefingDB.deleteFolder(folderId);
}

// ============================================
// BREADCRUMB NAVIGATION
// ============================================

function updateBreadcrumb() {
    const templatesTitle = document.querySelector('#masthead-subnav-templates .masthead-subnav-title');
    const myDesignsTitle = document.querySelector('#masthead-subnav-mydesigns .masthead-subnav-title');
    
    // Determine which page is active
    const templatesScreen = document.getElementById('template-selection-screen');
    const myDesignsScreen = document.getElementById('my-designs-screen');
    
    let isTemplatesActive = templatesScreen && templatesScreen.classList.contains('active');
    let isDesignsActive = myDesignsScreen && myDesignsScreen.classList.contains('active');
    
    if (isTemplatesActive && templatesTitle) {
        renderBreadcrumbForElement(templatesTitle, 'Templates');
    } else if (isDesignsActive && myDesignsTitle) {
        renderBreadcrumbForElement(myDesignsTitle, 'My Designs');
    }
}

function renderBreadcrumbForElement(element, rootName) {
    // Clear existing content
    element.innerHTML = '';
    
    // Create root breadcrumb segment
    const rootSegment = document.createElement('span');
    rootSegment.className = 'breadcrumb-segment';
    rootSegment.textContent = rootName;
    rootSegment.onclick = () => navigateToFolder(-1);
    
    // Make root segment a drop target
    makeBreadcrumbDropTarget(rootSegment, null);
    
    element.appendChild(rootSegment);
    
    // Add folder segments
    currentFolderPath.forEach((folder, index) => {
        // Add separator
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.textContent = '>';
        element.appendChild(separator);
        
        // Add folder segment
        const folderSegment = document.createElement('span');
        folderSegment.className = 'breadcrumb-segment';
        folderSegment.textContent = folder.name;
        folderSegment.onclick = () => navigateToFolder(index);
        
        // Make folder segment a drop target
        makeBreadcrumbDropTarget(folderSegment, folder.id);
        
        element.appendChild(folderSegment);
    });
}

function makeBreadcrumbDropTarget(element, targetFolderId) {
    element.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    element.addEventListener('dragleave', function(e) {
        this.classList.remove('drag-over');
    });
    
    element.addEventListener('drop', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
        
        const itemKey = e.dataTransfer.getData('text/plain');
        if (!itemKey) return;
        
        // Don't allow dropping a folder into itself
        if (itemKey === targetFolderId) return;
        
        // If dropping a folder, check if target is a descendant of the dragged folder
        if (itemKey.startsWith('email-folder-')) {
            const isDescendant = await checkIfFolderIsDescendant(itemKey, targetFolderId);
            if (isDescendant) {
                alert('Cannot move a folder into one of its subfolders');
                return;
            }
        }
        
        // Remove from current location
        const currentFolderId = getCurrentFolderId();
        if (currentFolderId) {
            await removeItemFromFolder(currentFolderId, itemKey);
        }
        
        // Remove from all folders
        const allFolders = await getAllFoldersFromDB();
        for (const folder of allFolders) {
            if (folder.items && Array.isArray(folder.items) && folder.items.includes(itemKey)) {
                await removeItemFromFolder(folder.id, itemKey);
            }
        }
        
        // Add to target folder (if not root)
        if (targetFolderId) {
            await addItemToFolder(targetFolderId, itemKey);
        }
        
        // If moving a folder, update its parentPath
        if (itemKey.startsWith('email-folder-')) {
            const folder = await getFolderFromDB(itemKey);
            if (folder) {
                if (targetFolderId) {
                    // Build new parent path based on target folder
                    const targetFolder = await getFolderFromDB(targetFolderId);
                    const targetParentPath = targetFolder.parentPath || [];
                    folder.parentPath = [...targetParentPath, { id: targetFolderId, name: targetFolder.name }];
                } else {
                    // Moving to root
                    folder.parentPath = [];
                }
                await saveFolderToDB(itemKey, folder);
            }
        }
        
        // Refresh appropriate view
        const templatesScreen = document.getElementById('template-selection-screen');
        if (templatesScreen && templatesScreen.classList.contains('active')) {
            await loadTemplateCards();
        } else {
            await loadSavedDesigns();
        }
    });
}

// Check if a folder is a descendant of another (to prevent circular nesting)
async function checkIfFolderIsDescendant(parentFolderId, checkFolderId) {
    if (!checkFolderId) return false; // Root is never a descendant
    
    let currentId = checkFolderId;
    const allFolders = await getAllFoldersFromDB();
    const folderMap = {};
    allFolders.forEach(f => folderMap[f.id] = f);
    
    // Traverse up the parent chain
    let iterations = 0;
    while (currentId && iterations < 100) { // Safety limit
        if (currentId === parentFolderId) return true;
        
        const folder = folderMap[currentId];
        if (!folder || !folder.parentPath || folder.parentPath.length === 0) break;
        
        // Get the parent folder ID from parentPath
        currentId = folder.parentPath[folder.parentPath.length - 1].id;
        iterations++;
    }
    
    return false;
}

// ============================================
// FOLDER MANAGEMENT
// ============================================

function createNewFolder() {
    // Determine which page we're on
    const templatesScreen = document.getElementById('template-selection-screen');
    const myDesignsScreen = document.getElementById('my-designs-screen');
    
    if (templatesScreen && templatesScreen.classList.contains('active')) {
        currentPageType = 'templates';
    } else if (myDesignsScreen && myDesignsScreen.classList.contains('active')) {
        currentPageType = 'designs';
    }
    
    // Reset selection to default
    selectedFolderColor = 'purple';
    
    // Clear input
    const folderNameInput = document.getElementById('folder-name-input');
    if (folderNameInput) {
        folderNameInput.value = '';
    }
    
    // Clear previous selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector('.color-option[data-color="purple"]')?.classList.add('selected');
    
    // Open modal
    const modal = document.getElementById('folder-color-modal');
    if (modal) {
        modal.classList.add('active');
        folderNameInput?.focus();
    }
}

function selectFolderColor(color) {
    selectedFolderColor = color;
    
    // Update selected state visually
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`.color-option[data-color="${color}"]`)?.classList.add('selected');
}

async function saveFolderFromModal() {
    const folderNameInput = document.getElementById('folder-name-input');
    const folderName = folderNameInput?.value.trim();
    
    if (!folderName) {
        alert('Please enter a folder name');
        return;
    }
    
    const folderId = 'email-folder-' + Date.now();
    const folder = {
        name: folderName,
        color: selectedFolderColor,
        pageType: currentPageType,
        parentPath: [...currentFolderPath],
        createdDate: new Date().toISOString(),
        items: []
    };
    
    // Save to Firebase
    await saveFolderToDB(folderId, folder);
    
    // Add folder to current folder if we're inside one
    const currentFolderId = getCurrentFolderId();
    if (currentFolderId) {
        await addItemToFolder(currentFolderId, folderId);
    }
    
    closeFolderColorModal();
    
    // Refresh the appropriate view
    if (currentPageType === 'templates') {
        await loadTemplateCards();
    } else {
        await loadSavedDesigns();
    }
}

function closeFolderColorModal() {
    const modal = document.getElementById('folder-color-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function setupNewFolderButton() {
    const btn = document.getElementById('new-folder-btn');
    const btnTemplates = document.getElementById('new-folder-btn-templates');
    
    if (btn) {
        btn.addEventListener('click', createNewFolder);
    }
    if (btnTemplates) {
        btnTemplates.addEventListener('click', createNewFolder);
    }
}

// OPTIMIZED: No database fetch needed!
async function openFolder(folderId, folderName, folderPageType) {
    // Save navigation state before entering folder
    const templatesScreen = document.getElementById('template-selection-screen');
    if (templatesScreen && templatesScreen.classList.contains('active')) {
        navigationHistory = {
            page: 'template-selection',
            folderPath: [...currentFolderPath]
        };
    } else {
        navigationHistory = {
            page: 'my-designs',
            folderPath: [...currentFolderPath]
        };
    }
    
    // Add folder to path immediately
    currentFolderPath.push({
        id: folderId,
        name: folderName
    });
    
    // Refresh the appropriate view based on folder type
    if (folderPageType === 'templates') {
        await loadTemplateCards();
    } else {
        await loadSavedDesigns();
    }
    
    updateBreadcrumb();
}

async function navigateToFolder(folderIndex) {
    if (folderIndex === -1) {
        // Navigate to root
        currentFolderPath = [];
    } else {
        // Navigate to specific folder in path
        currentFolderPath = currentFolderPath.slice(0, folderIndex + 1);
    }
    
    // Update navigation history
    const templatesScreen = document.getElementById('template-selection-screen');
    if (templatesScreen && templatesScreen.classList.contains('active')) {
        navigationHistory = {
            page: 'template-selection',
            folderPath: [...currentFolderPath]
        };
    } else {
        navigationHistory = {
            page: 'my-designs',
            folderPath: [...currentFolderPath]
        };
    }
    
    // Determine which view to refresh
    if (templatesScreen && templatesScreen.classList.contains('active')) {
        await loadTemplateCards();
    } else {
        await loadSavedDesigns();
    }
    
    updateBreadcrumb();
}

function getCurrentFolderId() {
    if (currentFolderPath.length === 0) return null;
    const lastFolder = currentFolderPath[currentFolderPath.length - 1];
    return lastFolder.id;
}

async function addItemToFolder(folderId, itemKey) {
    const folder = await getFolderFromDB(folderId);
    if (!folder) return;
    
    // Ensure items array exists
    if (!folder.items) folder.items = [];
    
    if (!folder.items.includes(itemKey)) {
        folder.items.push(itemKey);
        await saveFolderToDB(folderId, folder);
    }
}

async function removeItemFromFolder(folderId, itemKey) {
    const folder = await getFolderFromDB(folderId);
    if (!folder) return;
    
    // Ensure items array exists
    if (!folder.items) folder.items = [];
    
    folder.items = folder.items.filter(item => item !== itemKey);
    await saveFolderToDB(folderId, folder);
}

async function deleteFolder(folderId) {
    if (!confirm('Delete this folder and all its contents?')) return;
    
    const folder = await getFolderFromDB(folderId);
    if (!folder) return;
    
    // Ensure items array exists
    const items = folder.items || [];
    
    // Move all items to trash
    for (const itemKey of items) {
        await moveToTrash(itemKey);
    }
    
    // Move folder itself to trash
    await EmailBriefingDB.saveMeta('trashed-folder-' + Date.now(), folder);
    await deleteFolderFromDB(folderId);
    
    // If we're inside this folder, go back to root
    if (getCurrentFolderId() === folderId) {
        currentFolderPath = [];
    }
    
    // Refresh appropriate view
    if (folder.pageType === 'templates') {
        await loadTemplateCards();
    } else {
        await loadSavedDesigns();
    }
    updateTrashCount();
    updateBreadcrumb();
}

async function renameFolder(folderId) {
    const folder = await getFolderFromDB(folderId);
    if (!folder) return;
    
    const newName = prompt('Enter new folder name:', folder.name);
    if (!newName || newName.trim() === '') return;
    
    folder.name = newName.trim();
    await saveFolderToDB(folderId, folder);
    
    // Update current path if this folder is in it
    currentFolderPath = currentFolderPath.map(item => {
        if (item.id === folderId) {
            return { ...item, name: newName.trim() };
        }
        return item;
    });
    
    // Refresh appropriate view
    if (folder.pageType === 'templates') {
        await loadTemplateCards();
    } else {
        await loadSavedDesigns();
    }
    
    updateBreadcrumb();
}

async function renameDesign(itemKey) {
    const dataStr = await dbGet(itemKey);
    if (!dataStr) return;
    
    const design = JSON.parse(dataStr);
    const newName = prompt('Enter new name:', design.projectName);
    if (!newName || newName.trim() === '') return;
    
    design.projectName = newName.trim();
    await dbSave(itemKey, JSON.stringify(design));
    
    // Refresh view
    await loadSavedDesigns();
}

// Handle icon clicks for selection only
function handleIconClick(event, card, itemKey) {
    event.stopPropagation();
    
    // Clear other selections
    document.querySelectorAll('.design-card.selected, .folder-card.selected').forEach(c => {
        if (c !== card) c.classList.remove('selected');
    });
    selectedItems.clear();
    
    // Toggle selection on this item
    if (card.classList.contains('selected')) {
        card.classList.remove('selected');
    } else {
        card.classList.add('selected');
        selectedItems.add(itemKey);
    }
}

// Handle double-click to open - NOW WITH FOLDER DATA
function handleIconDoubleClick(event, itemKey, itemType, itemName, itemPageType) {
    event.stopPropagation();
    
    if (itemType === 'folder') {
        openFolder(itemKey, itemName, itemPageType);
    } else if (itemType === 'design') {
        loadDesignFromCard(itemKey);
    } else if (itemType === 'export') {
        downloadExportFile(itemKey);
    } else if (itemType === 'template') {
        const templateId = itemKey.replace('template-', '');
        selectTemplate(templateId);
    }
}

// ============================================
// TEMPLATE CARDS WITH FOLDERS
// ============================================

async function loadTemplateCards() {
    const grid = document.getElementById('template-cards-grid');
    if (!grid) return;
    
    const currentFolderId = getCurrentFolderId();
    
    // Clear grid
    grid.innerHTML = '';
    
    // 1. Get all user-created folders for templates
    const allFolders = await getAllFoldersFromDB();
    const templateFolders = allFolders.filter(f => f.pageType === 'templates');
    
    // 2. Determine which folders to show
    let visibleFolders = [];
    if (currentFolderId) {
        const currentFolder = await getFolderFromDB(currentFolderId);
        if (currentFolder && Array.isArray(currentFolder.items)) {
            visibleFolders = templateFolders.filter(f => currentFolder.items.includes(f.id));
        }
        
        // Also check parentPath
        const subFolders = templateFolders.filter(f => {
            const parentPath = f.parentPath || [];
            return parentPath.some(p => p.id === currentFolderId);
        });
        subFolders.forEach(f => {
            if (!visibleFolders.find(vf => vf.id === f.id)) {
                visibleFolders.push(f);
            }
        });
    } else {
        visibleFolders = templateFolders.filter(f => {
            return !f.parentPath || f.parentPath.length === 0;
        });
    }
    
    // 3. Render folders with folder data
    visibleFolders.forEach(folder => {
        const folderColor = folder.color || 'purple';
        const card = document.createElement('div');
        card.className = 'folder-card';
        card.innerHTML = `
            <div class="folder-card-content">
                <img src="assets/images/folder-${folderColor}.png" class="folder-icon" alt="Folder">
                <h3 class="folder-card-title">${folder.name}</h3>
            </div>
        `;
        
        card.addEventListener('click', function(e) {
            handleIconClick(e, card, folder.id);
        });
        
        // PASS FOLDER DATA TO AVOID DATABASE FETCH
        card.addEventListener('dblclick', function(e) {
            handleIconDoubleClick(e, folder.id, 'folder', folder.name, folder.pageType);
        });
        
        card.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showFolderContextMenu(e, folder.id);
        });
        
        makeDraggable(card, folder.id);
        makeFolderDropTarget(card, folder.id);
        
        grid.appendChild(card);
    });
    
    // 4. Determine which templates to show
    const templatesInFolders = new Set();
    templateFolders.forEach(f => {
        const items = f.items || [];
        items.forEach(item => {
            if (item.startsWith('template-')) {
                templatesInFolders.add(item);
            }
        });
    });
    
    let visibleTemplates = [];
    if (currentFolderId) {
        const currentFolder = await getFolderFromDB(currentFolderId);
        if (currentFolder && Array.isArray(currentFolder.items)) {
            currentFolder.items.forEach(itemKey => {
                if (itemKey.startsWith('template-')) {
                    const templateId = itemKey.replace('template-', '');
                    if (templates[templateId]) {
                        visibleTemplates.push(templateId);
                    }
                }
            });
        }
    } else {
        Object.keys(templates).forEach(templateId => {
            const templateKey = 'template-' + templateId;
            if (!templatesInFolders.has(templateKey)) {
                visibleTemplates.push(templateId);
            }
        });
    }
    
    // 5. Render template cards
    visibleTemplates.forEach(templateId => {
        const template = templates[templateId];
        const templateKey = 'template-' + templateId;
        
        const card = document.createElement('div');
        card.className = 'template-card design-card';
        card.innerHTML = `
            <div class="template-card-content design-card-content">
                <img src="assets/images/template-icon.png" alt="${template.name}" class="document-icon">
                <h3 class="template-card-title design-card-title">${template.name}</h3>
            </div>
        `;
        
        card.addEventListener('click', function(e) {
            handleIconClick(e, card, templateKey);
        });
        
        card.addEventListener('dblclick', function(e) {
            handleIconDoubleClick(e, templateKey, 'template');
        });
        
        makeDraggable(card, templateKey);
        
        grid.appendChild(card);
    });
    
    updateBreadcrumb();
}

// ============================================
// TRASH BIN FUNCTIONALITY
// ============================================

function setupTrashBin() {
    const trashBin = document.getElementById('trash-bin');
    const trashBinTemplates = document.getElementById('trash-bin-templates');
    
    [trashBin, trashBinTemplates].forEach(bin => {
        if (!bin) return;
        
        bin.addEventListener('dblclick', openTrashModal);
        
        bin.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
            this.style.transform = 'scale(1.15)';
        });
        
        bin.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over');
            this.style.transform = '';
        });
        
        bin.addEventListener('drop', async function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            this.style.transform = '';
            
            const itemKey = e.dataTransfer.getData('text/plain');
            if (itemKey) {
                if (itemKey.startsWith('template-')) {
                    alert('System templates cannot be deleted. You can only move them into folders.');
                    return;
                }
                await moveToTrash(itemKey);
            }
        });
    });
    
    updateTrashCount();
}

async function moveToTrash(itemKey) {
    // Check if item is a folder
    if (itemKey.startsWith('email-folder-')) {
        const folder = await getFolderFromDB(itemKey);
        if (!folder) return;
        
        // Ensure items array exists
        const items = folder.items || [];
        
        // Move all items to trash recursively
        for (const subItemKey of items) {
            await moveToTrash(subItemKey);
        }
        
        // Move folder itself to trash
        await EmailBriefingDB.saveMeta('trashed-folder-' + Date.now(), folder);
        await deleteFolderFromDB(itemKey);
    } else {
        // It's a design or export
        const dataStr = await dbGet(itemKey);
        if (!dataStr) {
            // Check if it's an export
            const exportData = await EmailBriefingDB.getExport(itemKey);
            if (exportData) {
                await EmailBriefingDB.saveMeta('trashed-' + itemKey, JSON.stringify(exportData));
                await EmailBriefingDB.deleteExport(itemKey);
            }
            return;
        }
        
        // Move to trash
        await EmailBriefingDB.saveMeta('trashed-' + itemKey, dataStr);
        await dbDelete(itemKey);
    }
    
    // Remove from any folder
    const currentFolder = getCurrentFolderId();
    if (currentFolder) {
        await removeItemFromFolder(currentFolder, itemKey);
    }
    
    // Remove from all folders
    const allFolders = await getAllFoldersFromDB();
    for (const folder of allFolders) {
        const items = folder.items || [];
        if (items.includes(itemKey)) {
            await removeItemFromFolder(folder.id, itemKey);
        }
    }
    
    // Refresh appropriate view
    const templatesScreen = document.getElementById('template-selection-screen');
    if (templatesScreen && templatesScreen.classList.contains('active')) {
        await loadTemplateCards();
    } else {
        await loadSavedDesigns();
    }
    updateTrashCount();
}

async function updateTrashCount() {
    // Implementation simplified - count trash items from metadata
    // You can implement full trash counting later if needed
    const countBadges = document.querySelectorAll('.trash-count');
    countBadges.forEach(badge => badge.style.display = 'none');
}

function openTrashModal() {
    const modal = document.getElementById('trash-modal');
    if (!modal) return;
    
    const itemsGrid = document.getElementById('trash-items-grid');
    itemsGrid.innerHTML = `
        <div class="trash-empty-state">
            <svg viewBox="0 0 24 24">
                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
            </svg>
            <p>Trash is empty</p>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeTrashModal() {
    const modal = document.getElementById('trash-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// CONTEXT MENUS
// ============================================

function showFolderContextMenu(event, folderId) {
    const existingMenu = document.querySelector('.folder-context-menu');
    if (existingMenu) existingMenu.remove();
    
    const menu = document.createElement('div');
    menu.className = 'folder-context-menu';
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    
    menu.innerHTML = `
        <div class="context-menu-item" onclick="renameFolder('${folderId}')">Rename</div>
        <div class="context-menu-item danger" onclick="deleteFolder('${folderId}')">Delete</div>
    `;
    
    document.body.appendChild(menu);
    
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 10);
}

function showDesignContextMenu(event, itemKey, itemType) {
    const existingMenu = document.querySelector('.folder-context-menu');
    if (existingMenu) existingMenu.remove();
    
    const menu = document.createElement('div');
    menu.className = 'folder-context-menu';
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    
    let menuHTML = '';
    
    // Only show Rename for designs (not exports)
    if (itemType === 'design') {
        menuHTML += `<div class="context-menu-item" onclick="renameDesign('${itemKey}')">Rename</div>`;
    }
    
    menuHTML += `<div class="context-menu-item danger" onclick="deleteItemDirectly('${itemKey}')">Delete</div>`;
    
    menu.innerHTML = menuHTML;
    
    document.body.appendChild(menu);
    
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 10);
}

async function deleteItemDirectly(itemKey) {
    if (!confirm('Delete this item?')) return;
    await moveToTrash(itemKey);
}

// ============================================
// DRAG AND DROP
// ============================================

function makeDraggable(element, itemKey) {
    element.draggable = true;
    element.classList.add('draggable');
    
    element.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', itemKey);
        this.classList.add('dragging');
    });
    
    element.addEventListener('dragend', function(e) {
        this.classList.remove('dragging');
    });
}

function makeFolderDropTarget(element, folderId) {
    element.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    element.addEventListener('dragleave', function(e) {
        this.classList.remove('drag-over');
    });
    
    element.addEventListener('drop', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove('drag-over');
        
        const itemKey = e.dataTransfer.getData('text/plain');
        if (itemKey && itemKey !== folderId) {
            // If dropping a folder, check if target is a descendant
            if (itemKey.startsWith('email-folder-')) {
                const isDescendant = await checkIfFolderIsDescendant(itemKey, folderId);
                if (isDescendant) {
                    alert('Cannot move a folder into one of its subfolders');
                    return;
                }
            }
            
            // Remove from current folder
            const currentFolder = getCurrentFolderId();
            if (currentFolder) {
                await removeItemFromFolder(currentFolder, itemKey);
            }
            
            // Remove from all folders
            const allFolders = await getAllFoldersFromDB();
            for (const folder of allFolders) {
                const items = folder.items || [];
                if (items.includes(itemKey)) {
                    await removeItemFromFolder(folder.id, itemKey);
                }
            }
            
            // Add to target folder
            await addItemToFolder(folderId, itemKey);
            
            // If moving a folder, update its parentPath
            if (itemKey.startsWith('email-folder-')) {
                const draggedFolder = await getFolderFromDB(itemKey);
                if (draggedFolder) {
                    const targetFolder = await getFolderFromDB(folderId);
                    const targetParentPath = targetFolder.parentPath || [];
                    draggedFolder.parentPath = [...targetParentPath, { id: folderId, name: targetFolder.name }];
                    await saveFolderToDB(itemKey, draggedFolder);
                }
            }
            
            // Refresh appropriate view
            const templatesScreen = document.getElementById('template-selection-screen');
            if (templatesScreen && templatesScreen.classList.contains('active')) {
                await loadTemplateCards();
            } else {
                await loadSavedDesigns();
            }
        }
    });
}

// ============================================
// LOAD SAVED DESIGNS (WITH FIREBASE)
// ============================================

async function loadSavedDesigns() {
    const grid = document.getElementById('saved-designs-grid');
    if (!grid) return;
    
    try {
        // Get all folders, designs, and exports from Firebase
        const allFolders = await getAllFoldersFromDB();
        const allDesigns = await EmailBriefingDB.getAllDesigns();
        const allExports = await EmailBriefingDB.getAllExports();
        
        // Ensure we have arrays (defensive checks)
        const safeFolders = Array.isArray(allFolders) ? allFolders : [];
        const safeDesigns = Array.isArray(allDesigns) ? allDesigns : [];
        const safeExports = Array.isArray(allExports) ? allExports : [];
        
        console.log('📂 Loaded:', safeFolders.length, 'folders,', safeDesigns.length, 'designs,', safeExports.length, 'exports');
        
        // Filter for designs page folders
        const designFolders = safeFolders.filter(f => !f.pageType || f.pageType === 'designs');
        
        // Filter items based on current folder
        const currentFolderId = getCurrentFolderId();
        let visibleFolders = [];
        let visibleDesigns = [];
        let visibleExports = [];
        
        if (currentFolderId) {
            const currentFolder = await getFolderFromDB(currentFolderId);
            if (currentFolder && Array.isArray(currentFolder.items)) {
                visibleFolders = designFolders.filter(f => currentFolder.items.includes(f.id));
                visibleDesigns = safeDesigns.filter(d => currentFolder.items.includes(d.id));
                visibleExports = safeExports.filter(e => currentFolder.items.includes(e.id));
            }
            
            // Also check parentPath for folders
            const subFolders = designFolders.filter(f => {
                const parentPath = f.parentPath || [];
                return parentPath.some(p => p.id === currentFolderId);
            });
            subFolders.forEach(f => {
                if (!visibleFolders.find(vf => vf.id === f.id)) {
                    visibleFolders.push(f);
                }
            });
        } else {
            // Show root level items
            const allFolderItems = new Set();
            designFolders.forEach(f => {
                const items = f.items || [];
                items.forEach(item => allFolderItems.add(item));
            });
            
            visibleFolders = designFolders.filter(f => {
                return !f.parentPath || f.parentPath.length === 0;
            });
            
            visibleDesigns = safeDesigns.filter(d => !allFolderItems.has(d.id));
            visibleExports = safeExports.filter(e => !allFolderItems.has(e.id));
        }
        
        // Display items
        if (visibleFolders.length === 0 && visibleDesigns.length === 0 && visibleExports.length === 0) {
            grid.innerHTML = '<p class="empty-state">No items here. Create a folder or email!</p>';
        } else {
            grid.innerHTML = '';
            
            // Render folders with folder data
            visibleFolders.forEach(folder => {
                const folderColor = folder.color || 'purple';
                const card = document.createElement('div');
                card.className = 'folder-card';
                card.innerHTML = `
                    <div class="folder-card-content">
                        <img src="assets/images/folder-${folderColor}.png" class="folder-icon" alt="Folder">
                        <h3 class="folder-card-title">${folder.name}</h3>
                    </div>
                `;
                
                card.addEventListener('click', function(e) {
                    handleIconClick(e, card, folder.id);
                });
                
                // PASS FOLDER DATA TO AVOID DATABASE FETCH
                card.addEventListener('dblclick', function(e) {
                    handleIconDoubleClick(e, folder.id, 'folder', folder.name, folder.pageType);
                });
                
                card.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    showFolderContextMenu(e, folder.id);
                });
                
                makeDraggable(card, folder.id);
                makeFolderDropTarget(card, folder.id);
                
                grid.appendChild(card);
            });
            
            // Render designs
            visibleDesigns.forEach(design => {
                const card = document.createElement('div');
                card.className = 'design-card';
                card.innerHTML = `
                    <div class="design-card-content">
                        <img src="assets/images/document-icon.png" alt="${design.projectName}" class="document-icon">
                        <h3 class="design-card-title">${design.projectName}</h3>
                    </div>
                `;
                
                card.addEventListener('click', function(e) {
                    handleIconClick(e, card, design.id);
                });
                
                card.addEventListener('dblclick', function(e) {
                    handleIconDoubleClick(e, design.id, 'design');
                });
                
                card.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    showDesignContextMenu(e, design.id, 'design');
                });
                
                makeDraggable(card, design.id);
                
                grid.appendChild(card);
            });
            
            // Render exports
            visibleExports.forEach(exportItem => {
                const card = document.createElement('div');
                card.className = 'design-card export-card';
                card.innerHTML = `
                    <div class="design-card-content">
                        <img src="assets/images/zip-icon.png" alt="${exportItem.projectName}" class="document-icon">
                        <h3 class="design-card-title">${exportItem.projectName}</h3>
                    </div>
                `;
                
                card.addEventListener('click', function(e) {
                    handleIconClick(e, card, exportItem.id);
                });
                
                card.addEventListener('dblclick', function(e) {
                    handleIconDoubleClick(e, exportItem.id, 'export');
                });
                
                card.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    showDesignContextMenu(e, exportItem.id, 'export');
                });
                
                makeDraggable(card, exportItem.id);
                
                grid.appendChild(card);
            });
        }
        
        updateBreadcrumb();
    } catch (error) {
        console.error('✗ Error loading saved designs:', error);
        grid.innerHTML = '<p class="empty-state">Error loading designs. Please refresh the page.</p>';
    }
}

// Initialize folder and trash functionality
document.addEventListener('DOMContentLoaded', function() {
    setupTrashBin();
    setupNewFolderButton();
    updateBreadcrumb();
});
