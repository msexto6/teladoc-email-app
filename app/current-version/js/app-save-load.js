// LOAD PIPELINE V2: Centralized loading system for all design sources
// TASK-004: Updated loadDesignById to properly await async generateForm
// Global variables to track current file handle (on window object for cross-file access)
window.currentFileHandle = null;
window.currentProjectName = null;
window.currentLocalStorageKey = null; // Track which My Designs entry is open

// ============================================
// SPRINT F: DESIGN LOAD STABILITY
// ============================================

// Flag to track when a design is being loaded (prevents race conditions)
let isDesignLoading = false;

// Expose flag for listener guards
window.isDesignLoading = () => isDesignLoading;

// ============================================
// SPRINT N3: NEW VS EXISTING DESIGN TRACKING
// ============================================

/**
 * SPRINT N3: Track whether current design is new (unsaved) or existing (has been saved)
 * - null = brand new design (no designId yet)
 * - string = existing design ID (user has saved at least once)
 * This is the single source of truth for "is this a new design?"
 */
let currentDesignId = null;

/**
 * SPRINT N3: Helper to determine if we're working on a brand-new design
 * @returns {boolean} true if this is a new design (never saved), false if existing
 */
function isNewDesign() {
    return !currentDesignId;
}

// Expose globally for use in other modules
window.currentDesignId = null;
window.isNewDesign = isNewDesign;

/**
 * SPRINT F: Atomic design loader
 * TASK-004: Updated with proper async/await for form generation and logging
 * Single async function that handles all design loading paths
 * Prevents half-loaded forms and race conditions
 * 
 * @param {string} designId - The design ID to load
 * @param {Object} options - Optional configuration
 * @param {boolean} options.fromShareLink - Whether loading from a share link
 * @param {string} options.source - Source identifier for logging
 */
