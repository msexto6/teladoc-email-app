function openSaveModal() {
    document.getElementById("save-modal").classList.add("active");
    document.getElementById("project-name-input").focus();
}


function showSaveModal() {
    document.getElementById("save-modal").classList.add("active");
    document.getElementById("project-name-input").focus();
}


function closeSaveModal() {
    document.getElementById("save-modal").classList.remove("active");
}


function showExportModal() {
    // Populate folder hierarchy when opening export modal
    if (typeof populateFolderHierarchyExport === 'function') {
        populateFolderHierarchyExport();
    }
    document.getElementById("export-modal").classList.add("active");
}


function closeExportModal() {
    document.getElementById("export-modal").classList.remove("active");
}


// ============================================
// PROJECT INFO DISPLAY
// ============================================

function updateProjectInfoDisplay(fileName = '', templateName = '') {
    const projectInfoDiv = document.querySelector('.project-info-display');
    if (!projectInfoDiv) return;
    
    if (fileName || templateName) {
        let displayHTML = '<div style="display: flex; gap: 20px; align-items: center;">';
        
        if (fileName) {
            displayHTML += `<div><strong>File:</strong> ${fileName}</div>`;
        }
        
        if (templateName) {
            displayHTML += `<div><strong>Template:</strong> ${templateName}</div>`;
        }
        
        displayHTML += '</div>';
        projectInfoDiv.innerHTML = displayHTML;
        projectInfoDiv.style.display = 'block';
    } else {
        projectInfoDiv.style.display = 'none';
    }
}

// ============================================
// PROJECT SAVE/LOAD
// ============================================


function switchToDesktop() {
    document.getElementById("desktop-view").classList.add("active");
    document.getElementById("mobile-view").classList.remove("active");
    document.querySelector(".preview-email").classList.remove("mobile-view");
}


function switchToMobile() {
    document.getElementById("mobile-view").classList.add("active");
    document.getElementById("desktop-view").classList.remove("active");
    document.querySelector(".preview-email").classList.add("mobile-view");
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
