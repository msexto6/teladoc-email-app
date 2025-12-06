# Sprint N2 - Manual Testing Guide

## What Was Fixed

**Part 1: Consultant Connect NL** - Already had correct defaults ✅  
**Part 2: Example Defaults** - Fixed to apply to ALL templates ✅

The `applyExampleDefaults()` function now runs for **every template** when creating a new design.

---

## Testing Steps

### Test 1: Consultant Connect NL - Example Defaults
1. Open: `file:///Users/marksexton/Desktop/Email-Briefing-App/index.html`
2. Select **"Consultant Connect NL"** from the template dropdown
3. **Verify these fields are pre-filled:**
   - Subject Line: `"Example subject line"`
   - Preview Text: `"Example preview text"`
   - CTA Button URL: `"https://example.com"`

4. **Verify body copy has two paragraphs:**
   - First paragraph starts: "Research links poor sleep to..."
   - Blank line visible between paragraphs
   - Second paragraph starts: "Members get access to BetterSleep..."

5. **Check preview pane on right:**
   - Should show two distinct paragraphs with spacing
   - Same for Resources and News sections

### Test 2: Partner Essentials NL - Example Defaults
1. Select **"Partner Essentials NL"** 
2. **Verify:**
   - Subject Line: `"Example subject line"`
   - Preview Text: `"Example preview text"`
   - CTA Button URL: `"https://example.com"`
   - Highlight CTA URL: `"https://example.com"`

### Test 3: Education Drip HP - Example Defaults
1. Select **"Education Drip - HP"`
2. **Verify:**
   - Subject Line: `"Example subject line"`
   - Preview Text: `"Example preview text"`
   - CTA Button URL: `"https://example.com"`
   - Feature 1 Title URL: `"https://example.com"`
   - Feature 2 Title URL: `"https://example.com"`

### Test 4: Client Connections NL - Example Defaults
1. Select **"Client Connections NL"`
2. **Verify:**
   - Subject Line: `"Example subject line"`
   - Preview Text: `"Example preview text"`
   - Highlight CTA URL: `"https://example.com"`

### Test 5: Standard Template (Should NOT Change)
1. Select **"Standard Template"**
2. **Verify it still has Lorem Ipsum defaults:**
   - Subject: "Lorem ipsum dolor sit amet"
   - Preview: "Consectetur adipiscing elit sed do eiusmod tempor"
   - CTA URL: `"https://example.com"` ✅ (this should now be example.com)

### Test 6: Saved Design Protection
1. Create a new Consultant Connect NL design
2. Fill in REAL values:
   - Subject: "My Real Subject"
   - Preview: "My Real Preview"
   - CTA URL: "https://mysite.com"
3. Save the design
4. Close/Reload the app
5. Open that saved design
6. **Verify:** All fields show YOUR real values, not "Example..."

### Test 7: Export Functionality
1. Create a new Partner Essentials NL design
2. Leave all example defaults as-is
3. Upload required images if any
4. Click Export
5. **Verify:** Export succeeds without errors

---

## Expected Console Output

When selecting a template, you should see:
```
📋 Initializing formData from template defaultValues...
   ✓ date: "May 2025"
   ✓ headline: "Better sleep leads to better..."
   ✓ body-copy: "Research links poor sleep to..."
   (etc...)
📝 Applying example defaults for NEW design...
   ✓ subject-line: "Example subject line"
   ✓ preview-text: "Example preview text"
   ✓ cta-url: "https://example.com"
📝 Example defaults applied
```

---

## What Should NOT Happen

❌ Saved designs should NOT have "Example..." text  
❌ Standard Template should NOT use "Example..." (it has its own Lorem Ipsum)  
❌ User typing should NOT be overwritten with example defaults  
❌ Opening existing designs should NOT reset fields to examples

---

## If Something's Wrong

Check browser console (Cmd+Opt+J) for errors or unexpected behavior.