async function loadDesignById(designId, options = {}) {
    if (!designId) {
        console.error('loadDesignById: No design ID provided');
        return;
    }

    // Prevent overlapping loads
    if (isDesignLoading) {
        console.warn('Design load requested while another load is in progress - ignoring');
        return;
    }

    isDesignLoading = true;
    console.log('🔒 loadDesignById started:', designId, options);
    console.log('🏁 TASK-004: Template load started');

    try {
        // SPRINT N3: Mark as existing design BEFORE any form initialization
        currentDesignId = designId;
        window.currentDesignId = designId;
        console.log('🆔 SPRINT N3: Set currentDesignId =', designId, '(existing design)');
        
        // 1) Fetch design from storage
        const dataStr = await dbGet(designId);
        if (!dataStr) {
            console.error('Design not found:', designId);
            if (typeof showNotification === 'function') {
                showNotification('Design not found', 'error');
            } else {
                alert('Design not found');
            }
            return;
        }

        // Parse and extract design data (handle nested Firestore structure)
        const rawData = JSON.parse(dataStr);
        const designRecord = rawData.data || rawData;

        // Check if this is an export file
        if (designRecord && designRecord.isExport) {
            console.log('This is an export file - downloading instead of opening');
            if (typeof downloadExportFile === 'function') {
                downloadExportFile(designId);
            }
            return;
        }

        // 2) Extract templateKey, formData, uploadedImages
        const templateKey = designRecord.templateId || designRecord.template;
        const formData = designRecord.formData || {};
        const uploadedImages = designRecord.uploadedImages || {};
        const projectName = designRecord.projectName || "Saved Design";

        console.log('✅ Design data loaded:', {
            templateKey,
            formDataKeys: Object.keys(formData).length,
            imagesCount: Object.keys(uploadedImages).length
        });

        if (!templateKey) {
            console.error('Missing template information in design');
            alert('This project is missing template information and cannot be loaded.');
            return;
        }

        // Get template definition
        const templateDefinition = templates[templateKey];
        if (!templateDefinition) {
            console.error('Template not found:', templateKey);
            alert(`Template "${templateKey}" not found. This project may be from an older version or may be corrupted.`);
            return;
        }

        if (!templateDefinition.fields || !Array.isArray(templateDefinition.fields)) {
            console.error('Template has no valid fields array');
            alert('Template definition is invalid.');
            return;
        }

        // --- SPRINT N3b: Fill empty fields with example defaults (safe, empty-only) ---
        if (typeof window.applyExampleDefaults === "function") {
            window.applyExampleDefaults(formData, templateDefinition.fields);
        }

        // TASK-003: Use AppState for centralized state reset before loading
        if (typeof window.AppState !== 'undefined' && typeof window.AppState.resetBeforeLoad === 'function') {
            window.AppState.resetBeforeLoad(designId);
        } else {
            // Fallback: Manual state clearing if AppState not available
            console.log("⚠️ AppState not available, using manual state reset fallback");
        }

        // CRITICAL: Save navigation state BEFORE loading (for My Designs back button)
        if (typeof navigationHistory !== 'undefined' && typeof currentFolderPath !== 'undefined') {
            const myDesignsScreen = document.getElementById('my-designs-screen');
            if (myDesignsScreen && myDesignsScreen.classList.contains('active')) {
                navigationHistory = {
                    page: 'my-designs',
                    folderPath: [...currentFolderPath]
                };
                console.log('Saved navigation history:', navigationHistory);
            }
        }

        // Store tracking variables
        window.currentLocalStorageKey = designId;
        window.currentFileHandle = null; // Clear file handle if switching from computer file

        // Update UI elements
        const templateSelector = document.getElementById("template-selector");
        if (templateSelector) {
            templateSelector.value = templateKey;
        }

        document.getElementById("action-buttons").classList.add("active");
        document.getElementById("creative-direction-section").classList.add("active");

        // Restore creative direction dropdown if saved
        if (designRecord.creativeDirection) {
            const creativeDropdown = document.getElementById("creative-direction-top");
            if (creativeDropdown) {
                creativeDropdown.value = designRecord.creativeDirection;
            }
        }

        // TASK-004: Properly await async generateForm
        if (typeof generateForm === 'function') {
            // generateForm now returns a Promise that resolves when DOM is ready
            await generateForm(templateKey, templateDefinition);
            console.log('✅ TASK-004: Form render completed');
        } else {
            console.error('generateForm function not found');
        }
        
        // TASK-004: State hydration begins AFTER form is ready
        console.log('⏳ TASK-004: State hydration started');

        // 4) Hydrate fields with formData
        if (typeof applySavedFormDataToDOM === 'function') {
            applySavedFormDataToDOM(formData);
        }

        // 5) Restore images
        if (typeof applySavedImagesToDOM === 'function') {
            await applySavedImagesToDOM(uploadedImages);
        }

        console.log('✅ TASK-004: Done');

        // 6) Update global state
        window.currentTemplateKey = templateKey;
        window.currentTemplate = templateDefinition;
        currentTemplateKey = templateKey;
        currentTemplate = templateDefinition;
        window.currentProjectName = projectName;

        // Update global formData and uploadedImages
        Object.keys(window.formData).forEach(key => delete window.formData[key]);
        Object.assign(window.formData, formData);
        
        Object.keys(window.uploadedImages).forEach(key => delete window.uploadedImages[key]);
        Object.assign(window.uploadedImages, uploadedImages);

        // Update builder header to Design Mode
        window.builderMode = 'design';
        const templateName = templateDefinition.name || 'Unknown Template';
        if (typeof window.updateBuilderHeader === 'function') {
            window.updateBuilderHeader({
                mode: 'design',
                designName: projectName,
                templateName: templateName
            });
        }

        // Navigate to builder if needed
        if (!options.skipNavigation && typeof showScreen === 'function') {
            showScreen('builder');
        }

        // 7) Trigger a single preview update at the end
        if (typeof updatePreview === 'function') {
            updatePreview();
        }

        // Mark form as clean and start auto-save
        if (typeof markFormAsClean === 'function') markFormAsClean();
        if (typeof startAutoSave === 'function') startAutoSave();

        console.log('✅ loadDesignById completed successfully');

    } catch (err) {
        console.error('❌ Error in loadDesignById:', err);
        console.error('Error stack:', err.stack);
        if (typeof showNotification === 'function') {
            showNotification('There was a problem loading this design.', 'error');
        } else {
            alert('Error loading project: ' + err.message);
        }
    } finally {
        // Clear the loading flag
        isDesignLoading = false;
        console.log('🔓 loadDesignById finished (flag cleared)');
    }
}

// Expose globally
window.loadDesignById = loadDesignById;

// ============================================
// INDEXEDDB HELPER FUNCTIONS
// ============================================

async function dbSave(key, value) {
    // Determine if this is a design or export based on key prefix
    if (key.startsWith('email-export-')) {
        const data = JSON.parse(value);
        await EmailBriefingDB.saveExport(key, data);
    } else {
        const data = JSON.parse(value);
        await EmailBriefingDB.saveDesign(key, data);
    }
}

async function dbGet(key) {
    // Try designs first
    let item = await EmailBriefingDB.getDesign(key);
    if (item) return JSON.stringify(item);
    
    // Try exports
    item = await EmailBriefingDB.getExport(key);
    if (item) return JSON.stringify(item);
    
    return null;
}

async function dbDelete(key) {
    // Try deleting from both stores
    try {
        await EmailBriefingDB.deleteDesign(key);
    } catch (e) {
        // Ignore errors, might not exist in this store
    }
    try {
        await EmailBriefingDB.deleteExport(key);
    } catch (e) {
        // Ignore errors, might not exist in this store
    }
}

async function dbGetAllKeys() {
    const designs = await EmailBriefingDB.getAllDesigns();
    const exports = await EmailBriefingDB.getAllExports();
    return [...designs.map(d => d.id), ...exports.map(e => e.id)];
}

