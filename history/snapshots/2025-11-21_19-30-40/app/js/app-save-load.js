// Global variables to track current file handle (on window object for cross-file access)
window.currentFileHandle = null;
window.currentProjectName = null;
window.currentLocalStorageKey = null; // Track which My Designs entry is open
window.isLoadingProject = false; // Flag to prevent formData overwrite during load

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
// LOAD FROM COMPUTER
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
        // Clear localStorage key since we're loading from computer
        window.currentLocalStorageKey = null;

        const file = await fileHandle.getFile();
        const contents = await file.text();
        const saveData = JSON.parse(contents);

        // Store project name
        window.currentProjectName = saveData.projectName;

        // Load the template first - validate it exists
        const templateKey = saveData.template || saveData.templateId;
        if (!templates[templateKey]) {
            alert(`Template "${templateKey}" not found. This project may be corrupted.`);
            return;
        }

        // Set flag to prevent formData overwrite
        window.isLoadingProject = true;

        document.getElementById("template-selector").value = templateKey;
        currentTemplate = templates[templateKey];
        currentTemplateKey = templateKey; // Set currentTemplateKey
        formData = saveData.formData || {};
        uploadedImages = saveData.uploadedImages || {};

        document.getElementById("action-buttons").classList.add("active");
        document.getElementById("creative-direction-section").classList.add("active");

        // Restore creative direction dropdown if saved
        if (saveData.creativeDirection) {
            document.getElementById("creative-direction-top").value = saveData.creativeDirection;
        }

        generateForm();
        populateFormFields();

        // Clear the loading flag
        window.isLoadingProject = false;

        // After form is generated, update the title display
        setTimeout(() => {
            const builderTitle = document.getElementById('builder-template-title');
            const projectInfoDisplay = document.getElementById('project-info-display');
            const projectNameDisplay = document.getElementById('project-name-display');

            if (builderTitle && projectInfoDisplay && projectNameDisplay) {
                // Set main title to project name
                builderTitle.textContent = saveData.projectName;

                // Show template name below
                const templateName = templates[templateKey]?.name || 'Unknown Template';
                projectNameDisplay.textContent = templateName;
                projectInfoDisplay.style.display = 'flex';
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
// LEGACY LOAD FUNCTION
// ============================================

// Legacy function for fallback - kept for compatibility
function loadProject(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Clear file handle since this is old-style load
    window.currentFileHandle = null;
    window.currentLocalStorageKey = null;

    const reader = new FileReader();
    reader.onload = function (evt) {
        try {
            const saveData = JSON.parse(evt.target.result);

            window.currentProjectName = saveData.projectName;

            // Load the template first - validate it exists
            const templateKey = saveData.template || saveData.templateId;
            if (!templates[templateKey]) {
                alert(`Template "${templateKey}" not found. This project may be corrupted.`);
                return;
            }

            // Set flag to prevent formData overwrite
            window.isLoadingProject = true;

            document.getElementById("template-selector").value = templateKey;
            currentTemplate = templates[templateKey];
            currentTemplateKey = templateKey; // Set currentTemplateKey
            formData = saveData.formData || {};
            uploadedImages = saveData.uploadedImages || {};

            document.getElementById("action-buttons").classList.add("active");
            document.getElementById("creative-direction-section").classList.add("active");

            // Restore creative direction dropdown if saved
            if (saveData.creativeDirection) {
                document.getElementById("creative-direction-top").value = saveData.creativeDirection;
            }

            generateForm();
            populateFormFields();

            // Clear the loading flag
            window.isLoadingProject = false;

            // After form is generated, update the title display
            setTimeout(() => {
                const builderTitle = document.getElementById('builder-template-title');
                const projectInfoDisplay = document.getElementById('project-info-display');
                const projectNameDisplay = document.getElementById('project-name-display');

                if (builderTitle && projectInfoDisplay && projectNameDisplay) {
                    // Set main title to project name
                    builderTitle.textContent = saveData.projectName;

                    // Show template name below
                    const templateName = templates[templateKey]?.name || 'Unknown Template';
                    projectNameDisplay.textContent = templateName;
                    projectInfoDisplay.style.display = 'flex';
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

        // Show modal
        modal.classList.add('active');
        input.focus();
        input.select();
    }
}

function closeSaveAsModal() {
    const modal = document.getElementById('save-as-modal');
    if (modal) {
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

        // Update the displayed project name and template name
        const builderTitle = document.getElementById('builder-template-title');
        const projectInfoDisplay = document.getElementById('project-info-display');
        const projectNameDisplay = document.getElementById('project-name-display');

        if (builderTitle && projectInfoDisplay && projectNameDisplay) {
            // Set main title to project name
            builderTitle.textContent = projectName;

            // Show template name below
            const templateName = templates[templateKey]?.name || 'Unknown Template';
            projectNameDisplay.textContent = templateName;
            projectInfoDisplay.style.display = 'flex';
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
// LOAD FROM MY DESIGNS (WITH INDEXEDDB)
// ============================================

async function loadDesignFromCard(storageKey) {
    try {
        console.log("=== loadDesignFromCard started ===");
        console.log("storageKey:", storageKey);

        // Load data from IndexedDB
        const dataStr = await dbGet(storageKey);
        if (!dataStr) {
            console.error("❌ ERROR: Project not found in IndexedDB");
            alert("Project not found");
            return;
        }

        const saveData = JSON.parse(dataStr);
        
        // Check if this is an export file
        if (saveData && saveData.isExport) {
            // This is an export file - download it instead of opening
            downloadExportFile(storageKey);
            return;
        }

        console.log("✅ Loaded saveData from IndexedDB:", saveData);
        console.log("📊 saveData.formData exists?:", !!saveData.formData);
        console.log("📊 saveData.formData keys:", saveData.formData ? Object.keys(saveData.formData) : 'NO FORMDATA');
        console.log("📊 saveData.formData content:", saveData.formData);

        // Validate templateId exists
        const templateKey = saveData.templateId || saveData.template;
        console.log("templateKey from saveData:", templateKey);
        
        if (!templateKey) {
            console.error("❌ ERROR: Missing template information");
            alert("This project is missing template information and cannot be loaded.");
            return;
        }
        
        if (!templates[templateKey]) {
            console.error("❌ ERROR: Template not found:", templateKey);
            alert(`Template "${templateKey}" not found. This project may be from an older version or may be corrupted.`);
            return;
        }

        // CRITICAL: Save navigation state BEFORE loading
        if (typeof navigationHistory !== 'undefined' && typeof currentFolderPath !== 'undefined') {
            const myDesignsScreen = document.getElementById('my-designs-screen');
            if (myDesignsScreen && myDesignsScreen.classList.contains('active')) {
                navigationHistory = {
                    page: 'my-designs',
                    folderPath: [...currentFolderPath]
                };
                console.log("Saved navigation history:", navigationHistory);
            }
        }

        // Store tracking variables
        window.currentLocalStorageKey = storageKey;
        window.currentProjectName = saveData.projectName;
        window.currentFileHandle = null; // Clear file handle

        // Set flag to prevent formData overwrite
        window.isLoadingProject = true;
        
        // Store the loaded data BEFORE setting template
        const loadedFormData = saveData.formData || {};
        const loadedUploadedImages = saveData.uploadedImages || {};
        
        console.log("🔵 BEFORE template change:");
        console.log("  loadedFormData:", loadedFormData);
        console.log("  loadedFormData keys:", Object.keys(loadedFormData));
        console.log("  loadedFormData is empty?:", Object.keys(loadedFormData).length === 0);
        
        // CRITICAL FIX: Set the template selector dropdown value
        document.getElementById("template-selector").value = templateKey;
        
        // Load template - now we know it exists
        currentTemplate = templates[templateKey];
        currentTemplateKey = templateKey;
        
        // Restore our loaded data (in case anything overwrote it)
        formData = loadedFormData;
        uploadedImages = loadedUploadedImages;
        
        console.log("🟢 AFTER template set:");
        console.log("  formData:", formData);
        console.log("  formData keys:", Object.keys(formData));
        console.log("  formData is empty?:", Object.keys(formData).length === 0);
        console.log("  uploadedImages:", uploadedImages);

        document.getElementById("action-buttons").classList.add("active");
        document.getElementById("creative-direction-section").classList.add("active");

        // Restore creative direction dropdown if saved
        if (saveData.creativeDirection) {
            document.getElementById("creative-direction-top").value = saveData.creativeDirection;
        }

        console.log("About to generate form...");
        generateForm();

        // Wait for form to be fully generated before populating
        console.log("Waiting for form generation to complete...");
        await new Promise(resolve => setTimeout(resolve, 200));

        console.log("🟡 BEFORE populateFormFields:");
        console.log("  formData still has content?:", Object.keys(formData).length > 0);
        console.log("  formData:", formData);
        
        populateFormFields();
        
        console.log("🟣 AFTER populateFormFields:");
        console.log("  Form fields should now be populated");
        
        // Verify fields were actually populated
        if (currentTemplate && currentTemplate.fields) {
            console.log("🔍 VERIFICATION - Checking DOM values:");
            currentTemplate.fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element) {
                    const value = element.contentEditable === "true" ? 
                        element.innerHTML : 
                        element.value;
                    console.log(`  Field "${field.id}": "${value?.substring(0, 50)}..."`);
                } else {
                    console.log(`  Field "${field.id}": ELEMENT NOT FOUND`);
                }
            });
        }
        
        // Clear the loading flag
        window.isLoadingProject = false;

        // Update title display
        setTimeout(() => {
            const builderTitle = document.getElementById('builder-template-title');
            const projectInfoDisplay = document.getElementById('project-info-display');
            const projectNameDisplay = document.getElementById('project-name-display');

            if (builderTitle && projectInfoDisplay && projectNameDisplay) {
                builderTitle.textContent = saveData.projectName;
                const templateName = templates[templateKey]?.name || 'Unknown Template';
                projectNameDisplay.textContent = templateName;
                projectInfoDisplay.style.display = 'flex';
            }
        }, 50);

        console.log("About to update preview...");
        updatePreview();

        // Navigate to builder
        console.log("Navigating to builder screen...");
        showScreen('builder');

        // Mark as clean and start auto-save
        if (typeof markFormAsClean === 'function') markFormAsClean();
        if (typeof startAutoSave === 'function') startAutoSave();

        console.log("=== loadDesignFromCard completed successfully ===");
    } catch (err) {
        console.error("❌ ERROR in loadDesignFromCard:", err);
        console.error("Error stack:", err.stack);
        alert("Error loading project: " + err.message);
    }
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
