# Sprint 2 Changes Summary - Rename Bug Fix

## Date: 2024

## Task ID: SPRINT-2-RENAME-BUG

## Files Changed:
- `js/folders-trash.js`

## Functions Modified:
- `renameDesign(itemKey)` - Complete rewrite

## Nature of Change:
Bug fix - Firestore data structure handling

## Before:
```javascript
async function renameDesign(itemKey) {
    const dataStr = await dbGet(itemKey);
    if (!dataStr) return;
    
    const design = JSON.parse(dataStr);
    const newName = prompt('Enter new name:', design.projectName);
    if (!newName || newName.trim() === '') return;
    
    design.projectName = newName.trim();
    await dbSave(itemKey, JSON.stringify(design));
    
    await loadSavedDesigns();
}
```

## After:
- Properly extracts nested `data` from Firestore wrapper
- Updates only `projectName` in the actual design data
- Preserves `formData`, `uploadedImages`, and all other fields
- Added console logging for debugging

## Impact:
- Renaming designs no longer clears form content
- Renaming designs no longer clears uploaded images
- Preview content remains intact after rename

## Acceptance Criteria Met:
- [x] Renaming a design never clears or modifies formData
- [x] Renaming a design never clears or modifies uploadedImages
- [x] Only projectName / label changes
- [x] My Designs card shows new name
- [x] Builder header shows new name when opened
- [x] No new empty designs accidentally created
