ACCORDION CORNER RADIUS CORRECTION
===================================
Date: November 30, 2025
Task: Adjust accordion corner radius to match text entry fields

CHANGE MADE
-----------
✅ Updated accordion corner radius from pill shape to match text inputs

CORRECTION
----------
Initial change: var(--radius-full) = 50px (pill shape, matching dropdown)
Corrected to: var(--radius-md) = 8px (matching text entry elements)

FILE MODIFICATION
-----------------
css/builder.css
- Changed: border-radius: var(--radius-full);
  To: border-radius: var(--radius-md);

Applied to: .accordion-item (individual accordion sections)

VISUAL RESULT
-------------
✅ Accordion sections now have subtle rounded corners (8px)
✅ Matches the corner radius of:
   - Text input fields (.form-input)
   - Text area fields (.form-textarea)
   - Other form elements

✅ Creates visual consistency with form inputs rather than dropdown buttons

TESTING
-------
- Page reloaded in Chrome
- Corner radius now matches text entry elements
- Subtle rounded appearance instead of pill shape
