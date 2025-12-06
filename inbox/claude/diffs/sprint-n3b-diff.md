# SPRINT N3b - DIFF LOG
**Date:** 2025-11-30  
**Sprint:** N3b Hotfix - Always Apply Example Defaults  
**Engineer:** Claude (MCP)

## FILES MODIFIED

### 1. `/js/app-form.js` - Line ~186

**BEFORE:**
```javascript
    // SPRINT N2: Apply example defaults for ALL templates (NEW designs only, not saved designs)
    // CRITICAL FIX: Moved outside webinar if/else blocks so it applies to ALL templates
    if (typeof window.isNewDesign === "function" ? window.isNewDesign() : !window.currentDesignId) {
        applyExampleDefaults(window.formData, currentTemplate.fields);
    }
```

**AFTER:**
```javascript
    // SPRINT N3b: Apply example defaults unconditionally (safe, empty-only)
    // applyExampleDefaults only fills EMPTY fields, so it's safe for both new and existing designs
    applyExampleDefaults(window.formData, currentTemplate.fields);
```

## CHANGE SUMMARY

**Removed conditional gating:**
- ❌ No longer checks `isNewDesign()` or `currentDesignId`
- ✅ Calls `applyExampleDefaults()` unconditionally for ALL template changes

**Why this is safe:**
The `applyExampleDefaults()` function (lines 38-80) only fills fields that are currently EMPTY:

```javascript
const current = (formData[key] || '').toString().trim();

// Only apply defaults if field is currently empty
if (!current) {
    // set example values
}
```

**Result:**
- **New designs:** Empty fields get example values ("Example subject line", "Example preview text", "https://example.com")
- **Existing designs:** Non-empty fields remain unchanged (safe!)
- **Edge case:** Old designs with empty fields will now get example values (acceptable - helps users identify missing data)

## RATIONALE

Sprint N3 added `currentDesignId` tracking and gated `applyExampleDefaults()` behind `isNewDesign()` checks. However, this proved unreliable because:
1. Some load paths set `currentDesignId` earlier than expected
2. The "new design" state was ambiguous across different flows
3. Only Standard Template reliably showed example defaults

**The key insight:** Since `applyExampleDefaults()` is inherently safe (only touches empty fields), we don't need complex state tracking. We can call it unconditionally and let the function's own empty-check logic handle everything.

## VERIFICATION PERFORMED

✅ Confirmed `applyExampleDefaults()` only fills empty fields (lines 38-80)
✅ No non-empty values are ever overwritten
✅ Logic is simple: `if (!current) { set_default }`

## DEPENDENCIES

- `currentDesignId` and `isNewDesign()` remain in codebase (added in Sprint N3)
- They may be useful for other features, just not for this one
- No other code depends on them for example defaults

## NEXT STEPS

**Manual testing required:**
1. Test new designs for all templates (expect example defaults)
2. Test loading existing designs (expect saved values, NOT examples)
3. Test edge case: designs with some empty fields (expect examples in empty fields only)