// ============================================
// SAFE FORM DATA REPLAY (TASK G)
// ============================================

/**
 * Safely applies saved form data to DOM elements
 * Skips fields that no longer exist (template may have changed)
 * Never throws on missing elements
 */
function applySavedFormDataToDOM(savedFormData = {}) {
    if (!savedFormData || typeof savedFormData !== 'object') {
        console.warn('⚠️ No valid formData to restore');
        return;
    }

    console.log('🔧 applySavedFormDataToDOM starting with', Object.keys(savedFormData).length, 'fields');

    Object.entries(savedFormData).forEach(([fieldId, value]) => {
        const el = document.getElementById(fieldId);

        if (!el) {
            console.warn(`⚠️ Skipping saved field "${fieldId}" – element not found in DOM (template may have changed).`);
            return;
        }

        try {
            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    el.checked = !!value;
                } else {
                    el.value = value ?? '';
                    // Fire input event so counters / preview stay in sync
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } else if (el.contentEditable === 'true') {
                el.innerHTML = value ?? '';
                // Fire input event for contentEditable fields too
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
            console.log(`✅ Restored field "${fieldId}"`);
        } catch (err) {
            console.error(`❌ Failed to restore field "${fieldId}"`, err);
        }
    });

    console.log('✅ applySavedFormDataToDOM completed');
}

/**
 * Safely restores uploaded images to drop zones
 * Uses the syncImageDropzonesFromState function from app-images.js
 * Skips image slots that no longer exist (template may have changed)
 * Never throws on missing elements
 * 
 * SPRINT FIX: Now uses ID-based selector (fieldId + "-zone") instead of data-image-slot
 */
function applySavedImagesToDOM(savedUploadedImages = {}) {
    if (!savedUploadedImages || typeof savedUploadedImages !== 'object') {
        console.warn('⚠️ No valid uploadedImages to restore');
        return;
    }

    const imageCount = Object.keys(savedUploadedImages).length;
    if (imageCount === 0) {
        console.log('🖼️ applySavedImagesToDOM: No images to restore');
        return;
    }

    console.log('🖼️ applySavedImagesToDOM starting with', imageCount, 'images');

    // SPRINT FIX: Use the dedicated syncImageDropzonesFromState function from app-images.js
    // This properly syncs dropzone UI with uploadedImages state using ID-based selectors
    if (typeof window.syncImageDropzonesFromState === 'function') {
        window.syncImageDropzonesFromState(savedUploadedImages);
        console.log('✅ applySavedImagesToDOM completed via syncImageDropzonesFromState');
        return;
    }

    // Fallback: Use restoreUploadedImages if available
    if (typeof window.restoreUploadedImages === 'function') {
        window.restoreUploadedImages(savedUploadedImages);
        console.log('✅ applySavedImagesToDOM completed via restoreUploadedImages');
        return;
    }

    // Last resort fallback: Direct DOM manipulation using ID-based selector
    console.log('⚠️ Using fallback direct DOM manipulation for images');
    Object.entries(savedUploadedImages).forEach(([fieldId, url]) => {
        // Use ID pattern: fieldId + "-zone" (e.g., "hero-image-zone")
        const dropZone = document.getElementById(fieldId + "-zone");

        if (!dropZone) {
            console.warn(`⚠️ Skipping image "${fieldId}" – drop zone not found (template may have changed).`);
            return;
        }

        try {
            dropZone.innerHTML = `
                <div class="image-preview-container">
                    <img src="${url}" class="image-preview">
                    <div class="image-hover-hint">Double-click to replace</div>
                    <button type="button" class="image-remove-btn" onclick="removeImage('${fieldId}')">&times;</button>
                </div>
            `;
            dropZone.classList.add('has-image');
            console.log(`✅ Restored image "${fieldId}" via fallback`);
        } catch (err) {
            console.error(`❌ Failed to restore image "${fieldId}"`, err);
        }
    });

    console.log('✅ applySavedImagesToDOM completed via fallback');
}

// ============================================
// LOAD PIPELINE V2 - CENTRALIZED APPLICATION
// ============================================

/**
 * Apply a loaded project to global state, rebuild the form, and populate fields.
 * This is the single pipeline used by all load sources.
 *
 * @param {Object} options
 * @param {string} options.source       - "load-from-file" | "load-from-card" | "load-from-computer" | "share-link"
 * @param {string} options.templateKey
 * @param {Object} options.templateDefinition
 * @param {Object} options.formData
 * @param {Object} options.uploadedImages
 * @param {string} [options.projectName]
 */
