# Sprint J - File Diffs
**Generated:** 2024-11-30

## 1. index.html

### Location: After Admin Panel Modal, before scripts section

```html
<!-- ADDED: Rename Design Modal (Sprint J) -->
<div id="rename-modal" class="modal-overlay" aria-hidden="true">
    <div class="modal-content modal-rename">
        <h3 class="modal-header">Rename design</h3>
        <p class="modal-description">
            Update the name of this design. It will be updated in your My Designs list.
        </p>
        <input
            id="rename-input"
            type="text"
            class="modal-input"
            placeholder="Enter new name..."
            autocomplete="off"
        />
        <div class="export-options">
            <button type="button" class="export-option-btn" id="rename-save-btn">
                Save
            </button>
            <button type="button" class="btn btn-ghost" id="rename-cancel-btn">
                Cancel
            </button>
        </div>
    </div>
</div>
```

---

## 2. css/modals.css

### Location: After folder color picker styles, before custom dialog styles

```css
/* ============================================
   RENAME MODAL (Sprint J)
   ============================================ */

.modal-content.modal-rename {
    max-width: 420px;
}

.modal-description {
    font-size: 14px;
    color: var(--color-primary-dark);
    margin-bottom: 16px;
    font-family: var(--font-primary);
    line-height: 1.4;
}
```

---

## 3. js/folders-trash.js

### A. Header Comment Update
```javascript
/**
 * Folders & Trash Management - Firebase Version
 * Handles folder creation, organization, and trash bin functionality
 * PHASE 3 UPDATE: Export cards removed from marketer UI - only visible in Admin panel
 * SPRINT 3: Added Duplicate functionality for design cards
+ * SPRINT J: Added Teladoc-style Rename modal
 */
```

### B. Global Variables (after selectedItems)
```javascript
// Track clicked items
let selectedItems = new Set();

+// SPRINT J: Track rename modal state
+let renameTargetKey = null;
+let renameTargetFolderId = null;
```

### C. Replaced renameDesign() function (around line 490)
```javascript
-/**
- * SPRINT 2 FIX: Rename design without clearing form data
- * 
- * The bug was that renaming was not properly preserving the nested
- * data structure from Firestore. When Firestore stores a design,
- * it uses the shape: { id, data: {formData, uploadedImages, ...}, timestamp, projectName, template }
- * 
- * This fix:
- * 1. Loads the FULL design record from the database
- * 2. Extracts the actual design data from the nested structure
- * 3. Updates ONLY the projectName field
- * 4. Preserves ALL other fields (formData, uploadedImages, etc.)
- * 5. Saves back with the same structure
- */
-async function renameDesign(itemKey) {
-    console.log('=== renameDesign called ===');
-    console.log('itemKey:', itemKey);
-    
-    // Step 1: Load the FULL design record from the database
-    const dataStr = await dbGet(itemKey);
-    if (!dataStr) {
-        console.error('Design not found:', itemKey);
-        return;
-    }
-    
-    // Step 2: Parse the wrapper object from Firestore
-    const rawData = JSON.parse(dataStr);
-    console.log('Raw data from DB:', rawData);
-    
-    // Step 3: Extract the actual design data (may be nested in 'data' property from Firestore)
-    // The structure from Firestore is: { id, data: {...actualDesignData}, timestamp, projectName, template }
-    const designData = rawData.data || rawData;
-    console.log('Extracted designData:', designData);
-    console.log('  formData keys:', Object.keys(designData.formData || {}));
-    console.log('  uploadedImages keys:', Object.keys(designData.uploadedImages || {}));
-    
-    // Get current project name (could be at top level or in nested data)
-    const currentName = rawData.projectName || designData.projectName || 'Untitled';
-    
-    // Step 4: Prompt for new name
-    const newName = prompt('Enter new name:', currentName);
-    if (!newName || newName.trim() === '') return;
-    
-    const trimmedName = newName.trim();
-    console.log('New name:', trimmedName);
-    
-    // Step 5: Create updated design data - preserving ALL existing fields
-    // Only change the projectName, leave everything else intact
-    const updatedDesignData = {
-        ...designData,
-        projectName: trimmedName
-    };
-    
-    console.log('Updated designData to save:');
-    console.log('  projectName:', updatedDesignData.projectName);
-    console.log('  template:', updatedDesignData.template || updatedDesignData.templateId);
-    console.log('  formData keys:', Object.keys(updatedDesignData.formData || {}));
-    console.log('  uploadedImages keys:', Object.keys(updatedDesignData.uploadedImages || {}));
-    
-    // Step 6: Save back to database
-    // dbSave will handle wrapping for Firestore via EmailBriefingDB.saveDesign
-    await dbSave(itemKey, JSON.stringify(updatedDesignData));
-    
-    console.log('✅ Design renamed successfully');
-    console.log('=== renameDesign completed ===');
-    
-    // Step 7: Refresh the My Designs view
-    await loadSavedDesigns();
-}

+/**
+ * SPRINT J: Rename design with Teladoc-style modal
+ * 
+ * Updated from SPRINT 2 FIX to use modal instead of prompt().
+ * Opens a professional modal overlay that matches the app's design system.
+ * Preserves all design data (formData, uploadedImages, etc.) when renaming.
+ */
+async function renameDesign(itemKey) {
+    console.log('=== renameDesign called (Sprint J Modal Version) ===');
+    console.log('itemKey:', itemKey);
+    
+    // Step 1: Load the FULL design record from the database
+    const dataStr = await dbGet(itemKey);
+    if (!dataStr) {
+        console.error('Design not found:', itemKey);
+        return;
+    }
+    
+    // Step 2: Parse the wrapper object from Firestore
+    const rawData = JSON.parse(dataStr);
+    
+    // Step 3: Extract the actual design data
+    const designData = rawData.data || rawData;
+    
+    // Get current project name (could be at top level or in nested data)
+    const currentName = rawData.projectName || designData.projectName || 'Untitled';
+    
+    // Step 4: Set up rename modal state
+    renameTargetKey = itemKey;
+    renameTargetFolderId = getCurrentFolderId() || null;
+    
+    // Step 5: Open modal with current name
+    const modal = document.getElementById('rename-modal');
+    const input = document.getElementById('rename-input');
+    
+    if (input) {
+        input.value = currentName;
+        setTimeout(() => {
+            input.focus();
+            input.select();
+        }, 100);
+    }
+    
+    if (modal) {
+        modal.classList.add('active');
+        modal.setAttribute('aria-hidden', 'false');
+    }
+    
+    console.log('✅ Rename modal opened');
+}

+/**
+ * SPRINT J: Helper function to get design name by key
+ * Used by rename modal to populate the input field
+ */
+function getDesignNameByKey(storageKey) {
+    // This is a helper - the actual name is retrieved in renameDesign()
+    // We could cache design names here if needed for performance
+    return null;
+}

+/**
+ * SPRINT J: Actually perform the rename operation
+ * Called when user clicks Save in the rename modal
+ */
+async function performRenameDesign(itemKey, newName) {
+    console.log('=== performRenameDesign ===');
+    console.log('itemKey:', itemKey);
+    console.log('newName:', newName);
+    
+    // Load the FULL design record
+    const dataStr = await dbGet(itemKey);
+    if (!dataStr) {
+        console.error('Design not found:', itemKey);
+        return false;
+    }
+    
+    // Parse and extract design data
+    const rawData = JSON.parse(dataStr);
+    const designData = rawData.data || rawData;
+    
+    // Create updated design data - preserving ALL existing fields
+    const updatedDesignData = {
+        ...designData,
+        projectName: newName
+    };
+    
+    console.log('Updated designData to save:');
+    console.log('  projectName:', updatedDesignData.projectName);
+    console.log('  formData keys:', Object.keys(updatedDesignData.formData || {}));
+    console.log('  uploadedImages keys:', Object.keys(updatedDesignData.uploadedImages || {}));
+    
+    // Save back to database
+    await dbSave(itemKey, JSON.stringify(updatedDesignData));
+    
+    console.log('✅ Design renamed successfully');
+    
+    // Refresh the My Designs view
+    await loadSavedDesigns();
+    
+    return true;
+}
```

