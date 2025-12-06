# SPRINT A - FILE DIFFS
Date: 2025-11-23

## templates.js
```diff
+ // SPRINT A TASK A1: Added validation blocks for required fields
  
  "consultant-connect-nl": {
      // ... existing fields ...
+     "validation": {
+         "requiredFields": ["headline", "body-copy", "cta", "cta-url"]
+     }
  }
```

## app-form.js
```diff
+ // ============================================
+ // SPRINT A: VALIDATION SYSTEM
+ // ============================================
+ 
+ function validateCurrentDesign() { ... }
+ function setFieldError(fieldId, message) { ... }
+ function clearFieldErrors() { ... }
+ function clearFieldError(fieldId) { ... }
+ 
+ // Make validation functions available globally
+ window.validateCurrentDesign = validateCurrentDesign;
+ window.setFieldError = setFieldError;
+ window.clearFieldErrors = clearFieldErrors;
+ window.clearFieldError = clearFieldError;
```

Also modified input event listeners:
```diff
  input.addEventListener("input", e => {
+     // SPRINT A: Clear field error on input
+     clearFieldError(field.id);
      
      formData[field.id] = e.target.value;
```

## app-export.js
```diff
+ /**
+  * SPRINT A TASK A4: Export Modal with Pre-flight Validation
+  */
+ function showExportModal() {
+     const validation = window.validateCurrentDesign();
+     if (!validation.isValid) {
+         validation.errors.forEach(err => {
+             window.setFieldError(err.fieldId, err.message);
+         });
+         showToast("Please complete the highlighted fields before exporting.");
+         return;
+     }
+     openExportModal();
+ }
+ 
+ function showToast(message) { ... }
+ 
+ window.showExportModal = showExportModal;
+ window.showToast = showToast;
```

## components.css
```diff
+ /* ============================================
+    SPRINT A: VALIDATION ERROR STATES
+    ============================================ */
+ 
+ .field-error {
+     border: 2px solid #dc2626 !important;
+     background-color: #fef2f2 !important;
+ }
+ 
+ .field-error-message {
+     color: #dc2626;
+     font-size: 13px;
+     margin-top: 4px;
+     font-weight: 500;
+ }
+ 
+ .validation-toast {
+     position: fixed;
+     bottom: -100px;
+     left: 50%;
+     transform: translateX(-50%);
+     /* ... styling ... */
+ }
+ 
+ .validation-toast.show {
+     bottom: 32px;
+ }
```

## Summary of Changes

**4 files modified**:
1. `js/templates.js` - Added validation blocks to all templates
2. `js/app-form.js` - Added validation functions + auto-clear on input
3. `js/app-export.js` - Added showExportModal gate + toast system
4. `css/components.css` - Added error state styling

**0 files created**

**Lines added**: ~250 lines across all files

**Key Functions Added**:
- validateCurrentDesign()
- setFieldError() / clearFieldError() / clearFieldErrors()
- showExportModal()
- showToast()

**Integration Points**:
- Export button in app-core.js calls `showExportModal`
- Form inputs auto-clear errors via `clearFieldError(fieldId)`
- Templates define validation rules in `validation` property
