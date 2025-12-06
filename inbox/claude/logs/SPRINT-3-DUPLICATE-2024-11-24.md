# SPRINT 3 - Duplicate Design Feature Implementation

**Date:** 2024-11-24
**Task:** Add "Duplicate" to design context menu in My Designs

## Summary
Implemented the "Duplicate" functionality for design cards in the My Designs view. Users can now right-click (or control-click) on a design card and select "Duplicate" to create a copy of the design with all content preserved.

## Files Modified

### 1. js/folders-trash.js
**Changes:**
- Updated header comment to mention SPRINT 3 addition
- Modified `showDesignContextMenu()` function to include a new "Duplicate" menu option
- The duplicate option calls `duplicateDesignFromCard(itemKey, currentFolderId)` passing both the design ID and current folder ID

**Code Change (showDesignContextMenu):**
```javascript
// Only show Rename and Duplicate for designs (not exports)
if (itemType === 'design') {
    menuHTML += `<div class="context-menu-item" onclick="renameDesign('${itemKey}')">Rename</div>`;
    // SPRINT 3: Add Duplicate option - get current folder ID for placement
    const currentFolderId = getCurrentFolderId();
    menuHTML += `<div class="context-menu-item" onclick="duplicateDesignFromCard('${itemKey}', '${currentFolderId || ''}')">Duplicate</div>`;
}
```

### 2. js/app-save-load.js
**Changes:**
- Added new section: "SPRINT 3: DUPLICATE DESIGN FUNCTIONALITY"
- Implemented `computeDuplicateName(baseName)` - generates unique names (Name_1, Name_2, etc.)
- Implemented `duplicateDesignFromCard(storageKey, folderId)` - main duplicate logic
- Exposed both functions globally via window object

**New Functions:**

#### computeDuplicateName(baseName)
- Fetches all existing designs from the database
- Builds a Set of existing project names
- Iterates from _1, _2, _3, etc. until a unique name is found
- Returns the unique duplicate name

#### duplicateDesignFromCard(storageKey, folderId)
1. Loads the existing design from IndexedDB
2. Handles nested Firestore data structure (rawData.data || rawData)
3. Deep-copies all design data using JSON.parse(JSON.stringify())
4. Computes new unique name via computeDuplicateName()
5. Generates new ID: 'email-project-' + Date.now()
6. Updates projectName and savedDate
7. Saves new design via dbSave()
8. Adds to same folder if folderId provided
9. Refreshes My Designs view

## Testing Scenarios

### Scenario A - Simple Duplicate
1. Open My Designs
2. Right-click on any design
3. Select "Duplicate"
4. **Expected:** New card appears with "OriginalName_1"
5. Open both original and duplicate
6. **Expected:** Identical content (text + images)

### Scenario B - Repeated Duplicates
1. Duplicate same design multiple times
2. **Expected:** Names become OriginalName_1, OriginalName_2, OriginalName_3, etc.
3. No overwrites, all duplicates unique

### Scenario C - Subfolder Duplicate
1. Navigate into a subfolder
2. Duplicate a design there
3. **Expected:** Duplicate appears in SAME subfolder, not root

## Acceptance Criteria Met
- ✅ "Duplicate" appears in context menu alongside Rename and Delete
- ✅ Duplicated designs preserve all content (formData + uploadedImages)
- ✅ New IDs generated (email-project-<timestamp>)
- ✅ Naming scheme uses ExistingName_1, _2, _3 pattern
- ✅ Duplicates placed in same folder as original