### D. Context Menu Comment Update (around line 1020)
```javascript
/**
 * SPRINT 3: Updated to include Duplicate option for designs
+ * SPRINT J: Context menu now fires for both right-click and ctrl-click
 * Shows context menu with Rename, Duplicate, and Delete options
 */
function showDesignContextMenu(event, itemKey, itemType) {
    // ... existing code ...
}
```

### E. New Section Added: Rename Modal Handlers (before final DOMContentLoaded)
```javascript
+// ============================================
+// SPRINT J: RENAME MODAL HANDLERS
+// ============================================

+/**
+ * Close the rename modal and reset state
+ */
+function closeRenameModal() {
+    const modal = document.getElementById('rename-modal');
+    if (modal) {
+        modal.classList.remove('active');
+        modal.setAttribute('aria-hidden', 'true');
+    }
+    renameTargetKey = null;
+    renameTargetFolderId = null;
+}
```

### F. DOMContentLoaded Updates (at end of file)
```javascript
// Initialize folder and trash functionality
document.addEventListener('DOMContentLoaded', function() {
    setupTrashBin();
    setupNewFolderButton();
    updateBreadcrumb();
    
+    // SPRINT J: Set up Rename Modal handlers
+    const renameModal = document.getElementById('rename-modal');
+    const renameCancelBtn = document.getElementById('rename-cancel-btn');
+    const renameSaveBtn = document.getElementById('rename-save-btn');
+    const renameInput = document.getElementById('rename-input');
+    
+    if (renameCancelBtn) {
+        renameCancelBtn.addEventListener('click', closeRenameModal);
+    }
+    
+    if (renameSaveBtn) {
+        renameSaveBtn.addEventListener('click', async () => {
+            if (!renameTargetKey || !renameInput) {
+                closeRenameModal();
+                return;
+            }
+            
+            const newName = renameInput.value.trim();
+            if (!newName) {
+                // Could show an error message here
+                return;
+            }
+            
+            try {
+                await performRenameDesign(renameTargetKey, newName);
+                closeRenameModal();
+            } catch (err) {
+                console.error('Rename failed:', err);
+                closeRenameModal();
+            }
+        });
+    }
+    
+    // Optional: Enter key submits, Escape closes
+    if (renameInput) {
+        renameInput.addEventListener('keydown', (event) => {
+            if (event.key === 'Enter') {
+                event.preventDefault();
+                if (renameSaveBtn) {
+                    renameSaveBtn.click();
+                }
+            } else if (event.key === 'Escape') {
+                event.preventDefault();
+                closeRenameModal();
+            }
+        });
+    }
+    
+    // Close modal when clicking backdrop
+    if (renameModal) {
+        renameModal.addEventListener('click', (event) => {
+            if (event.target === renameModal) {
+                closeRenameModal();
+            }
+        });
+    }
});
```

---

## Summary Statistics

**Lines Added:**
- index.html: +24 lines
- css/modals.css: +14 lines  
- js/folders-trash.js: +155 lines

**Lines Modified:**
- js/folders-trash.js: ~20 lines (comments and function rewrites)

**Total Changes:** ~213 lines added/modified