async function applyLoadedProject({
    source,
    templateKey,
    templateDefinition,
    formData,
    uploadedImages,
    projectName
}) {
    try {
        window.beginProjectLoad(source);

        // Set global template state
        window.currentTemplateKey = templateKey;
        window.currentTemplate    = templateDefinition;
        currentTemplateKey        = templateKey;
        currentTemplate           = templateDefinition;

        // Reset and hydrate global formData
        Object.keys(window.formData).forEach(key => delete window.formData[key]);
        Object.assign(window.formData, formData || {});

        // Reset and hydrate global uploadedImages
        Object.keys(window.uploadedImages).forEach(key => delete window.uploadedImages[key]);
        Object.assign(window.uploadedImages, uploadedImages || {});

        if (projectName) {
            window.currentProjectName = projectName;
        }

        // Log loaded data
        console.log("📥 Loaded project", {
            source,
            templateKey,
            formKeys: Object.keys(window.formData),
            imageKeys: Object.keys(window.uploadedImages)
        });

        // Build the form for this template
        generateForm(templateKey, templateDefinition);

        // SPRINT FIX: Increased timeout to 50ms to ensure DOM elements exist
        // before applying saved values. The form generation may need a frame
        // to complete before dropzones can be queried.
        setTimeout(() => {
            if (typeof applySavedFormDataToDOM === "function") {
                applySavedFormDataToDOM(window.formData);
            }
            if (typeof applySavedImagesToDOM === "function") {
                applySavedImagesToDOM(window.uploadedImages);
            }
            // Update preview after all data is applied
            if (typeof updatePreview === "function") {
                updatePreview();
            }
        }, 50);
    } catch (error) {
        console.error("❌ Error applying loaded project:", error);
        throw error;
    } finally {
        // Delay slightly so DOM work can settle before clearing flag
        setTimeout(() => {
            window.endProjectLoad();
        }, 100);
    }
}

// ============================================
// SAVE TO COMPUTER
// ============================================

async function saveToComputer() {
    const projectName = document.getElementById("project-name-input").value.trim();
    if (!projectName) {
        alert("Please enter a project name");
        return;
    }

    try {
        // Use File System Access API to save file
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: projectName + '.json',
            types: [{
                description: 'Email Briefing Projects',
                accept: { 'application/json': ['.json'] }
            }]
        });

        // SPRINT N3: Generate and track design ID on first save
        const storageKey = window.currentLocalStorageKey || ('email-project-' + Date.now());
        currentDesignId = storageKey;
        window.currentDesignId = storageKey;
        console.log('🆔 SPRINT N3: Set currentDesignId =', storageKey, '(first save to computer)');

        // Store the file handle for future saves
        window.currentFileHandle = fileHandle;
        window.currentProjectName = projectName;
        // Clear localStorage key since we're now saving to computer
        window.currentLocalStorageKey = null;

        // FIXED: Use currentTemplateKey directly instead of broken Object.keys().find()
        const templateKey = currentTemplateKey || Object.keys(templates).find(key => templates[key] === currentTemplate);
        const creativeDirectionValue = document.getElementById("creative-direction-top").value;

        const saveData = {
            projectName: projectName,
            template: templateKey,
            templateId: templateKey,
            formData: formData,
            uploadedImages: uploadedImages,
            creativeDirection: creativeDirectionValue,
            savedDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(saveData, null, 2);

        // Write to the file
        const writable = await fileHandle.createWritable();
        await writable.write(dataStr);
        await writable.close();

        closeSaveModal();
        alert("Project saved!");

        // Mark form as clean and start auto-save
        if (typeof markFormAsClean === 'function') markFormAsClean();
        if (typeof startAutoSave === 'function') startAutoSave();
    } catch (err) {
        if (err.name !== 'AbortError') {
            alert("Error saving project: " + err.message);
        }
    }
}

// ============================================
// LOAD FROM COMPUTER - LOAD PIPELINE V2
// ============================================

async function loadProjectFromComputer() {
    try {
        // Use File System Access API to open file
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'Email Briefing Projects',
                accept: { 'application/json': ['.json'] }
            }],
            multiple: false
        });

        // Store the file handle for future saves
        window.currentFileHandle = fileHandle;
        
        const file = await fileHandle.getFile();
        const contents = await file.text();
        const saveData = JSON.parse(contents);

        // SPRINT N3: Generate design ID for this loaded design
        const storageKey = 'email-project-' + Date.now();
        currentDesignId = storageKey;
        window.currentDesignId = storageKey;
        window.currentLocalStorageKey = storageKey;
        console.log('🆔 SPRINT N3: Set currentDesignId =', storageKey, '(load from computer)');

        // PHASE 2 TASK 0: Restore template ID safely
        const templateKey = saveData.template || saveData.templateId;
        if (!templateKey || !templates[templateKey]) {
            console.warn("No valid template found in loaded design.");
            alert(`Template "${templateKey}" not found. This project may be corrupted.`);
            return;
        }

        // TASK H: Null-safe template selector update
        const templateSelector = document.getElementById("template-selector");
        if (templateSelector) {
            templateSelector.value = templateKey;
        }
        
        document.getElementById("action-buttons").classList.add("active");
        document.getElementById("creative-direction-section").classList.add("active");

        // Restore creative direction dropdown if saved
        if (saveData.creativeDirection) {
            document.getElementById("creative-direction-top").value = saveData.creativeDirection;
        }

        // LOAD PIPELINE V2: Use centralized applyLoadedProject
        await applyLoadedProject({
            source: "load-from-computer",
            templateKey,
            templateDefinition: templates[templateKey],
            formData: saveData.formData || {},
            uploadedImages: saveData.uploadedImages || {},
            projectName: saveData.projectName || "Untitled Project"
        });

        // TASK I: Update builder header to Design Mode
        setTimeout(() => {
            window.builderMode = 'design';
            const templateName = templates[templateKey]?.name || 'Unknown Template';
            if (typeof window.updateBuilderHeader === 'function') {
                window.updateBuilderHeader({
                    mode: 'design',
                    designName: saveData.projectName,
                    templateName: templateName
                });
            }
        }, 50);

        updatePreview();

        alert("Project loaded: " + saveData.projectName);

        // Mark as clean and start auto-save
        if (typeof markFormAsClean === 'function') markFormAsClean();
        if (typeof startAutoSave === 'function') startAutoSave();
    } catch (err) {
        if (err.name !== 'AbortError') {
            alert("Error loading project file: " + err.message);
        }
    }
}

