# FormData Unification Fix
## Date: 2025-11-23
## Issue: "Cannot set properties of undefined (setting 'headline')" on load

### Root Cause Analysis

The app has multiple `formData` and `uploadedImages` variable declarations across files, causing scope confusion:

1. **app-core.js**: Declares `let formData = {}` and `let uploadedImages = {}`
2. **app-save-load.js**: Contains lines like `formData = saveData.formData || {}`
3. **app-form.js**: References `formData` directly in event handlers

When loading a saved design:
- `app-save-load.js` assigns `formData = {...}` which creates a NEW local variable
- This breaks the reference to `window.formData`
- When `createTextInput` tries to write to `window.formData[field.id]`, it fails because `window.formData` is empty

### Solution Implemented

#### 1. app-core.js - Unified Global State (COMPLETED)
- Initialize `window.formData` and `window.uploadedImages` FIRST
- Create local references that point to the same objects
- Never reassign, only clear properties using `Object.keys().forEach(key => delete obj[key])`

#### 2. app-save-load.js - Safe Object Updates (NEEDS FIX)
Current problematic code:
```javascript
formData = saveData.formData || {};
uploadedImages = saveData.uploadedImages || {};
```

Should be replaced with:
```javascript
// Clear existing data
Object.keys(window.formData).forEach(key => delete window.formData[key]);
Object.keys(window.uploadedImages).forEach(key => delete window.uploadedImages[key]);

// Copy saved data into global objects
Object.assign(window.formData, saveData.formData || {});
Object.assign(window.uploadedImages, saveData.uploadedImages || {});
```

This appears in 3 functions:
1. `loadProjectFromComputer()` - line ~270
2. `loadProject()` (legacy) - line ~320  
3. `loadDesignFromCard()` - line ~650

### Files Modified
- ✅ /Users/marksexton/Desktop/Email-Briefing-App/js/app-core.js
- ⏳ /Users/marksexton/Desktop/Email-Briefing-App/js/app-save-load.js (PENDING)

### Testing Checklist
- [ ] Hard reload index.html
- [ ] Navigate to My Designs → Mark Sexton Emails → Campaign 1
- [ ] Click a saved design card
- [ ] Verify NO console errors
- [ ] Verify left form fields populate with saved values
- [ ] Verify preview shows correct content
- [ ] Make a change and save
- [ ] Reload and verify persistence

### Next Steps
1. Fix the 3 instances in app-save-load.js
2. Test loading flow
3. Verify saving still works correctly
