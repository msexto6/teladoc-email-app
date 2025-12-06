ACCORDION AND PREVIEW SECTION UPDATES
======================================
Date: November 30, 2025
Sprint: UI Refinements - Intro Content Accordion & Preview Styling

CHANGES COMPLETED
-----------------
1. ✅ Added "Intro content" accordion with Subject Line and Preview Text
2. ✅ Removed white background from Live Preview section
3. ✅ Left-aligned email preview with "Live Preview" headline

DETAILED CHANGES
----------------

1. INTRO CONTENT ACCORDION (js/templates.js)
   Added new accordion group at the beginning:
   {
       "id": "intro-content",
       "label": "Intro content",
       "fieldIds": ["subject-line", "preview-text"]
   }
   
   Accordion order is now:
   - Intro content (Subject Line, Preview Text)
   - Main content (Hero Image, Headline, Body Copy, CTA, CTA URL)
   - Featured content (All feature fields and highlight text)

2. FORM GENERATION UPDATE (js/app-form.js)
   Removed renderCoreEmailFields() call from generateForm()
   Subject Line and Preview Text now render as part of accordion groups
   No separate "core fields" section at top
   
3. PREVIEW SECTION STYLING (css/preview.css)
   .preview-container changes:
   - padding: 0 (was: var(--spacing-lg))
   - justify-content: flex-start (was: center)
   
   Result: Email preview now left-aligns with "Live Preview" header

4. PREVIEW PANEL BACKGROUND (css/layout.css)
   Added override for .preview-panel:
   - background: transparent !important
   - box-shadow: none !important
   
   Result: Removed white card background, preview section now transparent

VISUAL RESULT
-------------
✅ Three accordion sections in Standard template
✅ Subject Line and Preview Text collapsed by default in "Intro content"
✅ Preview section has no white background (transparent)
✅ Email preview aligns with "Live Preview" headline on left
✅ Preview width extends from headline to Desktop/Mobile buttons

FILES MODIFIED
--------------
- js/templates.js (added intro-content group)
- js/app-form.js (updated generateForm function)
- css/preview.css (updated alignment and spacing)
- css/layout.css (added preview-panel transparency)

BACKWARD COMPATIBILITY
---------------------
✅ Subject/Preview data preserved in formData
✅ Existing saved designs load correctly
✅ Only UI layout changed, no data structure changes
