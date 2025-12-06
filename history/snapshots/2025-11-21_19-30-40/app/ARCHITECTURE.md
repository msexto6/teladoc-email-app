# Email Briefing App - Modular Architecture Guide

## New File Structure

```
/Email-Briefing-App/
├── index.html                          # Main HTML (loads all modules)
├── css/
│   └── styles.css                      # All CSS styles
├── js/
│   ├── templates.js                    # Template field definitions
│   ├── app.js                          # Main application controller (400 lines)
│   └── templates/                      # Individual template renderers
│       ├── webinar-invite.js           # ~100 lines
│       ├── webinar-reg-confirmation.js # ~50 lines
│       └── webinar-reminder.js         # ~50 lines (NEW!)
└── assets/
    └── images/
        └── teladoc-logo.png

```

## Benefits of This Architecture

### 1. **Scalability**
- Each new template = one small 50-100 line file
- No need to edit large monolithic files
- Easy to add unlimited templates

### 2. **Maintainability**
- Update individual templates without touching core app
- Clear separation of concerns
- Easy to debug specific templates

### 3. **Editability**
- Small files work perfectly with osascript
- No more escaping nightmares
- Quick, surgical edits

## How to Add a New Template

### Step 1: Add template definition to `js/templates.js`
```javascript
"new-template-name": {
    "name": "Display Name",
    "fields": [
        {"id": "field-id", "label": "Label", "type": "text", "maxChars": 50}
    ]
}
```

### Step 2: Create preview renderer in `js/templates/new-template-name.js`
```javascript
function renderNewTemplateName(formData, uploadedImages) {
    let html = '';
    // Build your preview HTML here
    return html;
}
```

### Step 3: Add script tag to `index.html`
```html
<script src="js/templates/new-template-name.js"></script>
```

### Step 4: Add router case in `js/app.js` updatePreview()
```javascript
else if(templateKey === 'new-template-name') {
    html += renderNewTemplateName(formData, uploadedImages);
}
```

## Editing Existing Templates

To update a template preview (e.g., webinar-reminder):

1. Edit only: `/js/templates/webinar-reminder.js`
2. File is ~50 lines - easy to edit with osascript
3. No need to touch any other files

## File Sizes

- **app.js**: ~400 lines (down from 900+)
- **templates.js**: ~60 lines
- **Each template renderer**: 50-100 lines
- **Total**: Same functionality, much more manageable

## Testing

Open `index.html` in Chrome and:
1. Select each template from dropdown
2. Verify preview renders correctly
3. Test form fields and character counters
4. Test save/load/export functions

## Version History

- **v1.0**: Single monolithic file
- **v2.0**: Split HTML/CSS/JS (Opus refactor)
- **v3.0**: Modular template architecture (Current)

---

Last updated: October 16, 2025
