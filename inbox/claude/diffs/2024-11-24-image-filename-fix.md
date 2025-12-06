# SPRINT: Clean up image filenames in export ZIP
## Date: 2024-11-24
## File: /Users/marksexton/Desktop/Email-Briefing-App/js/app-export.js

### Summary
Fixed image filename handling in ZIP exports to prevent URL-based subfolder creation.

### Problem
When images were added to the ZIP, full URLs containing slashes were being used as filenames.
JSZip interprets slashes as folder separators, creating nested subfolder structures like:
`images/https:/firebasestorage.googleapis.com/v0/b/.../image.jpg`

### Solution

#### 1. Added `sanitizeImageFilename()` function (lines 120-162)
New utility function that:
- Handles base64 data URLs → extracts extension from MIME type
- Strips query params (`?`) and fragments (`#`) from URLs
- Extracts only the last path segment (after final `/`)
- Removes problematic characters (keeps only `a-zA-Z0-9._-`)
- Falls back to provided fallback name if result is empty
- Ensures extension exists on filename
- Limits filename length to 100 chars

```javascript
function sanitizeImageFilename(url, fallbackName) {
    // Handle base64 data URLs
    if (url.startsWith('data:')) {
        const mimeMatch = url.match(/^data:image\/(\w+)/);
        const ext = mimeMatch ? mimeMatch[1] : 'jpg';
        return fallbackName ? `${fallbackName}.${ext}` : `image.${ext}`;
    }
    
    // Strip query params and fragments
    let cleanUrl = url.split('?')[0].split('#')[0];
    
    // Get just the filename (last segment)
    let rawName = cleanUrl.split('/').pop() || '';
    
    // Remove problematic characters
    rawName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // ... validation and extension handling
}
```

#### 2. Updated `makeExportFileName()` (lines 170-177)
Now delegates to `sanitizeImageFilename()` with proper fallback prefix.

#### 3. Added `getUniqueFilename()` helper (lines 254-265)
Prevents filename collisions by tracking used names and appending `_1`, `_2`, etc.

#### 4. Updated Excel section image handling (lines 279-288)
Uses `sanitizeImageFilename()` for consistency with main image collection.

#### 5. Updated main image loop (lines 309-341)
- Uses `makeExportFileName()` + `getUniqueFilename()` for clean filenames
- Skips base64 images that were already added in Excel section
- Logs sanitized filename transformation

### Before/After Examples

| Before (problematic) | After (fixed) |
|---------------------|---------------|
| `https:/firebasestorage.googleapis.com/v0/b/teladoc-email-app.../hero.png?alt=media&token=abc123` | `hero.png` |
| `data:image/png;base64,iVBORw0...` | `Hero_Image.png` (using slot label) |
| `/assets/images/logo.svg` | `logo.svg` |

### Testing Checklist
- [ ] Export a design with 2-3 uploaded images
- [ ] Inspect ZIP: `images/` folder should contain only flat files
- [ ] No nested folders inside `images/`
- [ ] Filenames are short and human-readable
- [ ] No query params or URL fragments in names
