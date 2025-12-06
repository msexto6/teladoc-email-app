SPRINT N3 - CODE DIFFS
=====================

### File: js/app-save-load.js

**Lines 1-20: Added currentDesignId state tracking**

```diff
 // Global variables to track current file handle (on window object for cross-file access)
 window.currentFileHandle = null;
 window.currentProjectName = null;
 window.currentLocalStorageKey = null; // Track which My Designs entry is open
 
 // ============================================
 // SPRINT F: DESIGN LOAD STABILITY
 // ============================================
 
 // Flag to track when a design is being loaded (prevents race conditions)
 let isDesignLoading = false;
 
 // Expose flag for listener guards
 window.isDesignLoading = () => isDesignLoading;

+ // ============================================
+ // SPRINT N3: NEW VS EXISTING DESIGN TRACKING
+ // ============================================
+ 
+ /**
+  * SPRINT N3: Track whether current design is new (unsaved) or existing (has been saved)
+  * - null = brand new design (no designId yet)
+  * - string = existing design ID (user has saved at least once)
+  * This is the single source of truth for "is this a new design?"
+  */
+ let currentDesignId = null;
+ 
+ /**
+  * SPRINT N3: Helper to determine if we're working on a brand-new design
+  * @returns {boolean} true if this is a new design (never saved), false if existing
+  */
+ function isNewDesign() {
+     return !currentDesignId;
+ }
+ 
+ // Expose globally for use in other modules
+ window.currentDesignId = null;
+ window.isNewDesign = isNewDesign;
```

**Lines 60-65: Set currentDesignId when loading existing design**

```diff
 async function loadDesignById(designId, options = {}) {
     if (!designId) {
         console.error('loadDesignById: No design ID provided');
         return;
     }
 
     // Prevent overlapping loads
     if (isDesignLoading) {
         console.warn('Design load requested while another load is in progress - ignoring');
         return;
     }
 
     isDesignLoading = true;
     console.log('🔒 loadDesignById started:', designId, options);
 
     try {
+         // SPRINT N3: Mark as existing design BEFORE any form initialization
+         currentDesignId = designId;
+         window.currentDesignId = designId;
+         console.log('🆔 SPRINT N3: Set currentDesignId =', designId, '(existing design)');
+         
         // 1) Fetch design from storage
         const dataStr = await dbGet(designId);
```

**Lines 440-446: Set currentDesignId on first save to computer**

```diff
 async function saveToComputer() {
     const projectName = document.getElementById("project-name-input").value.trim();
     if (!projectName) {
         alert("Please enter a project name");
         return;
     }
 
     try {
         // Use File System Access API to save file
         const fileHandle = await window.showSaveFilePicker({
             suggestedName: projectName + '.json',
             types: [{
                 description: 'Email Briefing Projects',
                 accept: { 'application/json': ['.json'] }
             }]
         });
 
+         // SPRINT N3: Generate and track design ID on first save
+         const storageKey = window.currentLocalStorageKey || ('email-project-' + Date.now());
+         currentDesignId = storageKey;
+         window.currentDesignId = storageKey;
+         console.log('🆔 SPRINT N3: Set currentDesignId =', storageKey, '(first save to computer)');
+ 
         // Store the file handle for future saves
         window.currentFileHandle = fileHandle;
```

### File: js/app-core.js

**Lines 158-164: Clear currentDesignId for fresh template**

```diff
     // CRITICAL FIX: Clear global state objects without reassigning references
     Object.keys(window.formData).forEach(key => delete window.formData[key]);
     Object.keys(window.uploadedImages).forEach(key => delete window.uploadedImages[key]);
     console.log("🔄 State reset: formData and uploadedImages cleared");
     
+     // SPRINT N3: Clear currentDesignId for fresh template (new design)
+     if (typeof window.currentDesignId !== 'undefined') {
+         window.currentDesignId = null;
+         console.log("🆔 SPRINT N3: Cleared currentDesignId (new design)");
+     }
+     
     // TASK I: Set builder mode to 'template' and update header
     window.builderMode = 'template';
```

### File: js/app-form.js

**Lines 183-188: Use isNewDesign() instead of isLoadingSavedDesign**

```diff
     }
     
-     // SPRINT N2: Apply example defaults for ALL templates (NEW designs only, not saved designs)
-     // CRITICAL FIX: Moved outside webinar if/else blocks so it applies to ALL templates
-     if (!isLoadingSavedDesign) {
+     // SPRINT N3: Apply example defaults based on isNewDesign() (bullet-proof new vs existing check)
+     if (typeof window.isNewDesign === "function" ? window.isNewDesign() : !window.currentDesignId) {
         applyExampleDefaults(window.formData, currentTemplate.fields);
     }
     
     uploadedImages = {};
```

SUMMARY
-------
- Added currentDesignId state variable (null = new, string = existing)
- Created isNewDesign() helper for clean boolean check  
- Set currentDesignId in all save operations (saveToComputer, saveToMyDesigns, confirmSaveAs)
- Set currentDesignId in all load operations (loadDesignById, loadProjectFromComputer, loadProject)
- Clear currentDesignId when loading fresh templates (loadTemplateByKey)
- Updated applyExampleDefaults() guard to use isNewDesign() instead of isLoadingSavedDesign
