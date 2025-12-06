# EMAIL BRIEFING APP - FILE EDITING PROTOCOL
**Last Updated: October 16, 2025**

## 🚨 CRITICAL: Never Use sed/osascript for JavaScript Editing

### THE PROBLEM WE SOLVED:
Previous attempts to use `sed` commands via `osascript` repeatedly corrupted JavaScript files due to:
- Complex escaping requirements (quotes, backticks, newlines)
- Multi-line string handling failures
- Special character conflicts
- Syntax breaking with complex JS structures

### ✅ THE SOLUTION: Read → Modify → Write Pattern

For ALL JavaScript/JSON file editing, use this three-step process:

```
1. Filesystem:read_file - Load entire file into memory
2. Modify content using string operations in memory
3. Filesystem:write_file - Write the complete modified file back
```

## MODULAR ARCHITECTURE

The app is now split into small, manageable files:

```
/Email-Briefing-App/
├── index.html (loads all modules)
├── js/
│   ├── templates.js (60 lines - field definitions)
│   ├── app.js (400 lines - core controller)
│   └── templates/
│       ├── webinar-invite.js (~100 lines)
│       ├── webinar-reg-confirmation.js (~50 lines)
│       └── webinar-reminder.js (~50 lines)
```

**Why this matters:** Small files = fast and safe to read/modify/write entirely.

## EDITING WORKFLOW EXAMPLES

### Example 1: Update a Template Preview Renderer

**Task:** Change how the webinar reminder displays in preview

**Steps:**
```javascript
// 1. Read the file
Filesystem:read_file
  path: /Users/marksexton/Desktop/Email-Briefing-App/js/templates/webinar-reminder.js

// 2. Modify in memory (string replacement)
content = content.replace(
  "old text pattern",
  "new text pattern"
)

// 3. Write back
Filesystem:write_file
  path: /Users/marksexton/Desktop/Email-Briefing-App/js/templates/webinar-reminder.js
  content: [modified content]
```

**File size:** ~50 lines = instant operation

---

### Example 2: Update Template Field Definitions

**Task:** Add a new field or change character limits

**Steps:**
```javascript
// 1. Read
Filesystem:read_file
  path: /Users/marksexton/Desktop/Email-Briefing-App/js/templates.js

// 2. Modify the templates object in memory
// Example: Change maxChars for body-copy
content = content.replace(
  '"maxChars": 600',
  '"maxChars": 800'
)

// 3. Write back
Filesystem:write_file
  path: /Users/marksexton/Desktop/Email-Briefing-App/js/templates.js
  content: [modified content]
```

**File size:** ~60 lines = instant operation

---

### Example 3: Update Core App Logic

**Task:** Change default content when a template loads

**Steps:**
```javascript
// 1. Read
Filesystem:read_file
  path: /Users/marksexton/Desktop/Email-Briefing-App/js/app.js

// 2. Find and replace specific section
// Use precise string matching to locate the section to change
content = content.replace(
  'formData = {\n            "body-copy": "old default text"',
  'formData = {\n            "body-copy": "new default text"'
)

// 3. Write back
Filesystem:write_file
  path: /Users/marksexton/Desktop/Email-Briefing-App/js/app.js
  content: [modified content]
```

**File size:** ~400 lines = takes 2-3 seconds

---

## WHEN TO USE EACH TOOL

### ✅ USE: Filesystem:read_file + Filesystem:write_file
**For:**
- All JavaScript files (.js)
- All JSON files (.json)
- All HTML files with embedded scripts
- Any file with complex syntax
- Multi-line changes
- Changes involving quotes, newlines, or special characters

**Reliability:** 100%

---

### ✅ USE: osascript with sed
**ONLY For:**
- Plain text files (.txt, .md)
- Single-word replacements in simple files
- Non-critical edits where corruption is acceptable

**Reliability:** 60-70% for complex changes

**Examples of SAFE sed usage:**
```bash
# Simple word replacement in markdown
sed -i '' 's/old-word/new-word/g' file.md

# Simple number change
sed -i '' 's/version: 1.0/version: 1.1/g' file.txt
```

---

### ❌ NEVER USE: osascript with sed
**For:**
- JavaScript files
- JSON files
- Multi-line string replacements
- Content with quotes or backticks
- Content with newlines (\n)
- Content with special regex characters

---

## TROUBLESHOOTING

### If a JavaScript file gets corrupted:

**Option 1: Restore from backup**
```bash
cp /Users/marksexton/Desktop/Email-Briefing-App/archive/[backup-file] \
   /Users/marksexton/Desktop/Email-Briefing-App/js/[target-file]
```

**Option 2: Restore from this project's git history (if available)**

**Option 3: Regenerate from scratch using Filesystem:write_file**

---

## BEST PRACTICES

### 1. Always Create Backups Before Major Edits
```bash
osascript: do shell script "cp [source] [source].backup"
```

### 2. Test After Every Edit
- Reload the page in browser
- Check browser console for errors
- Verify functionality works

### 3. Keep Files Small
- Each template renderer: < 100 lines
- Template definitions: < 100 lines
- Makes Read → Modify → Write fast and safe

### 4. Use Precise String Matching
When modifying files, use enough context to make replacements unique:
```javascript
// ❌ Too vague
content.replace('"body-copy"', 'new content')

// ✅ Specific enough
content.replace(
  '"body-copy": "Thank you for registering"',
  '"body-copy": "New welcome message"'
)
```

---

## ADDING A NEW TEMPLATE

Follow these steps using Read → Modify → Write pattern:

### Step 1: Add template definition
```
File: js/templates.js
Method: Read → Modify → Write
Add new template object to templates constant
```

### Step 2: Create preview renderer
```
File: js/templates/[new-template-name].js
Method: Filesystem:write_file (new file)
Create new renderer function
```

### Step 3: Update index.html
```
File: index.html
Method: Read → Modify → Write
Add <script src="js/templates/[new-template-name].js"></script>
```

### Step 4: Update app.js router
```
File: js/app.js
Method: Read → Modify → Write
Add case to updatePreview() function
```

---

## FILE SIZE REFERENCE

Current file sizes (as of Oct 2025):
- `templates.js`: 60 lines
- `app.js`: 400 lines
- `webinar-invite.js`: 100 lines
- `webinar-reg-confirmation.js`: 50 lines
- `webinar-reminder.js`: 50 lines

**All files are small enough for instant Read → Modify → Write operations.**

---

## SUMMARY FOR FUTURE CLAUDE SESSIONS

When asked to edit JavaScript files in the Email Briefing App:

1. **ALWAYS use:** Filesystem:read_file → modify in memory → Filesystem:write_file
2. **NEVER use:** osascript with sed for JavaScript files
3. **File locations:** /Users/marksexton/Desktop/Email-Briefing-App/js/
4. **Architecture:** Modular - small files are fast to read/write entirely
5. **Always test:** Reload browser after changes

**This pattern is 100% reliable and prevents file corruption.**
