// Folder hierarchy management for Save, Save As, and Export modals
// Handles folder tree display, expansion/collapse, and selection
// UPDATED: Now uses IndexedDB instead of localStorage

// ============================================
// GLOBAL VARIABLES FOR FOLDER SELECTION TRACKING
// ============================================

let selectedSaveFolder = null;       // Track which folder is selected for saving
let selectedSaveAsFolder = null;     // Track which folder is selected for "Save As"
let selectedExportFolder = null;     // Track which folder is selected for export

// ============================================
// SHARED UTILITY FUNCTIONS
// ============================================

function checkForSubfolders(parentId, allFolders) {
    return allFolders.some(f => {
        const parentPath = f.parentPath || [];
        return parentPath.some(p => p.id === parentId);
    });
}

function removeSubfolders(parentId, hierarchyDivId) {
    const hierarchyDiv = document.getElementById(hierarchyDivId);
    const items = Array.from(hierarchyDiv.querySelectorAll('.folder-hierarchy-item'));

    // Find all items that should be removed (children of parentId)
    items.forEach(item => {
        if (item.dataset.parentFolderId === parentId) {
            // Also remove its children recursively
            removeSubfolders(item.dataset.folderId, hierarchyDivId);
            item.remove();
        }
    });
}

async function addSubfolders(parentId, parentElement, hierarchyDivId) {
    const hierarchyDiv = document.getElementById(hierarchyDivId);

    // Get all folders from IndexedDB
    const allFolders = await EmailBriefingDB.getAllFolders();
    const folders = allFolders.filter(f => f.pageType !== 'templates');

    // Find subfolders
    const subfolders = folders.filter(f => {
        const parentPath = f.parentPath || [];
        return parentPath.some(p => p.id === parentId);
    });

    // Sort by name
    subfolders.sort((a, b) => a.name.localeCompare(b.name));

    // Get parent level
    const parentLevel = parseInt(parentElement.dataset.level);
    const newLevel = parentLevel + 1;

    // Insert subfolders after parent
    const parentIndex = Array.from(hierarchyDiv.children).indexOf(parentElement);

    // Determine which creation function to use
    let creationFunction;
    if (hierarchyDivId === 'folder-hierarchy') {
        creationFunction = createFolderHierarchyItem;
    } else if (hierarchyDivId === 'folder-hierarchy-saveas') {
        creationFunction = createFolderHierarchyItemSaveAs;
    } else if (hierarchyDivId === 'folder-hierarchy-export') {
        creationFunction = createFolderHierarchyItemExport;
    }

    subfolders.forEach((folder, index) => {
        const folderItem = creationFunction(folder.id, folder, newLevel, folders);
        folderItem.dataset.parentFolderId = parentId;

        // Insert at the correct position
        const insertIndex = parentIndex + 1 + index;
        if (insertIndex < hierarchyDiv.children.length) {
            hierarchyDiv.insertBefore(folderItem, hierarchyDiv.children[insertIndex]);
        } else {
            hierarchyDiv.appendChild(folderItem);
        }
    });
}

// ============================================
// SAVE MODAL FOLDER HIERARCHY
// ============================================

async function populateFolderHierarchy() {
    const hierarchyDiv = document.getElementById('folder-hierarchy');
    if (!hierarchyDiv) return;

    hierarchyDiv.innerHTML = '';
    selectedSaveFolder = null; // Reset selection

    // Add root level option
    const rootItem = document.createElement('div');
    rootItem.className = 'folder-hierarchy-item selected'; // Default to root selected
    rootItem.innerHTML = '<span>📁 My Designs (Root)</span>';
    rootItem.onclick = () => selectSaveFolder(null, rootItem);
    hierarchyDiv.appendChild(rootItem);

    // Get all folders from IndexedDB - exclude 'templates' folders
    const allFolders = await EmailBriefingDB.getAllFolders();
    const folders = allFolders.filter(f => f.pageType !== 'templates');

    // Sort folders by name
    folders.sort((a, b) => a.name.localeCompare(b.name));

    // Add root level folders only (collapsed by default)
    const rootFolders = folders.filter(f =>
        !f.parentPath || f.parentPath.length === 0
    );

    rootFolders.forEach(folder => {
        const folderItem = createFolderHierarchyItem(folder.id, folder, 0, folders);
        hierarchyDiv.appendChild(folderItem);
    });
}