// ============================================
// LEGACY LOAD FUNCTION - LOAD PIPELINE V2
// ============================================

// Legacy function for fallback - kept for compatibility
function loadProject(e) {
    const file = e.target.files[0];
    if (!file) return;

    // SPRINT N3: Generate design ID for legacy load path
    const storageKey = 'email-project-' + Date.now();
    currentDesignId = storageKey;
    window.currentDesignId = storageKey;
    window.currentFileHandle = null;
    window.currentLocalStorageKey = storageKey;
    console.log('🆔 SPRINT N3: Set currentDesignId =', storageKey, '(legacy load)');

    const reader = new FileReader();
    reader.onload = function (evt) {
        try {
            const saveData = JSON.parse(evt.target.result);

            // PHASE 2 TASK 0: Restore template ID safely
            const templateKey = saveData.template || saveData.templateId;
            if (!templateKey || !templates[templateKey]) {
                console.warn("No valid template found in loaded design.");
                alert(`Template "${templateKey}" not found. This project may be corrupted.`);
                return;
            }

            // TASK H: Null-safe template selector update
            const templateSelector = document.getElementById("template-selector");
            if (templateSelector) {
                templateSelector.value = templateKey;
            }
            
            document.getElementById("action-buttons").classList.add("active");
            document.getElementById("creative-direction-section").classList.add("active");

            // Restore creative direction dropdown if saved
            if (saveData.creativeDirection) {
                document.getElementById("creative-direction-top").value = saveData.creativeDirection;
            }

            // LOAD PIPELINE V2: Use centralized applyLoadedProject
            applyLoadedProject({
                source: "load-from-file",
                templateKey,
                templateDefinition: templates[templateKey],
                formData: saveData.formData || {},
                uploadedImages: saveData.uploadedImages || {},
                projectName: saveData.projectName || "Loaded Project"
            });

            // TASK I: Update builder header to Design Mode
            setTimeout(() => {
                window.builderMode = 'design';
                const templateName = templates[templateKey]?.name || 'Unknown Template';
                if (typeof window.updateBuilderHeader === 'function') {
                    window.updateBuilderHeader({
                        mode: 'design',
                        designName: saveData.projectName,
                        templateName: templateName
                    });
                }
            }, 50);

            updatePreview();

            alert("Project loaded: " + saveData.projectName);
        } catch (err) {
            alert("Error loading project file: " + err.message);
        }
    };
    reader.readAsText(file);

    e.target.value = "";
}

// ============================================
// MAIN SAVE FUNCTION - DISPATCHES TO CORRECT HANDLER
// ============================================

async function handleSave() {
    console.log("handleSave called, fileHandle:", window.currentFileHandle, "localStorageKey:", window.currentLocalStorageKey);

    // Priority: Check if we have a file handle (computer file)
    if (window.currentFileHandle) {
        await saveToExistingFileAndClose();
    }
    // Check if we have a DB key (My Designs)
    else if (window.currentLocalStorageKey) {
        await saveToExistingMyDesignAndClose();
    }
    // No existing save location, show modal
    else {
        openSaveModal();
    }
}

// ============================================
// SAVE & CLOSE FUNCTIONS
// ============================================

