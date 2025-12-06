# CRITICAL FIXES NEEDED
## Email Briefing App - FormData & Export Issues
## Date: 2025-11-23

---

## ISSUE 1: FormData Undefined Reference Error

### Files Modified
✅ **app-core.js** - COMPLETED
- Unified global state initialization
- `window.formData` and `window.uploadedImages` now initialized FIRST
- Never reassigned, only cleared

⏳ **app-save-load.js** - NEEDS 3 FIXES

### Required Changes in app-save-load.js

**Location 1: `loadProjectFromComputer()` function (around line 270)**
```javascript
// ❌ WRONG (creates new local variables):
formData = saveData.formData || {};
uploadedImages = saveData.uploadedImages || {};

// ✅ CORRECT (updates global objects):
// Clear existing data
Object.keys(window.formData).forEach(key => delete window.formData[key]);
Object.keys(window.uploadedImages).forEach(key => delete window.uploadedImages[key]);

// Copy saved data into global objects
Object.assign(window.formData, saveData.formData || {});
Object.assign(window.uploadedImages, saveData.uploadedImages || {});
```

**Location 2: `loadProject()` function (around line 320)**
Same fix as Location 1

**Location 3: `loadDesignFromCard()` function (around line 650)**
```javascript
// ❌ WRONG:
formData = loadedFormData;
uploadedImages = loadedUploadedImages;

// ✅ CORRECT:
// Clear existing data
Object.keys(window.formData).forEach(key => delete window.formData[key]);
Object.keys(window.uploadedImages).forEach(key => delete window.uploadedImages[key]);

// Copy loaded data into global objects
Object.assign(window.formData, loadedFormData);
Object.assign(window.uploadedImages, loadedUploadedImages);
```

---

## ISSUE 2: Export Missing Static Assets & index.html

### Problem
- Exports include `index.html` which shouldn't be there
- Missing Teladoc logo and template header art in ZIP
- PDF generation broken for images when testing locally

### Solution Needed in templates.js

Add `staticAssets` to Partner Essentials NL template:

```javascript
'partner-essentials-nl': {
    name: 'Partner Essentials NL',
    type: 'newsletter',
    staticAssets: [
        { 
            id: 'logo', 
            src: 'assets/teladoc-logo.png',
            export: true  // Include in ZIP exports
        },
        { 
            id: 'header', 
            src: 'assets/partner-essentials.jpg',
            export: true  // Include in ZIP exports
        }
    ],
    fields: [
        // ... existing fields
    ]
}
```

### Solution Needed in app-export.js

Remove index.html from ZIP (around line 280):

```javascript
// ❌ REMOVE THIS LINE:
zip.file("index.html", htmlDoc);

// Only create PDF and Excel files, plus images folder
```

---

## Testing Protocol

### Test 1: FormData Fix
1. Hard reload `index.html`
2. Go to My Designs → Mark Sexton Emails → Campaign 1
3. Click a saved design card (e.g., "try to be a better partner")
4. ✅ NO errors in console
5. ✅ Left form fields populate with saved values
6. ✅ Preview shows correct content

### Test 2: Export Fix
1. Open Partner Essentials NL template
2. Add some content
3. Click Export
4. Download ZIP file
5. ✅ ZIP contains: `email-brief.pdf`, `email-brief.xls`, `images/` folder
6. ✅ ZIP does NOT contain `index.html`
7. ✅ `images/` folder contains: teladoc-logo.png, partner-essentials.jpg, plus any user uploads
8. Test under HTTP server: ✅ PDF includes logo and header images

---

## Priority Order

1. **CRITICAL**: Fix app-save-load.js (prevents app crashes)
2. **HIGH**: Add staticAssets to templates.js (enables proper exports)
3. **MEDIUM**: Remove index.html from exports (cleaner output)

---

## Next Steps for Claude

When you implement these fixes:
1. Read entire file first
2. Make targeted changes using Filesystem:write_file
3. Test each change immediately
4. Document results in shared memory bus