function createFolderHierarchyItem(folderId, folder, level, allFolders) {
    const item = document.createElement('div');
    item.className = 'folder-hierarchy-item';
    item.dataset.folderId = folderId;
    item.dataset.level = level;

    if (level === 1) item.className += ' nested';
    if (level === 2) item.className += ' double-nested';

    const folderColor = folder.color || 'purple';

    // Check if this folder has subfolders
    const hasSubfolders = checkForSubfolders(folderId, allFolders);

    // Add carat if there are subfolders
    const carat = hasSubfolders ?
        '<span class="folder-carat" onclick="event.stopPropagation(); toggleFolderExpansion(event, \'' + folderId + '\');">▶</span>' :
        '<span class="folder-carat-placeholder"></span>';

    item.innerHTML = `
        ${carat}
        <img src="assets/images/folder-${folderColor}.png" class="folder-hierarchy-icon" alt="Folder">
        <span>${folder.name}</span>
    `;

    item.onclick = (e) => {
        if (!e.target.classList.contains('folder-carat')) {
            selectSaveFolder(folderId, item);
        }
    };

    return item;
}

function selectSaveFolder(folderId, element) {
    // Remove previous selection
    document.querySelectorAll('#folder-hierarchy .folder-hierarchy-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Add selection to clicked item
    element.classList.add('selected');
    selectedSaveFolder = folderId;
}

function toggleFolderExpansion(event, folderId) {
    event.stopPropagation();
    const carat = event.target;
    const parentItem = carat.closest('.folder-hierarchy-item');

    // Check if already expanded
    const isExpanded = carat.classList.contains('expanded');

    if (isExpanded) {
        // Collapse: Remove all subfolders
        carat.classList.remove('expanded');
        carat.textContent = '▶';
        removeSubfolders(folderId, 'folder-hierarchy');
    } else {
        // Expand: Add subfolders
        carat.classList.add('expanded');
        carat.textContent = '▼';
        addSubfolders(folderId, parentItem, 'folder-hierarchy');
    }
}

// ============================================
// SAVE AS MODAL FOLDER HIERARCHY
// ============================================

async function populateFolderHierarchySaveAs() {
    const hierarchyDiv = document.getElementById('folder-hierarchy-saveas');
    if (!hierarchyDiv) return;

    hierarchyDiv.innerHTML = '';
    selectedSaveAsFolder = null; // Reset selection

    // Add root level option
    const rootItem = document.createElement('div');
    rootItem.className = 'folder-hierarchy-item selected'; // Default to root selected
    rootItem.innerHTML = '<span>📁 My Designs (Root)</span>';
    rootItem.onclick = () => selectSaveAsFolder(null, rootItem);
    hierarchyDiv.appendChild(rootItem);

    // Get all folders from IndexedDB - exclude 'templates' folders
    const allFolders = await EmailBriefingDB.getAllFolders();
    const folders = allFolders.filter(f => f.pageType !== 'templates');

    // Sort folders by name
    folders.sort((a, b) => a.name.localeCompare(b.name));

    // Add root level folders only (collapsed by default)
    const rootFolders = folders.filter(f =>
        !f.parentPath || f.parentPath.length === 0
    );

    rootFolders.forEach(folder => {
        const folderItem = createFolderHierarchyItemSaveAs(folder.id, folder, 0, folders);
        hierarchyDiv.appendChild(folderItem);
    });
}

function createFolderHierarchyItemSaveAs(folderId, folder, level, allFolders) {
    const item = document.createElement('div');
    item.className = 'folder-hierarchy-item';
    item.dataset.folderId = folderId;
    item.dataset.level = level;

    if (level === 1) item.className += ' nested';
    if (level === 2) item.className += ' double-nested';

    const folderColor = folder.color || 'purple';

    // Check if this folder has subfolders
    const hasSubfolders = checkForSubfolders(folderId, allFolders);

    // Add carat if there are subfolders
    const carat = hasSubfolders ?
        '<span class="folder-carat" onclick="event.stopPropagation(); toggleFolderExpansionSaveAs(event, \'' + folderId + '\');">▶</span>' :
        '<span class="folder-carat-placeholder"></span>';

    item.innerHTML = `
        ${carat}
        <img src="assets/images/folder-${folderColor}.png" class="folder-hierarchy-icon" alt="Folder">
        <span>${folder.name}</span>
    `;

    item.onclick = (e) => {
        if (!e.target.classList.contains('folder-carat')) {
            selectSaveAsFolder(folderId, item);
        }
    };

    return item;
}

function selectSaveAsFolder(folderId, element) {
    // Remove previous selection
    document.querySelectorAll('#folder-hierarchy-saveas .folder-hierarchy-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Add selection to clicked item
    element.classList.add('selected');
    selectedSaveAsFolder = folderId;
}

function toggleFolderExpansionSaveAs(event, folderId) {
    event.stopPropagation();
    const carat = event.target;
    const parentItem = carat.closest('.folder-hierarchy-item');

    // Check if already expanded
    const isExpanded = carat.classList.contains('expanded');

    if (isExpanded) {
        // Collapse: Remove all subfolders
        carat.classList.remove('expanded');
        carat.textContent = '▶';
        removeSubfolders(folderId, 'folder-hierarchy-saveas');
    } else {
        // Expand: Add subfolders
        carat.classList.add('expanded');
        carat.textContent = '▼';
        addSubfolders(folderId, parentItem, 'folder-hierarchy-saveas');
    }
}

// ============================================
// EXPORT MODAL FOLDER HIERARCHY
// ============================================

async function populateFolderHierarchyExport() {
    const hierarchyDiv = document.getElementById('folder-hierarchy-export');
    if (!hierarchyDiv) return;

    hierarchyDiv.innerHTML = '';
    selectedExportFolder = null; // Reset selection

    // Add root level option
    const rootItem = document.createElement('div');
    rootItem.className = 'folder-hierarchy-item selected'; // Default to root selected
    rootItem.innerHTML = '<span>📁 My Designs (Root)</span>';
    rootItem.onclick = () => selectExportFolder(null, rootItem);
    hierarchyDiv.appendChild(rootItem);

    // Get all folders from IndexedDB - exclude 'templates' folders
    const allFolders = await EmailBriefingDB.getAllFolders();
    const folders = allFolders.filter(f => f.pageType !== 'templates');

    // Sort folders by name
    folders.sort((a, b) => a.name.localeCompare(b.name));

    // Add root level folders only (collapsed by default)
    const rootFolders = folders.filter(f =>
        !f.parentPath || f.parentPath.length === 0
    );

    rootFolders.forEach(folder => {
        const folderItem = createFolderHierarchyItemExport(folder.id, folder, 0, folders);
        hierarchyDiv.appendChild(folderItem);
    });
}

function createFolderHierarchyItemExport(folderId, folder, level, allFolders) {
    const item = document.createElement('div');
    item.className = 'folder-hierarchy-item';
    item.dataset.folderId = folderId;
    item.dataset.level = level;

    if (level === 1) item.className += ' nested';
    if (level === 2) item.className += ' double-nested';

    const folderColor = folder.color || 'purple';

    // Check if this folder has subfolders
    const hasSubfolders = checkForSubfolders(folderId, allFolders);

    // Add carat if there are subfolders
    const carat = hasSubfolders ?
        '<span class="folder-carat" onclick="event.stopPropagation(); toggleFolderExpansionExport(event, \'' + folderId + '\');">▶</span>' :
        '<span class="folder-carat-placeholder"></span>';

    item.innerHTML = `
        ${carat}
        <img src="assets/images/folder-${folderColor}.png" class="folder-hierarchy-icon" alt="Folder">
        <span>${folder.name}</span>
    `;

    item.onclick = (e) => {
        if (!e.target.classList.contains('folder-carat')) {
            selectExportFolder(folderId, item);
        }
    };

    return item;
}

function selectExportFolder(folderId, element) {
    // Remove previous selection
    document.querySelectorAll('#folder-hierarchy-export .folder-hierarchy-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Add selection to clicked item
    element.classList.add('selected');
    selectedExportFolder = folderId;
}

function toggleFolderExpansionExport(event, folderId) {
    event.stopPropagation();
    const carat = event.target;
    const parentItem = carat.closest('.folder-hierarchy-item');

    // Check if already expanded
    const isExpanded = carat.classList.contains('expanded');

    if (isExpanded) {
        // Collapse: Remove all subfolders
        carat.classList.remove('expanded');
        carat.textContent = '▶';
        removeSubfolders(folderId, 'folder-hierarchy-export');
    } else {
        // Expand: Add subfolders
        carat.classList.add('expanded');
        carat.textContent = '▼';
        addSubfolders(folderId, parentItem, 'folder-hierarchy-export');
    }
}
