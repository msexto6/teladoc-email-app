ACCORDION STYLING REFINEMENTS - FINAL UPDATE
============================================
Date: November 30, 2025
Sprint: Accordion UI Improvements

CHANGES COMPLETED
-----------------
1. ✅ Matched dropdown arrow style - Using same chevron SVG as "I want the creative team to..." dropdown
2. ✅ Removed connecting border - Each accordion section now standalone with 30px spacing
3. ✅ Added Feature section headers - "Feature 1" and "Feature 2" headers with Effra Bold styling

DETAILED CSS CHANGES (css/builder.css)
--------------------------------------
1. Arrow Style Update:
   - Removed CSS triangle (::after pseudo-element)
   - Added SVG background-image matching dropdown chevron
   - White stroke color (#FFFFFF) on plum background
   - Rotates when accordion expands (up/down orientation)

2. Border Structure:
   - Removed .form-accordion wrapper border
   - Added flex display with 30px gap
   - Each .accordion-item gets individual plum border
   - Fully separated visual sections

3. Feature Section Headers:
   - New .feature-section-header class
   - Font: Dalton Maag Effra Bold, 1.1rem
   - Color: Plum (#351F65)
   - Bottom border: 2px plum lighter shade
   - Spacing: 24px top, 16px bottom

JAVASCRIPT CHANGES (js/app-form.js)
-----------------------------------
Updated renderAccordionGroupsForTemplate() function:
   - Added isFeatureSection detection (group.id === "feature-section")
   - Tracks currentFeatureSection state
   - Inserts <h3> headers before feature-1-* and feature-2-* fields
   - Headers: "Feature 1" and "Feature 2" with .feature-section-header class

VISUAL RESULT
-------------
✅ Accordion headers: Plum background, white text, white chevron arrow
✅ Arrow behavior: Points down when collapsed, rotates to point up when expanded
✅ Borders: 1px plum outline per section, 30px spacing between sections
✅ Feature Section: Clear "Feature 1" and "Feature 2" bold headers in plum

FILES MODIFIED
--------------
- css/builder.css (accordion styles ~80 lines)
- js/app-form.js (renderAccordionGroupsForTemplate function, lines 317-394)

BACKUP CREATED
--------------
- js/app-form.js.backup (pre-modification backup)

TESTING
-------
- Page reloaded in Chrome
- Standard template accordion now matches requirements
- Ready for client review
