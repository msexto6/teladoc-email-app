## 2025-11-23T-Load-Pipeline-V2 – Unified Design Loading

**Scope**
- Implement a single, centralized loading pipeline for all design sources.
- Add a global load-state flag to prevent race conditions during form generation and DOM hydration.
- Wire share-link loading into the same pipeline.

**Files**
- js/app-core.js
- js/app-save-load.js
- js/app-share-link.js
- js/app-form.js
- LOAD-PIPELINE-V2-LOG.md

**Details**
- Added `window.isLoadingProject`, `window.beginProjectLoad(source)`, and `window.endProjectLoad()` in `app-core.js` to track when a project is actively loading.
- Created `applyLoadedProject({...})` in `app-save-load.js` to:
  - Set `currentTemplateKey` / `currentTemplate`.
  - Reset and hydrate `window.formData` and `window.uploadedImages`.
  - Call `generateForm(templateKey, templateDefinition)`.
  - Apply saved form data and images to the DOM.
- Updated `loadProjectFromComputer()`, `loadProject()` (file input), and `loadDesignFromCard()` to call `applyLoadedProject` instead of duplicating state/DOM logic.
- Updated `loadFromUrlHash()` in `app-share-link.js` to use `applyLoadedProject` so shared links go through the same pipeline as other loads.
- Added `if (window.isLoadingProject) return;` guards to template-change handlers, input/textarea listeners, and rich-text handlers in `app-form.js` to prevent event handlers from overwriting state while a project is loading.
- Added consistent logging: `🔄 Begin project load`, `📥 Loaded project {...}`, and `✅ Project load complete`.

**Notes**
- All changes are backward compatible with existing saved designs and share links.
- This closes the main Phase 2 goal from the roadmap: “Logic hardening & race condition reduction for loading.”
