// ==================================================
// EXPORT MODAL FIXES FOR app-save-load.js
// ==================================================
// Add these functions to app-save-load.js

// ADD THIS SECTION AFTER THE GLOBAL VARIABLES (around line 4)
// ==================================================

let selectedExportFolder = null;

function openExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) {
        populateFolderHierarchyExport();
        modal.classList.add('active');
    }
}

function closeExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function populateFolderHierarchyExport() {
    const hierarchyDiv = document.getElementById('folder-hierarchy-export');
    if (!hierarchyDiv) return;
    
    hierarchyDiv.innerHTML = '';
    selectedExportFolder = null;
    
    const rootItem = document.createElement('div');
    rootItem.className = 'folder-hierarchy-item selected';
    rootItem.innerHTML = '<span>📁 My Designs (Root)</span>';
    rootItem.onclick = () => selectExportFolder(null, rootItem);
    hierarchyDiv.appendChild(rootItem);
    
    const folders = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('email-folder-') && !key.includes('trashed')) {
            try {
                const folder = JSON.parse(localStorage.getItem(key));
                if (folder.pageType !== 'templates') {
                    folders.push({ key, folder });
                }
            } catch (e) {
                console.error('Error loading folder:', e);
            }
        }
    }
    
    folders.sort((a, b) => a.folder.name.localeCompare(b.folder.name));
    
    const rootFolders = folders.filter(f => 
        !f.folder.parentPath || f.folder.parentPath.length === 0
    );
    
    rootFolders.forEach(({ key, folder }) => {
        const folderItem = createFolderHierarchyItemExport(key, folder, 0, folders);
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
    
    const hasSubfolders = checkForSubfolders(folderId, allFolders);
    
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
    document.querySelectorAll('#folder-hierarchy-export .folder-hierarchy-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    element.classList.add('selected');
    selectedExportFolder = folderId;
}

function toggleFolderExpansionExport(event, folderId) {
    event.stopPropagation();
    const carat = event.target;
    const parentItem = carat.closest('.folder-hierarchy-item');
    
    const isExpanded = carat.classList.contains('expanded');
    
    if (isExpanded) {
        carat.classList.remove('expanded');
        carat.textContent = '▶';
        removeSubfolders(folderId, 'folder-hierarchy-export');
    } else {
        carat.classList.add('expanded');
        carat.textContent = '▼';
        addSubfolders(folderId, parentItem, 'folder-hierarchy-export');
    }
}

// ==================================================
// UPDATE THE addSubfolders FUNCTION
// ==================================================
// Find the addSubfolders function and UPDATE this section:
// Change the line that says:
//   const creationFunction = hierarchyDivId === 'folder-hierarchy' ? 
//       createFolderHierarchyItem : 
//       createFolderHierarchyItemSaveAs;
//
// TO THIS:

    let creationFunction;
    if (hierarchyDivId === 'folder-hierarchy') {
        creationFunction = createFolderHierarchyItem;
    } else if (hierarchyDivId === 'folder-hierarchy-saveas') {
        creationFunction = createFolderHierarchyItemSaveAs;
    } else if (hierarchyDivId === 'folder-hierarchy-export') {
        creationFunction = createFolderHierarchyItemExport;
    }


// ==================================================
// FIX THE CANVAS TAINTING ERROR
// ==================================================
// In the exportAsExcel() function, find this line:
//   const canvas = await html2canvas(clonedPreview, {
//       scale: 2,
//       allowTaint: true,
//       logging: false,
//       backgroundColor: '#ffffff'
//   });
//
// REPLACE IT WITH:

const canvas = await html2canvas(clonedPreview, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: '#ffffff'
});


// ==================================================
// FIX THE EXPORT FOLDER SAVE LOGIC
// ==================================================
// In exportAsExcel(), find the section that says:
//   // Add to same folder as original project
//   if (typeof navigationHistory !== 'undefined' && typeof getCurrentFolderId === 'function') {
//       const currentFolderId = getCurrentFolderId();
//       if (currentFolderId && typeof addItemToFolder === 'function') {
//           addItemToFolder(currentFolderId, exportKey);
//       }
//   }
//
// REPLACE IT WITH:

// Add to selected export folder
if (selectedExportFolder && typeof addItemToFolder === 'function') {
    addItemToFolder(selectedExportFolder, exportKey);
} else if (typeof navigationHistory !== 'undefined' && typeof getCurrentFolderId === 'function') {
    // Fallback: Add to current folder if no folder selected
    const currentFolderId = getCurrentFolderId();
    if (currentFolderId && typeof addItemToFolder === 'function') {
        addItemToFolder(currentFolderId, exportKey);
    }
}
