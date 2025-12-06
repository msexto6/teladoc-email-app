EMAIL BRIEFING APP - PROJECT INSTRUCTIONS & FILE OPERATIONS PROTOCOL
===========================================================================

PROJECT OVERVIEW:
-----------------
Building a custom web form + email preview tool for marketers to map out content for email templates.

Location: /Users/marksexton/Desktop/Email-Briefing-App/
Main file: index.html
Architecture: Modular JavaScript (templates.js + app.js + individual template renderers)

FEATURES:
- Form with fields matching Excel structure
- Live email preview that updates as they type
- Real-time character counting with visual warnings
- Image upload with instant preview
- Mobile/desktop view toggle

MODULAR FILE STRUCTURE:
-----------------------
/Email-Briefing-App/
├── index.html                                  # Main HTML (loads all modules)
├── css/
│   └── styles.css                              # All CSS styles
├── js/
│   ├── templates.js                            # Template field definitions (60 lines)
│   ├── app.js                                  # Core application controller (400 lines)
│   └── templates/                              # Individual template preview renderers
│       ├── webinar-invite.js                   # ~100 lines
│       ├── webinar-reg-confirmation.js         # ~50 lines
│       └── webinar-reminder.js                 # ~50 lines
└── assets/
    └── images/
        └── teladoc-logo.png

WHY MODULAR ARCHITECTURE?
- Small files (50-100 lines) are easy to edit
- Each template isolated in its own file
- Adding new templates doesn't require touching existing code
- Scalable as project grows

==============================================
FILE EDITING PROTOCOL - CRITICAL INFORMATION
==============================================

⚠️ PROBLEM WITH PREVIOUS APPROACH:
-----------------------------------
Using osascript + sed for JavaScript files causes corruption due to:
- Complex escaping requirements (quotes, backticks, newlines)
- Multi-line string handling failures
- Special character conflicts
- Syntax breaking with complex JS structures

❌ NEVER USE: osascript with sed for JavaScript/JSON files
✅ ALWAYS USE: Read → Modify → Write pattern for JavaScript/JSON files

FILE OPERATION METHODS BY FILE TYPE:
-------------------------------------

### FOR JAVASCRIPT FILES (.js) AND JSON FILES (.json):
**Method: Read → Modify in Memory → Write**

1. READING FILES
   Tool: Filesystem:read_file
   Example: Filesystem:read_file with path="/Users/marksexton/Desktop/Email-Briefing-App/js/app.js"
   Status: ✅ 100% reliable

2. MODIFYING IN MEMORY
   - Load entire file content into memory
   - Use string operations (replace, split, join, etc.)
   - Make all modifications in memory
   Status: ✅ 100% reliable, no escaping issues

3. WRITING BACK
   Tool: Filesystem:write_file
   Example: Filesystem:write_file with path and modified content
   Status: ✅ 100% reliable

**Why this works:**
- No escaping required
- Multi-line strings handled perfectly
- All special characters preserved
- Small files (50-400 lines) = instant operations

### FOR PLAIN TEXT/MARKDOWN FILES (.txt, .md):
**Method: osascript with sed (ONLY for simple replacements)**

Tool: Control your Mac:osascript
Example: do shell script "sed -i '' 's/old-word/new-word/g' /path/to/file.md"
Status: ✅ Works for simple text files
⚠️ Use ONLY for single-word replacements in plain text

### FOR HTML FILES:
**Method: Depends on complexity**
- Simple text changes: Read → Modify → Write
- External CSS/JS references: Read → Modify → Write
Status: ✅ Read → Modify → Write is safest

### FOR FILE OPERATIONS (Copy, Move):
**Method: osascript with shell commands**

Tool: Control your Mac:osascript
Examples:
- Copy: do shell script "cp /source/path /dest/path"
- Move: do shell script "mv /source/path /dest/path"
- Create directory: do shell script "mkdir -p /path/to/dir"
Status: ✅ Works reliably

EDITING WORKFLOW EXAMPLES:
---------------------------

### Example 1: Update Template Preview Renderer
Task: Change how webinar reminder displays

Steps:
```
1. Filesystem:read_file
   path: /Users/marksexton/Desktop/Email-Briefing-App/js/templates/webinar-reminder.js

2. Modify in memory:
   content = content.replace("old text", "new text")

3. Filesystem:write_file
   path: /Users/marksexton/Desktop/Email-Briefing-App/js/templates/webinar-reminder.js
   content: [modified content]

4. Test: Reload browser (Cmd+Shift+R)
```

### Example 2: Change Character Limit
Task: Update maxChars for a field

Steps:
```
1. Filesystem:read_file
   path: /Users/marksexton/Desktop/Email-Briefing-App/js/templates.js

2. Modify in memory:
   content = content.replace('"maxChars": 600', '"maxChars": 800')

3. Filesystem:write_file
   path: /Users/marksexton/Desktop/Email-Briefing-App/js/templates.js
   content: [modified content]

4. Test: Reload browser
```

### Example 3: Update Default Content
Task: Change default body copy text