async function saveToExistingFileAndClose() {
    try {
        // FIXED: Use currentTemplateKey directly instead of broken Object.keys().find()
        const templateKey = currentTemplateKey || Object.keys(templates).find(key => templates[key] === currentTemplate);
        const creativeDirectionValue = document.getElementById("creative-direction-top").value;

        const saveData = {
            projectName: window.currentProjectName,
            template: templateKey,
            templateId: templateKey,
            formData: formData,
            uploadedImages: uploadedImages,
            creativeDirection: creativeDirectionValue,
            savedDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(saveData, null, 2);

        // Write to the existing file
        const writable = await window.currentFileHandle.createWritable();
        await writable.write(dataStr);
        await writable.close();

        alert("Project saved!");

        // Mark form as clean after save
        if (typeof markFormAsClean === 'function') markFormAsClean();

        // Close and return to originating folder
        goBackFromBuilder();
    } catch (err) {
        alert("Error saving project: " + err.message);
    }
}

async function saveToExistingMyDesignAndClose() {
    console.log("=== saveToExistingMyDesignAndClose called ===");
    
    // DEBUG: Check formData state before saving
    console.log("🔴 CRITICAL CHECK - formData before save:");
    console.log("  formData object:", formData);
    console.log("  formData keys:", Object.keys(formData));
    console.log("  formData is empty?:", Object.keys(formData).length === 0);
    
    // FIXED: Use currentTemplateKey directly instead of broken Object.keys().find()
    const templateKey = currentTemplateKey || Object.keys(templates).find(key => templates[key] === currentTemplate);
    const creativeDirectionValue = document.getElementById("creative-direction-top").value;

    // Save complete project data to IndexedDB
    const saveData = {
        projectName: window.currentProjectName,
        template: templateKey,
        templateId: templateKey,
        formData: formData,
        uploadedImages: uploadedImages,
        creativeDirection: creativeDirectionValue,
        savedDate: new Date().toISOString()
    };
    
    console.log("🔴 Saving this data to IndexedDB:", saveData);

    await dbSave(window.currentLocalStorageKey, JSON.stringify(saveData));

    alert('Project saved!');

    // Mark form as clean after save
    if (typeof markFormAsClean === 'function') markFormAsClean();

    // Close and return to originating folder
    goBackFromBuilder();
}

// ============================================
// SAVE AS FUNCTION
// ============================================

function handleSaveAs() {
    const modal = document.getElementById('save-as-modal');
    const input = document.getElementById('save-as-project-name-input');

    if (modal && input) {
        // Pre-fill with current name or default
        const defaultName = window.currentProjectName ?
            `Copy of ${window.currentProjectName}` :
            'Copy of email-brief';
        input.value = defaultName;

        // Populate folder hierarchy for Save As modal
        populateFolderHierarchySaveAs();

        // Show modal with GSAP animation
        modal.classList.add('active');
        
        // Animate with GSAP
        if (typeof window.animateModalOpen === 'function') {
            window.animateModalOpen(modal);
        }
        
        input.focus();
        input.select();
    }
}

function closeSaveAsModal() {
    const modal = document.getElementById('save-as-modal');
    if (!modal) return;
    
    // Animate with GSAP
    if (typeof window.animateModalClose === 'function') {
        window.animateModalClose(modal, () => {
            modal.classList.remove('active');
        });
    } else {
        // Fallback without animation
        modal.classList.remove('active');
    }
}

async function confirmSaveAs() {
    const input = document.getElementById('save-as-project-name-input');
    const newProjectName = input?.value.trim();

    if (!newProjectName) {
        alert('Please enter a project name');
        return;
    }

    // FIXED: Use currentTemplateKey directly instead of broken Object.keys().find()
    const templateKey = currentTemplateKey || Object.keys(templates).find(key => templates[key] === currentTemplate);
    const creativeDirectionValue = document.getElementById("creative-direction-top").value;

    // Create new storage key
    const storageKey = 'email-project-' + Date.now();

    // SPRINT N3: Track the new design ID
    currentDesignId = storageKey;
    window.currentDesignId = storageKey;
    console.log('🆔 SPRINT N3: Set currentDesignId =', storageKey, '(Save As)');

    try {
        // Save complete project data to IndexedDB
        const saveData = {
            projectName: newProjectName,
            template: templateKey,
            templateId: templateKey,
            formData: formData,
            uploadedImages: uploadedImages,
            creativeDirection: creativeDirectionValue,
            savedDate: new Date().toISOString()
        };

        await dbSave(storageKey, JSON.stringify(saveData));

        // Add to selected folder from Save As modal
        if (selectedSaveAsFolder && typeof addItemToFolder === 'function') {
            addItemToFolder(selectedSaveAsFolder, storageKey);
        }

        // Update tracking variables to point to new design
        window.currentProjectName = newProjectName;
        window.currentLocalStorageKey = storageKey;
        window.currentFileHandle = null;

        closeSaveAsModal();
        alert("Project saved as: " + newProjectName);

        // Mark form as clean
        if (typeof markFormAsClean === 'function') markFormAsClean();

        // Close and return to originating folder
        goBackFromBuilder();
    } catch (err) {
        alert("Error saving project: " + err.message);
    }
}

// ============================================
// SAVE TO MY DESIGNS (WITH INDEXEDDB)
// ============================================

async function saveToMyDesignsWithFolder() {
    console.log("=== saveToMyDesigns called ===");

    const projectName = document.getElementById('project-name-input').value.trim();
    console.log("Project name:", projectName);
    console.log("Selected folder:", selectedSaveFolder);

    if (!projectName) {
        alert('Please enter a project name');
        return;
    }

    console.log("currentTemplate:", currentTemplate);
    console.log("currentTemplateKey:", currentTemplateKey);
    console.log("templates object:", templates);

    // FIXED: Use currentTemplateKey directly instead of broken Object.keys().find()
    const templateKey = currentTemplateKey || Object.keys(templates).find(key => templates[key] === currentTemplate);
    console.log("templateKey:", templateKey);
    
    // DEBUG: Log the current state of formData before saving
    console.log("Current formData before saving:", formData);
    console.log("FormData keys:", Object.keys(formData));
    console.log("FormData values:", Object.entries(formData));

    // Capture creative direction dropdown value
    const creativeDirectionValue = document.getElementById("creative-direction-top").value;
    console.log("creativeDirectionValue:", creativeDirectionValue);

    // Create new storage key or use existing one
    const storageKey = window.currentLocalStorageKey || ('email-project-' + Date.now());
    console.log("storageKey:", storageKey);

    // SPRINT N3: Track design ID on first save to My Designs
    if (!window.currentLocalStorageKey) {
        currentDesignId = storageKey;
        window.currentDesignId = storageKey;
        console.log('🆔 SPRINT N3: Set currentDesignId =', storageKey, '(first save to My Designs)');
    }

    try {
        // Save complete project data to IndexedDB
        const saveData = {
            projectName: projectName,
            template: templateKey,
            templateId: templateKey,
            formData: formData,
            uploadedImages: uploadedImages,
            creativeDirection: creativeDirectionValue,
            savedDate: new Date().toISOString()
        };
        
        console.log("Complete saveData object:", saveData);

        await dbSave(storageKey, JSON.stringify(saveData));
        console.log("Saved to IndexedDB successfully");

        // Add to selected folder if specified
        if (selectedSaveFolder && typeof addItemToFolder === 'function') {
            addItemToFolder(selectedSaveFolder, storageKey);
            console.log("Added design to selected folder:", selectedSaveFolder);
        }

        // Update tracking variables
        window.currentProjectName = projectName;
        window.currentLocalStorageKey = storageKey;
        window.currentFileHandle = null; // Clear file handle

        // TASK I: Update builder header to Design Mode
        window.builderMode = 'design';
        const templateName = templates[templateKey]?.name || 'Unknown Template';
        if (typeof window.updateBuilderHeader === 'function') {
            window.updateBuilderHeader({
                mode: 'design',
                designName: projectName,
                templateName: templateName
            });
        }

        closeSaveModal();

        const imageCount = Object.keys(uploadedImages).length;
        const message = imageCount > 0
            ? `Project saved with ${imageCount} image${imageCount > 1 ? 's' : ''}!`
            : 'Project saved!';
        alert(message);

        // Mark form as clean and start auto-save
        if (typeof markFormAsClean === 'function') markFormAsClean();
        if (typeof startAutoSave === 'function') startAutoSave();

        // Close and return to originating folder
        goBackFromBuilder();

        console.log("=== saveToMyDesigns completed successfully ===");
    } catch (err) {
        console.error("Error in saveToMyDesigns:", err);
        alert("Error saving project: " + err.message);
    }
}

// ============================================
// LOAD FROM MY DESIGNS - SPRINT F: NOW USES loadDesignById
// ============================================

async function loadDesignFromCard(storageKey) {
    // SPRINT F: Refactored to use loadDesignById for atomic loading
    console.log("=== loadDesignFromCard calling loadDesignById ===");
    await loadDesignById(storageKey, {
        source: 'load-from-card',
        skipNavigation: false
    });
}

// ============================================
// SAVE MODAL FUNCTIONS
// ============================================

function openSaveModal() {
    const modal = document.getElementById('save-modal');
    if (modal) {
        // Populate folder hierarchy
        populateFolderHierarchy();
        modal.classList.add('active');
        const projectNameInput = document.getElementById('project-name-input');
        if (projectNameInput) {
            projectNameInput.value = window.currentProjectName || '';
            projectNameInput.focus();
        }
    }
}

function closeSaveModal() {
    const modal = document.getElementById('save-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// SPRINT 3: DUPLICATE DESIGN FUNCTIONALITY
// ============================================

/**
 * Compute a unique duplicate name to avoid collisions.
 * Given a base name like "My Design", returns "My Design_1", "My Design_2", etc.
 * depending on which names already exist in the database.
 * 
 * @param {string} baseName - The original project name to duplicate
 * @returns {Promise<string>} - A unique name with _1, _2, etc. suffix
 */
async function computeDuplicateName(baseName) {
    console.log('=== computeDuplicateName called ===');
    console.log('baseName:', baseName);
    
    // Get all existing designs to check for name collisions
    const allDesigns = await EmailBriefingDB.getAllDesigns();
    const safeDesigns = Array.isArray(allDesigns) ? allDesigns : [];
    
    // Build a set of existing project names
    const existingNames = new Set();
    safeDesigns.forEach(design => {
        // Handle both nested (Firestore) and flat data structures
        const data = design.data || design;
        const projectName = design.projectName || data.projectName || '';
        if (projectName) {
            existingNames.add(projectName.trim());
        }
    });
    
    console.log('Existing names count:', existingNames.size);
    
    // Find an available name with _1, _2, _3, etc. suffix
    let counter = 1;
    let candidate;
    do {
        candidate = `${baseName}_${counter}`;
        counter++;
        // Safety limit to prevent infinite loop
        if (counter > 1000) {
            console.warn('Hit counter limit in computeDuplicateName');
            break;
        }
    } while (existingNames.has(candidate));
    
    console.log('Computed duplicate name:', candidate);
    console.log('=== computeDuplicateName completed ===');
    
    return candidate;
}

/**
 * Duplicate a design from a card in My Designs.
 * Creates a new design with:
 * - A new unique ID (email-project-<timestamp>)
 * - A unique name (OriginalName_1, _2, etc.)
 * - All content copied from the original (formData + images)
 * - Placed in the same folder as the original
 * 
 * @param {string} storageKey - The ID of the design to duplicate
 * @param {string} folderId - The folder ID where the duplicate should be placed (empty string for root)
 */
async function duplicateDesignFromCard(storageKey, folderId) {
    console.log('=== duplicateDesignFromCard called ===');
    console.log('storageKey:', storageKey);
    console.log('folderId:', folderId);
    
    try {
        // Step 1: Load existing design
        const dataStr = await dbGet(storageKey);
        if (!dataStr) {
            console.error('Source project not found:', storageKey);
            alert('Source project not found');
            return;
        }
        
        // Step 2: Parse and extract the actual design data
        const rawData = JSON.parse(dataStr);
        // Handle nested structure from Firestore: { id, data: {...}, timestamp, ... }
        const sourceData = rawData.data || rawData;
        
        console.log('Source data loaded:');
        console.log('  projectName:', sourceData.projectName);
        console.log('  template:', sourceData.template || sourceData.templateId);
        console.log('  formData keys:', Object.keys(sourceData.formData || {}));
        console.log('  uploadedImages keys:', Object.keys(sourceData.uploadedImages || {}));
        
        // Step 3: Deep-copy the design data to avoid reference issues
        const newData = JSON.parse(JSON.stringify(sourceData));
        
        // Step 4: Compute new project name to avoid collisions
        const originalName = sourceData.projectName || 'Untitled';
        const newProjectName = await computeDuplicateName(originalName);
        
        // Step 5: Generate a new unique design ID
        const newId = 'email-project-' + Date.now();
        
        // Step 6: Update fields on the new data
        newData.projectName = newProjectName;
        newData.savedDate = new Date().toISOString();
        
        console.log('New design data:');
        console.log('  newId:', newId);
        console.log('  newProjectName:', newProjectName);
        console.log('  formData keys:', Object.keys(newData.formData || {}));
        console.log('  uploadedImages keys:', Object.keys(newData.uploadedImages || {}));
        
        // Step 7: Save the new design via dbSave
        await dbSave(newId, JSON.stringify(newData));
        console.log('✅ New design saved to database');
        
        // Step 8: Add to folder (if folderId provided and not empty string)
        if (folderId && folderId !== '' && folderId !== 'null' && typeof addItemToFolder === 'function') {
            await addItemToFolder(folderId, newId);
            console.log('✅ Added to folder:', folderId);
        }
        
        // Step 9: Refresh the current folder view
        if (typeof loadSavedDesigns === 'function') {
            await loadSavedDesigns();
            console.log('✅ Refreshed My Designs view');
        }
        
        console.log('=== duplicateDesignFromCard completed successfully ===');
        
    } catch (err) {
        console.error('❌ Error duplicating design:', err);
        console.error('Error stack:', err.stack);
        alert('Error duplicating design: ' + err.message);
    }
}

// ============================================
// FUNCTION ASSIGNMENTS
// ============================================

// Replace the original saveToMyDesigns function call with the new one
window.saveToMyDesigns = saveToMyDesignsWithFolder;

// Expose critical functions globally for button event handlers
window.handleSave = handleSave;
window.handleSaveAs = handleSaveAs;
window.closeSaveModal = closeSaveModal;
window.closeSaveAsModal = closeSaveAsModal;
window.confirmSaveAs = confirmSaveAs;
window.openSaveModal = openSaveModal;
window.loadDesignFromCard = loadDesignFromCard;
window.loadProjectFromComputer = loadProjectFromComputer;

// SPRINT 3: Expose duplicate functions globally for context menu
window.duplicateDesignFromCard = duplicateDesignFromCard;
window.computeDuplicateName = computeDuplicateName;
