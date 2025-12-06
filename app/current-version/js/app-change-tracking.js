/**
 * Change Tracking and Auto-Save Module
 * Tracks form changes, warns on navigation, and auto-saves existing designs
 */

// Track if form has unsaved changes
let formIsDirty = false;
let autoSaveInterval = null;

// Mark form as changed (dirty)
function markFormAsDirty() {
    formIsDirty = true;
}

// Mark form as saved (clean)
function markFormAsClean() {
    formIsDirty = false;
}

// Check if form has unsaved changes
function hasUnsavedChanges() {
    return formIsDirty;
}

// Start auto-save for existing designs (every 2 minutes)
function startAutoSave() {
    // Clear any existing interval
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    // Only auto-save if we have a file handle or localStorage key
    if (window.currentFileHandle || window.currentLocalStorageKey) {
        autoSaveInterval = setInterval(async () => {
            // Only auto-save if there are unsaved changes
            if (formIsDirty) {
                console.log("Auto-saving...");
                await performAutoSave();
            }
        }, 120000); // 2 minutes = 120,000ms
    }
}

// Stop auto-save
function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// Perform auto-save
async function performAutoSave() {
    try {
        if (window.currentFileHandle) {
            await saveToExistingFile();
            console.log("Auto-saved to file");
        } else if (window.currentLocalStorageKey) {
            saveToExistingMyDesign();
            console.log("Auto-saved to My Designs");
        }
        markFormAsClean();
    } catch (err) {
        console.error("Auto-save failed:", err);
    }
}

// Show unsaved changes warning dialog
function showUnsavedChangesDialog(callback) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 class="modal-header">Unsaved Changes</h3>
            <p style="margin: 20px 0; color: #351F65;">You have unsaved changes. Do you want to save before leaving?</p>
            <div class="export-options">
                <button class="export-option-btn" id="save-and-leave-btn">Save & Leave</button>
                <button class="export-option-btn export-option-ghost" id="leave-without-saving-btn">Leave Without Saving</button>
            </div>
            <button class="btn btn-ghost mt-xl" style="width:100%" id="cancel-leave-btn">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Save and leave
    document.getElementById('save-and-leave-btn').addEventListener('click', async () => {
        try {
            await handleSave();
            document.body.removeChild(modal);
            callback(true);
        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to save. Please try again.");
        }
    });
    
    // Leave without saving
    document.getElementById('leave-without-saving-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        markFormAsClean(); // Clear dirty flag
        callback(true);
    });
    
    // Cancel
    document.getElementById('cancel-leave-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        callback(false);
    });
}

// Intercept navigation to check for unsaved changes
function checkUnsavedChangesBeforeNav(targetScreen) {
    // Only check if leaving the builder screen
    const builderScreen = document.getElementById('builder-screen');
    if (!builderScreen || !builderScreen.classList.contains('active')) {
        return true; // Not on builder, allow navigation
    }
    
    if (hasUnsavedChanges()) {
        showUnsavedChangesDialog((shouldLeave) => {
            if (shouldLeave) {
                stopAutoSave();
                showScreen(targetScreen);
            }
        });
        return false; // Block immediate navigation
    }
    
    stopAutoSave();
    return true; // No unsaved changes, allow navigation
}

// Track all form inputs for changes
function setupChangeTracking() {
    // Track all form inputs
    document.addEventListener('input', (e) => {
        if (e.target.closest('#email-form') || e.target.closest('.rich-text-editor') || e.target.id === 'creative-direction-top') {
            markFormAsDirty();
        }
    });
    
    // Track image uploads/removals (already handled in app-images.js with markFormAsDirty calls)
}

// Initialize change tracking when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupChangeTracking();
    
    // When a saved design is loaded, start auto-save
    // This is triggered from navigation.js when loadDesign() is called
    window.addEventListener('design-loaded', () => {
        markFormAsClean(); // Design just loaded, no changes yet
        startAutoSave();
    });
    
    // When a new template is selected, stop auto-save
    window.addEventListener('template-selected', () => {
        stopAutoSave();
        markFormAsClean();
    });
});

// Export functions for use in other modules
window.markFormAsDirty = markFormAsDirty;
window.markFormAsClean = markFormAsClean;
window.hasUnsavedChanges = hasUnsavedChanges;
window.startAutoSave = startAutoSave;
window.stopAutoSave = stopAutoSave;
window.checkUnsavedChangesBeforeNav = checkUnsavedChangesBeforeNav;
