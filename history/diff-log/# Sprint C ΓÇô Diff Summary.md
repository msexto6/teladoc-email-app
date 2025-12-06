# Sprint C – Diff Summary
**Scope:** Unlock key fields, fix rename data loss, add Duplicate action

---

## 1. Editable Subject / Preview / URL Fields

### Templates
- **Where:** `js/templates/templates.js` (and related template-definition files)
- **Change:**
  - Removed `locked`, `readonly`, or special “system field” flags from:
    - Subject line fields
    - Preview / preheader text fields
    - CTA URL fields
  - Result: they are now rendered as standard editable fields.

### Form Rendering
- **Where:** `js/app-form.js`
- **Change:**
  - Removed special-case logic that disabled inputs when:
    - `field.id` was subject / preview / URL, or
    - template metadata marked them for read-only display.
  - Kept generic readonly handling for true system/meta fields only.

**Net effect:** Subject line, preview text, and URLs are no longer greyed out or disabled; they behave like normal text inputs and propagate into `formData`, preview, saves, exports, and share links.

---

## 2. Rename Design – Preserve Data

### Context / Entry Point
- **Where:** `js/folders-trash.js` (or equivalent file that manages card context menus)
- **Change:**
  - Rename action now calls a rename handler that:
    - Loads the existing design record.
    - Updates only the name.
    - Saves the record back without touching content.

### Data Layer
- **Where:** `js/app-save-load.js` and/or `js/app-firebase.js`
- **Change:**
  - Previous behavior: building a new design object during rename could result in empty `formData` / `uploadedImages`.
  - New behavior:
    - Fetch full record via `dbGet`/`EmailBriefingDB.getDesign`.
    - Create `updatedData = { ...designData, projectName: newName }`.
    - Write back with the same design ID.
    - Maintain template info, timestamps, `formData`, `uploadedImages`.

### Folder Metadata
- **Where:** Folder document update logic (likely `js/folders-trash.js`)
- **Change:**
  - When renaming, update the folder item’s display name while keeping the ID reference unchanged.

**Net effect:** Renaming a design updates only its name; form + preview data remain intact.

---

## 3. Duplicate Design – New Context Menu Action

### Context Menu
- **Where:** `js/folders-trash.js`
- **Change:**
  - Added new menu item:
    - `id: 'duplicate-design'`
    - `label: 'Duplicate'`
  - Context menu handler routes this action to:
    - `duplicateDesignFromCard(storageKey, folderId)`

### Duplicate Implementation
- **Where:** `js/app-save-load.js`
- **Core logic (conceptual):**
  - Load:
    - `dataStr = await dbGet(storageKey)`
    - `rawData = JSON.parse(dataStr)`
    - `sourceData = rawData.data || rawData`
  - Deep-copy:
    - `const newData = JSON.parse(JSON.stringify(sourceData));`
  - Compute name:
    - `const newProjectName = await computeDuplicateName(sourceData.projectName || 'Untitled');`
  - New ID:
    - `const newId = 'email-project-' + Date.now();`
  - Patch fields:
    - `newData.projectName = newProjectName;`
    - `newData.savedDate = new Date().toISOString();`
  - Save:
    - `await dbSave(newId, JSON.stringify(newData));`
  - Folder placement:
    - If `folderId` and `addItemToFolder` exist, add `newId` to that folder’s items.
  - UI refresh:
    - Call `loadCurrentFolder()` or equivalent.

### Name Collision Handling
- **Where:** Helper like `computeDuplicateName` in `js/app-save-load.js` or shared util
- **Change:**
  - Gathers existing project names (via `EmailBriefingDB.getAllDesigns()` or similar).
  - Returns first free candidate in sequence:
    - `Existing`, `Existing_1`, `Existing_2`, ...

**Net effect:**  
Right-click → Duplicate creates an independent clone of a design in the same folder, with a new ID and incremented name, preserving all content.

---

## Verified Behaviors

- Subject/preview/URL fields:
  - Editable, no greyed-out state.
- Rename:
  - Name changes only; content preserved.
- Duplicate:
  - Same content, new ID, same folder, `_1/_2/_3` naming pattern.
- No regressions observed in:
  - Load Pipeline v2
  - Share links (#share and legacy #design)
  - Admin “Open design”