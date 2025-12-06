ACCORDION LABEL AND STYLING UPDATES
====================================
Date: November 30, 2025
Task: Update accordion labels and corner radius

CHANGES MADE
------------
1. ✅ Changed "Banner & Main Section" → "Main content"
2. ✅ Changed "Feature Section" → "Featured content"
3. ✅ Updated accordion corner radius to match dropdown (50px pill shape)

FILE MODIFICATIONS
------------------

1. js/templates.js
   - Line: "label": "Banner & Main Section"
     Changed to: "label": "Main content"
   
   - Line: "label": "Feature Section"
     Changed to: "label": "Featured content"

2. css/builder.css
   - Changed: border-radius: var(--radius-xl);  /* 16px */
     To: border-radius: var(--radius-full);  /* 50px */
   
   Applied to:
   - .accordion-item (individual accordion sections)

VISUAL RESULT
-------------
✅ Accordion headers now display:
   - "Main content" (instead of "Banner & Main Section")
   - "Featured content" (instead of "Feature Section")

✅ Corner radius now matches dropdown:
   - Both use var(--radius-full) = 50px
   - Creates pill-shaped rounded corners
   - Consistent visual language across UI elements

TECHNICAL DETAILS
-----------------
- Used sed commands for text replacement
- Maintained all field groupings unchanged
- Only label text and border-radius values modified
- No structural changes to templates or CSS layout

TESTING
-------
- Page reloaded in Chrome
- Standard template accordion displays new labels
- Corner radius matches "I want the creative team to..." dropdown
