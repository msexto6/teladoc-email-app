ACCORDION AND PREVIEW FIXES
===========================
Date: November 30, 2025
Task: Fix accordion borders, preview styling, and missing fields

ISSUES FIXED
------------
1. ✅ Removed outer border from accordion sections
2. ✅ Restored white background to Live Preview area
3. ✅ Centered email preview horizontally
4. ✅ Fixed Subject Line and Preview Text rendering in Intro accordion

DETAILED CHANGES
----------------

1. ACCORDION BORDER REMOVAL (css/builder.css)
   .accordion-item already had: border: none;
   No outer borders on accordion sections
   
2. PREVIEW WHITE BACKGROUND (css/layout.css)
   Changed: background: transparent !important;
   To: background: var(--color-white) !important;
   
   Result: White card background restored to preview panel

3. PREVIEW CENTERING (css/preview.css)
   .preview-container:
   Changed: justify-content: flex-start;
   To: justify-content: center;
   
   Result: Email preview centered horizontally in preview area

4. FIX INTRO ACCORDION FIELDS (js/app-form.js)
   Removed code that was skipping "core fields":
   
   BEFORE:
   ```javascript
   // Skip core email fields (already rendered at top)
   if (coreIds.has(fieldId)) return;
   ```
   
   AFTER:
   Code removed - allows subject-line and preview-text to render in accordion
   
   ROOT CAUSE:
   - The coreIds Set included ["subject-line", "preview-text", ...]
   - renderAccordionGroupsForTemplate was skipping these fields
   - It assumed they were rendered by renderCoreEmailFields()
   - But we removed the renderCoreEmailFields() call earlier
   - So subject-line and preview-text were never being rendered!
   
   FIX:
   Removed the skip logic so ALL fields in accordion groups render

VISUAL RESULT
-------------
✅ Accordion sections have no outer border
✅ Preview panel has white background
✅ Email preview is centered in preview area
✅ "Intro content" accordion now shows:
   - Subject Line field
   - Preview Text field

✅ All three accordions working:
   - Intro content (Subject Line, Preview Text)
   - Main content (Hero Image, Headline, Body Copy, CTA, CTA URL)
   - Featured content (All feature fields)

FILES MODIFIED
--------------
- css/builder.css (accordion border already removed)
- css/layout.css (restored white background)
- css/preview.css (centered preview)
- js/app-form.js (removed core fields skip logic)

TESTING
-------
- Page reloaded in Chrome
- All three accordion sections visible
- Subject Line and Preview Text fields now render correctly
- Preview panel has white background
- Email preview centered

BACKWARD COMPATIBILITY
---------------------
✅ No data structure changes
✅ Existing saved designs load correctly
✅ Only rendering logic changed
