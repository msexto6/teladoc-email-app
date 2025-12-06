# Email Briefing App – Long-Term Roadmap (v2.0)

_Status: Alpha / Prototype Analysis_  
_Last updated: 2025-11-21 (Gemini v2.0 plan + GPT-5.1 structuring)_

---

## 0. Role of This Document

This file is the **canonical long-term plan of record** for the Email Briefing App.

- Describes current architecture, strategic goals, and phased roadmap.
- All agents (Gemini CLI, Claude via MCP, GPT-5.1) should consult this before major refactors.
- Short-term task bundles (Phase 1, 2, 3, …) should stay consistent with this plan.
- Changes to this file should be deliberate and logged in the changelog at the bottom.

---

## 1. Current Architecture Overview

The Email Briefing App is a **monolithic Single Page Application (SPA)** for marketers to generate email content briefs.

**Frontend**

- Vanilla JavaScript (modular, non-framework).
- State managed via window-level globals:
  - `window.formData` – source of truth for current email content.
  - `window.currentTemplate` / `window.currentTemplateKey` – active template definition.

**Persistence**

- **IndexedDB**  
  - Local caching of “My Designs” and exports.

- **Firebase Firestore**  
  - Cloud storage for shared designs and folders.
  - Collections for designs, folders, exports, etc.

- **File System Access API**  
  - Direct save/load of designs to the user’s hard drive.

**Output / Rendering**

- Live preview panel renders HTML client-side.
- Export pipeline uses JSZip / HTML2Canvas to generate downloadable assets.

**Shared Memory / Tooling**

- Shared memory bus at: `~/Desktop/email-app-shared-memory`
  - `app/` – current app docs & meta (including this roadmap).
  - `history/` – snapshots created by Claude MCP.
  - `inbox/` / `outbox/` – AI task I/O (diffs, logs, summaries).

---

## 2. Strategic Goals

1. **Stability**
   - Eliminate race conditions when loading/saving projects.
   - Ensure form fields and preview are always in sync with the active template and design.

2. **Scalability**
   - Move image storage from **Base64 strings in Firestore documents** to **Blob/Storage URLs**.
   - Prevent Firestore 1 MB document limit crashes.

3. **Maintainability**
   - Decouple configuration from logic:
     - Template schemas in `templates.js`
     - Rendering & behavior in `app-form.js`, `app-preview.js`, etc.
   - Make it easy to add or update templates without touching core logic.

4. **Future Readiness**
   - Clean up architecture and naming so additional developers (or future-you) can work on the app without spelunking through global state and ad-hoc patterns.

---

## 3. Execution Roadmap

### Phase 1 – Storage Refactor _(Priority Alpha)_  
**Status: ✅ Completed (2025-11-21 / 22, Claude via MCP)**

**Goal:**  
Prevent “Document Too Large” crashes by decoupling heavy assets (images) from metadata.

**Original Gemini Tasks**

- **Task 1.1** – Refactor `app-images.js` to stop converting images to Base64 for storage.
- **Task 1.2** – Update `app-firebase.js` with an `uploadImage(file)` method that uploads to Firebase Storage.
- **Task 1.3** – Modify save logic so Firestore documents only store **image URLs**, not raw image data.

**Notes:**  
Claude’s Phase 1 implementation aligns with this: images now go to Firebase Storage, Firestore stores URLs only, and a safety guard prevents > ~950KB documents. Backward compatibility for legacy Base64 designs is preserved.

---

### Phase 2 – Logic Hardening & Race Conditions  
**Status: 🔄 In Progress**

**Goal:**  
Fix “ghost data” / blank-field bugs and remove timing-sensitive behavior.

**Planned Tasks (from Gemini)**

- **Task 2.1** – Implement a strict **Promise-based loading sequence** in `app-save-load.js`.
  - Ensure all async work (fetch design, populate state, build form) is awaited in a clear order.
- **Task 2.2** – Prevent `app-form.js` listeners from firing or overwriting state **until** the load promise resolves.
  - Use explicit `isLoading` flags or staged initialization.
- **Task 2.3** – Centralize folder tree logic:
  - Merge duplicate fetch logic in `folders-trash.js` and `app-folder-hierarchy.js`.
  - One source of truth for folder structure, shared by both grid view and modal.

**Additional work already done in this phase (GPT + Claude):**

- Robust `loadTemplateByKey` with detailed diagnostics.
- Safer `generateForm` that accepts template key + definition and validates inputs.
- Synchronized globals for template state (`currentTemplate`, `window.currentTemplate`, etc.).
- Hardened `updatePreview` with better fallback logic.

---

### Phase 3 – Export Optimization  
**Status: 📝 Planned**

**Goal:**  
Reduce database bloat and make export behavior predictable and efficient.

**Planned Tasks**

- **Task 3.1** – Refactor `app-export.js`  
  - Stop saving generated ZIPs (Base64) into Firestore `exports` collection.
- **Task 3.2** – Change export workflow to be **ephemeral**:
  - Generate → download immediately on client, _or_
  - Optionally upload ZIP to Blob/Storage if long-term history is required.
- **Task 3.3** – Replace unstable `setTimeout` hack in `app-rich-text.js`  
  - Use a **MutationObserver** or appropriate editor events so link formatting and rich-text behaviors apply reliably.

---

### Phase 4 – Architecture Cleanup (Future)  
**Status: ⏳ Future**

**Goal:**  
Prepare the codebase for more templates, more contributors, and potential framework migration (if ever needed).

**Planned Tasks**

- **Task 4.1** – Standardize naming:
  - Rename `EmailBriefingDB` to something like `StorageService` to clarify that it wraps **Firestore + IndexedDB** (and possibly Storage).
  - Align comments with actual behavior (no more “IndexedDB” wording when it’s really Firestore).
- **Task 4.2** – Move hardcoded default template content:
  - Shift defaults from `app-form.js` into `templates.js` definitions.
  - Keep `app-form.js` focused on rendering logic and field behavior rather than content.

---

## 4. Agent Protocol

### GPT-5.1 (Architect / Coordinator)

- Use this roadmap to:
  - Break work into **clear, finite tasks** for Claude and/or Gemini.
  - Ensure tasks respect:
    - “No Base64 in Firestore” going forward.
    - Stability and backward compatibility.
- When major direction changes are agreed with Mark, propose **explicit patches** to `email-app-roadmap.md` (to be applied by Mark or Claude).

### Claude (Engineer via MCP + Shared Memory)

- Operates on the local project and shared memory directories.
- Must follow MCP editing protocol:
  - **Read → Modify → Write**, with diffs and logs under `email-app-shared-memory/inbox/claude/`.
- When touching storage-related code:
  - Preserve compatibility with legacy Base64 data where required (e.g., convert & upload if `isBase64` is detected).
- Should **not** fundamentally change the architecture or roadmap without an explicit “Roadmap update” task from Mark / GPT.

### Gemini (Analyst / System Designer)

- Provides deep analysis of the codebase and generates:
  - Architectural overviews
  - Risk assessments
  - Long-term plans like this roadmap
- When generating a new plan:
  - Output it as Markdown suitable to replace or patch `email-app-roadmap.md`.
  - Clearly mark the version and date (e.g., “Technical Roadmap v3.0”).

---

## 5. Changelog

- **2025-11-21** – Gemini generates “Technical Roadmap v2.0”; GPT-5.1 integrates it into this structured roadmap and saves as `email-app-roadmap.md`.  
- _(future entries go here – one line per meaningful roadmap change)_