Steps:
```
1. Filesystem:read_file
   path: /Users/marksexton/Desktop/Email-Briefing-App/js/app.js

2. Modify in memory:
   Find the specific formData assignment and replace the default text
   Use precise string matching with enough context

3. Filesystem:write_file
   path: /Users/marksexton/Desktop/Email-Briefing-App/js/app.js
   content: [modified content]

4. Test: Reload browser
```

TOOLS REFERENCE:
----------------

✅ USE FOR JAVASCRIPT/JSON FILES:
- Filesystem:read_file
- Filesystem:write_file
- Filesystem:list_directory

✅ USE FOR FILE OPERATIONS:
- Control your Mac:osascript (for cp, mv, mkdir)

✅ USE FOR BROWSER TESTING:
- Control Chrome:open_url
- Control Chrome:reload_tab
- Control Chrome:get_current_tab

⚠️ USE WITH CAUTION (plain text only):
- Control your Mac:osascript with sed (ONLY for .txt, .md files)

❌ NEVER USE FOR JAVASCRIPT FILES:
- bash_tool (container isolation issue)
- str_replace (fails on mounted volumes)
- Filesystem:edit_file (not reliable for Mac desktop)
- osascript with sed for .js/.json files (causes corruption)

WORKFLOW FOR THIS PROJECT:
--------------------------

When user requests changes:

1. **Identify the file to edit**
   - Template preview? → js/templates/[name].js
   - Field definitions? → js/templates.js
   - Core logic? → js/app.js
   - HTML structure? → index.html

2. **Use Read → Modify → Write pattern**
   - Read the entire file
   - Make changes in memory using string operations
   - Write the complete modified file back

3. **Always test after changes**
   - Reload browser with Cmd+Shift+R (hard refresh)
   - Check console for errors (Cmd+Option+J)
   - Verify functionality works

4. **Create backups before major edits**
   osascript: do shell script "cp [source] [source].backup"

ADDING A NEW TEMPLATE:
----------------------

Step 1: Add template definition to js/templates.js
```
Method: Read → Modify → Write
Add new template object to templates constant
```

Step 2: Create preview renderer js/templates/[name].js
```
Method: Filesystem:write_file (new file)
Create renderTemplateName(formData, uploadedImages) function
```

Step 3: Update index.html
```
Method: Read → Modify → Write
Add <script src="js/templates/[name].js"></script>
```

Step 4: Update app.js router
```
Method: Read → Modify → Write
Add case to updatePreview() function routing logic
```

TROUBLESHOOTING:
----------------

### JavaScript file corrupted?
1. Check archive folder for backups: /Users/marksexton/Desktop/Email-Briefing-App/archive/
2. Restore: osascript: do shell script "cp [backup] [target]"
3. If no backup, regenerate using Filesystem:write_file

### Browser console shows errors?
1. Open console: Cmd+Option+J
2. Check for syntax errors, undefined variables
3. Verify all script files are loading (check Network tab)

### Preview not updating?
1. Hard refresh: Cmd+Shift+R
2. Clear cache: Cmd+Option+E, then reload
3. Check if formData/uploadedImages are being updated

### Changes not showing?
1. Verify file was actually written (check file timestamp)
2. Ensure correct file path was used
3. Try hard refresh in browser

BEST PRACTICES:
---------------

1. **Always use precise string matching**
   ❌ Too vague: content.replace('"body-copy"', 'new')
   ✅ Specific: content.replace('"body-copy": "old text"', '"body-copy": "new text"')

2. **Keep files small**
   - Template renderers: < 100 lines
   - Makes Read → Modify → Write fast and safe

3. **Test immediately after every edit**
   - Don't make multiple changes without testing
   - Easier to debug when you know what broke it

4. **Use the modular architecture**
   - Edit only the specific file that needs changing
   - Don't touch other files unnecessarily

5. **Create backups before complex edits**
   - Simple one-line changes: No backup needed
   - Major refactoring: Always backup first

CRITICAL REMINDERS:
-------------------

⚠️ The modular architecture we built SOLVES the sed problem
⚠️ Small files (50-100 lines) are FAST to read/modify/write entirely
⚠️ Read → Modify → Write is 100% reliable for JavaScript
⚠️ Never try to use sed on JavaScript files again - it will corrupt them

KEY PRINCIPLE:
--------------
**Work WITH the tools, not against them.**
- Filesystem tools are designed for reading/writing entire files → Use them that way
- sed is designed for plain text → Only use it for plain text
- osascript is for shell commands → Use it for file operations, not code editing

This approach is scalable, reliable, and maintainable.

SUMMARY FOR FUTURE SESSIONS:
-----------------------------

1. Project location: /Users/marksexton/Desktop/Email-Briefing-App/
2. Architecture: Modular JavaScript with small files
3. Editing method: Read → Modify in Memory → Write
4. Never use sed for JavaScript files
5. Always test after changes
6. Full docs: EDITING-PROTOCOL.md and QUICK-REFERENCE.txt

**This protocol eliminates file corruption and makes the project scalable.**
