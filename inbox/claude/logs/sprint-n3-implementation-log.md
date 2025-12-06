SPRINT N3 - MAKE EXAMPLE DEFAULTS APPLY TO ALL TEMPLATES
================================================================
Implementation Date: 2025-11-30
Status: Parts 1 & 2 Complete

GOAL
----
Make example defaults ("Example subject line", "Example preview text", "https://example.com") 
apply to ALL templates when creating brand-new designs, but NOT when loading existing saved designs.

APPROACH
--------
Introduced a bullet-proof "new vs existing design" flag system using currentDesignId:
- null = brand new design (never saved)
- string = existing design (has been saved at least once)

Helper function isNewDesign() provides clean API for checking design state.

IMPLEMENTATION
-------------

### Part 1: Introduced currentDesignId State Tracking

**File: /js/app-save-load.js**
- Added `currentDesignId` variable (initialized to null)
- Added `isNewDesign()` helper function
- Exposed both globally via window object

**Set currentDesignId in all SAVE operations:**
- saveToComputer(): Sets ID on first save
- saveToMyDesignsWithFolder(): Sets ID on first save  
- confirmSaveAs(): Sets new ID for Save As operation
- loadDesignById(): Sets ID when loading existing design
- loadProjectFromComputer(): Sets ID when loading from file
- loadProject(): Sets ID in legacy load path

**Clear currentDesignId in NEW design flows:**
- File: /js/app-core.js
- loadTemplateByKey(): Clears currentDesignId = null when loading fresh template

### Part 2: Updated applyExampleDefaults() Usage

**File: /js/app-form.js**  
Line ~186 in handleTemplateChange():

BEFORE:
```javascript
if (!isLoadingSavedDesign) {
    applyExampleDefaults(window.formData, currentTemplate.fields);
}
```

AFTER:
```javascript  
if (typeof window.isNewDesign === "function" ? window.isNewDesign() : !window.currentDesignId) {
    applyExampleDefaults(window.formData, currentTemplate.fields);
}
```

This provides robust fallback checking:
1. Try to call window.isNewDesign() if it exists
2. Fall back to checking !window.currentDesignId directly
3. Never relies on fuzzy isLoadingSavedDesign flag

KEY BENEFITS
-----------
1. Single source of truth for new vs existing designs
2. Works across all template selection flows
3. Works for both My Designs and computer file loads
4. Properly handles Save As (creates new ID)
5. Clear semantics: null = new, string = existing

FILES MODIFIED
-------------
1. /js/app-save-load.js  
   - Added currentDesignId state tracking
   - Added isNewDesign() helper
   - Updated all save/load functions to manage currentDesignId

2. /js/app-core.js
   - Clear currentDesignId when loading fresh template

3. /js/app-form.js
   - Updated handleTemplateChange() to use isNewDesign()

REMAINING WORK (Parts 3 & 4)
---------------------------
Part 3: Verify field detection in applyExampleDefaults()
- Check that subject/preview/URL detection works for all templates
- Add role/type metadata to field definitions if needed

Part 4: Testing
- Test Partner Essentials NL (new design)
- Test Consultant Connect NL (new design)
- Test Education Drip HP (new design)
- Test Client Connections NL (new design)
- Test opening existing saved design (should NOT apply defaults)
- Test template switching before first save

NEXT STEPS
----------
Claude should proceed with Part 3 (field detection verification) and Part 4 (testing).
