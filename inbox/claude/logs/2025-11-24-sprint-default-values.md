# Sprint Log: Fix Pre-built Copy as Real Content
**Date:** 2025-11-24
**Sprint:** DEFAULT VALUES

## Summary
Implemented changes to make pre-built template copy behave as "real" content that gets exported to Excel/PDF, rather than placeholder-style text that requires user rewriting.

## Changes Made

### 1. templates.js
**Location:** `/Users/marksexton/Desktop/Email-Briefing-App/js/templates.js`

**Changes:**
- Added comprehensive documentation block explaining the difference between `defaultValue` and `placeholder`
- Converted education-drip templates (`education-drip-employer`, `education-drip-hp`) from using `placeholder` to using `defaultValue` for pre-written copy
- Converted newsletter templates (`partner-essentials-nl`, `consultant-connect-nl`, `client-connections-nl`) from using `value` to using `defaultValue` (standardized naming)
- Added `placeholder` hints for all fields (e.g., "Enter headline", "Enter body copy") separate from default content

**Key Documentation Added:**
```javascript
/**
 * FIELD PROPERTY DOCUMENTATION:
 * =============================
 * 
 * `defaultValue` (string, optional):
 *   - Pre-populated "real" copy that should be exported to Excel/PDF
 *   - Appears as normal text (not grayed out)
 *   - Initialized into formData on template load
 *   - Use for: recommended copy, sample content users can keep or modify
 * 
 * `placeholder` (string, optional):
 *   - Hint text shown when field is empty
 *   - Appears grayed out in the input
 *   - NOT exported - purely a UI hint
 *   - Use for: instructional text like "Enter your headline here"
 */
```

### 2. app-form.js
**Location:** `/Users/marksexton/Desktop/Email-Briefing-App/js/app-form.js`

**Changes:**
- Added new function `initializeFormDataFromTemplate(templateDef)` that reads `defaultValue` from template field definitions and populates `window.formData`
- Modified `handleTemplateChange()` to call `initializeFormDataFromTemplate()` instead of relying solely on hardcoded `Object.assign` blocks
- Kept legacy hardcoded defaults only for webinar templates that have extra fields not defined in templates.js (e.g., eyebrow, signature fields, speakers)
- Updated `createTextInput()` and `createTextarea()` to prioritize: formData > defaultValue > value > initialValue
- Added comments throughout marking the SPRINT: DEFAULT VALUES changes

**New Function:**
```javascript
function initializeFormDataFromTemplate(templateDef) {
    if (!templateDef || !templateDef.fields) return;
    
    templateDef.fields.forEach(field => {
        if (field.type === 'image') return;
        const defaultVal = field.defaultValue || field.value || field.initialValue || null;
        if (defaultVal) {
            window.formData[field.id] = defaultVal;
        }
    });
}
```

## Behavior Changes

### Before:
- Education Drip templates showed pre-written copy as gray placeholder text
- Users had to manually type/rewrite content for it to be recognized as "real" data
- formData was empty until user typed, so exports didn't include placeholder text

### After:
- Education Drip templates show pre-written copy as normal black text
- Default values are immediately written to formData on template load
- Exports (Excel, PDF) include default values without user modification
- Placeholders remain as hints shown only when field is empty

## Backwards Compatibility
- Fields without `defaultValue` behave unchanged
- Legacy `value` property still works (falls back to it if `defaultValue` not present)
- Webinar templates retain their hardcoded defaults for extra fields not in template definitions

## Testing Checklist
- [ ] Load Education Drip - HP template: default copy should appear as normal text
- [ ] Check browser console: formData should show initialized values
- [ ] Export to Excel: verify default values appear in the brief
- [ ] Clear a field: placeholder hint should appear (grayed out)
- [ ] Type new content: should override default and export correctly
- [ ] Load saved project: should still load correctly without duplicate data

## Files Modified
1. `/Users/marksexton/Desktop/Email-Briefing-App/js/templates.js`
2. `/Users/marksexton/Desktop/Email-Briefing-App/js/app-form.js`
