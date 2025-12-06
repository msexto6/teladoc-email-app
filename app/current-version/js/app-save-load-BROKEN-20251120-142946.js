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
    console.log("currentTemplateKey:", currentTemplateKey); // ADDED: Log the key directly

    // FIXED: Use currentTemplateKey directly instead of broken Object.keys().find()
    const templateKey = currentTemplateKey;
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
            template: templateKey, templateId: templateKey,
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
