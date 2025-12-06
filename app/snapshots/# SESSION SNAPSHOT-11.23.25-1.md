# SESSION SNAPSHOT
Date: 2025-11-23
Session ID: 2025-11-23T-Load-Pipeline-V2

## 1. Summary
Implemented a unified loading pipeline for the Email Briefing App so that all design load paths (My Designs cards, load-from-file, load-from-computer, and share links) use a single function to hydrate global state, rebuild the form, and populate fields. Added a global `isLoadingProject` flag and guards in form event handlers to prevent race conditions and ghost overwrites during loads.

## 2. Files Likely Touched
- js/app-core.js
- js/app-save-load.js
- js/app-share-link.js
- js/app-form.js
- LOAD-PIPELINE-V2-LOG.md (doc)

## 3. Key Decisions
- Use `window.isLoadingProject` as the single source of truth for whether a project is currently being loaded.
- Centralize all load behavior in `applyLoadedProject({ source, templateKey, templateDefinition, formData, uploadedImages, projectName })` to avoid duplicated state/DOM logic across different loaders.
- Ensure all form-related event handlers short-circuit when `isLoadingProject` is true, so programmatic DOM updates during load don’t trigger unintended state changes.
- Maintain backward compatibility with existing saved designs and share links.

## 4. Risks / TODOs
- [ ] Need a full regression pass on S3 to ensure no subtle timing issues remain with rich text fields and image handling.
- [ ] Folder hierarchy / trash logic is still split across multiple modules and not yet fully unified.
- [ ] Export remains tied to current Firestore/Storage behavior; Phase 3 export refactor still pending.

## 5. Next Suggested Sprint
**Title:** Phase 3 – Export Refactor (Ephemeral ZIPs)

**Goals:**
- Stop persisting ZIP blobs into Firestore; keep exports entirely client-side for now.
- Clean up export-related timing hacks (especially around rich text and preview HTML).
- Make export errors more user-friendly (e.g., explicit messages when PDF generation fails or an asset is missing).
