# Sprint B - Share Link v2 Implementation Log
## Date: November 24, 2025
## Task: Short Share IDs with Backwards Compatibility

---

## Summary

Implemented short share link system using Firestore, replacing the previous long base64 URL scheme while maintaining backwards compatibility with existing links.

---

## Files Modified

### 1. js/app-firebase.js
**Changes:**
- Added new "shares" collection API with two functions:
  - `saveShareSnapshot(designKey, payload)` → returns shareId
  - `loadShareSnapshot(shareId)` → returns share data or null

**New Collection: "shares"**
Document schema:
```javascript
{
  designKey: string|null,      // Source design storage key (reference)
  templateKey: string,         // Template identifier
  formData: object,            // Form field values
  uploadedImages: object,      // Image URLs (Firebase Storage URLs)
  projectName: string,         // Display name
  creativeDirection: string,   // Creative direction dropdown value
  createdAt: number,           // Timestamp (Date.now())
  version: string              // Schema version ("2.0")
}
```

### 2. js/app-share-link.js
**Changes:**
- Updated `copyShareableLink()` to use Firestore short IDs instead of base64
- New URL format: `#share=<firestoreDocId>` (typically ~20 chars)
- Added `loadFromShortShareId()` for new scheme
- Renamed old logic to `loadFromLegacyBase64()` for backwards compat
- Added `applyShareLinkData()` as unified pipeline entry point
- Added `navigateToSafeScreen()` for error recovery
- Updated version to 3.0

---

## URL Scheme Changes

### New Scheme (Sprint B)
```
https://example.com/index.html#share=abc123XYZ
```
- Short, friendly URLs
- Share ID is Firestore auto-generated document ID
- Data stored in Firestore "shares" collection

### Legacy Scheme (preserved for backwards compat)
```
https://example.com/index.html#design=eyJ0ZW1wbGF0ZS...
```
- Long base64-encoded URL
- Self-contained (no server lookup)
- Still works, decoded client-side

---

## Flow Changes

### Copy Link Flow (New)
1. Build payload object from current state
2. Call `EmailBriefingDB.saveShareSnapshot()` 
3. Get short shareId from Firestore
4. Build URL: `${baseUrl}#share=${shareId}`
5. Copy to clipboard
6. Show toast: "Shareable link copied to your clipboard."

### Load Flow (New + Legacy)
1. Parse `location.hash`
2. Detect scheme:
   - `#share=` → New short ID scheme
   - `#design=` → Legacy base64 scheme
3. For new scheme:
   - Call `EmailBriefingDB.loadShareSnapshot(shareId)`
   - If not found → show error toast, navigate to home
4. For legacy scheme:
   - Decode base64, parse JSON
   - Convert to unified format
5. Both converge on `applyShareLinkData()` → `applyLoadedProject()`

---

## Error Handling

- Invalid/missing shareId → Toast + navigate to home
- Firestore lookup returns null → Toast + navigate to home  
- Unknown template → Toast + navigate to home
- Hash cleared after error to prevent refresh loop

---

## Testing Checklist

- [ ] Create new share link → verify short URL format
- [ ] Open new share link in new tab → verify loads correctly
- [ ] Test with existing legacy base64 link → verify backwards compat
- [ ] Test invalid shareId → verify error toast + safe navigation
- [ ] Verify images load from Firebase Storage URLs
- [ ] Verify form fields populate correctly
- [ ] Verify creative direction dropdown restores

---

## Notes

- Firestore auto-generated IDs are ~20 characters (reasonably short)
- Document size limit check prevents oversized shares (950KB max)
- Share snapshots are immutable (no update mechanism yet)
- Future: Could add expiration, view counts, or deletion
