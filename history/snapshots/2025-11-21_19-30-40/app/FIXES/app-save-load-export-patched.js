// Global variables to track current file handle (on window object for cross-file access)
window.currentFileHandle = null;
window.currentProjectName = null;
window.currentLocalStorageKey = null; // Track which My Designs entry is open

let selectedExportFolder = null;

function openExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) {
        populateFolderHierarchyExport();
        modal.classList.add('active');
    }
}

function closeExportModal() {
    const modal = document.getElementById('export-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function populateFolderHierarchyExport() {
    const hierarchyDiv = document.getElementById('folder-hierarchy-export');
    if (!hierarchyDiv) return;
    
    hierarchyDiv.innerHTML = '';
    selectedExportFolder = null;
    
    const rootItem = document.createElement('div');
    rootItem.className = 'folder-hierarchy-item selected';
    rootItem.innerHTML = '<span>📁 My Designs (Root)</span>';
    rootItem.onclick = () => selectExportFolder(null, rootItem);
    hierarchyDiv.appendChild(rootItem);
    
    const folders = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('email-folder-') && !key.includes('trashed')) {
            try {
                const folder = JSON.parse(localStorage.getItem(key));
                if (folder.pageType !== 'templates') {
                    folders.push({ key, folder });
                }
            } catch (e) {
                console.error('Error loading folder:', e);
            }
        }
    }
    
    folders.sort((a, b) => a.folder.name.localeCompare(b.folder.name));
    
    const rootFolders = folders.filter(f => 
        !f.folder.parentPath || f.folder.parentPath.length === 0
    );
    
    rootFolders.forEach(({ key, folder }) => {
        const folderItem = createFolderHierarchyItemExport(key, folder, 0, folders);
        hierarchyDiv.appendChild(folderItem);
    });
}

function createFolderHierarchyItemExport(folderId, folder, level, allFolders) {
    const item = document.createElement('div');
    item.className = 'folder-hierarchy-item';
    item.dataset.folderId = folderId;
    item.dataset.level = level;
    
    if (level === 1) item.className += ' nested';
    if (level === 2) item.className += ' double-nested';
    
    const folderColor = folder.color || 'purple';
    
    const hasSubfolders = checkForSubfolders(folderId, allFolders);
    
    const carat = hasSubfolders ? 
        '<span class="folder-carat" onclick="event.stopPropagation(); toggleFolderExpansionExport(event, \'' + folderId + '\');">▶</span>' : 
        '<span class="folder-carat-placeholder"></span>';
    
    item.innerHTML = `
        ${carat}
        <img src="assets/images/folder-${folderColor}.png" class="folder-hierarchy-icon" alt="Folder">
        <span>${folder.name}</span>
    `;
    
    item.onclick = (e) => {
        if (!e.target.classList.contains('folder-carat')) {
            selectExportFolder(folderId, item);
        }
    };
    
    return item;
}

function selectExportFolder(folderId, element) {
    document.querySelectorAll('#folder-hierarchy-export .folder-hierarchy-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    element.classList.add('selected');
    selectedExportFolder = folderId;
}

function toggleFolderExpansionExport(event, folderId) {
    event.stopPropagation();
    const carat = event.target;
    const parentItem = carat.closest('.folder-hierarchy-item');
    
    const isExpanded = carat.classList.contains('expanded');
    
    if (isExpanded) {
        carat.classList.remove('expanded');
        carat.textContent = '▶';
        removeSubfolders(folderId, 'folder-hierarchy-export');
    } else {
        carat.classList.add('expanded');
        carat.textContent = '▼';
        addSubfolders(folderId, parentItem, 'folder-hierarchy-export');
    }
}


async function saveToComputer() {
    const projectName = document.getElementById("project-name-input").value.trim();
    if(!projectName) {
        alert("Please enter a project name");
        return;
    }
    
    try {
        // Use File System Access API to save file
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: projectName + '.json',
            types: [{
                description: 'Email Briefing Projects',
                accept: {'application/json': ['.json']}
            }]
        });
        
        // Store the file handle for future saves
        window.currentFileHandle = fileHandle;
        window.currentProjectName = projectName;
        // Clear localStorage key since we're now saving to computer
        window.currentLocalStorageKey = null;
        
        const templateKey = Object.keys(templates).find(key => templates[key] === currentTemplate);
        const creativeDirectionValue = document.getElementById("creative-direction-top").value;
        
        const saveData = {
            projectName: projectName,
            template: templateKey,
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
    } catch(err) {
        if (err.name !== 'AbortError') {
            alert("Error saving project: " + err.message);
        }
    }
}


async function loadProjectFromComputer() {
    try {
        // Use File System Access API to open file
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'Email Briefing Projects',
                accept: {'application/json': ['.json']}
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
        
        // Load the template first
        document.getElementById("template-selector").value = saveData.template;
        currentTemplate = templates[saveData.template];
        formData = saveData.formData;
        uploadedImages = saveData.uploadedImages;
        
        document.getElementById("action-buttons").classList.add("active");
        document.getElementById("creative-direction-section").classList.add("active");
        
        // Restore creative direction dropdown if saved
        if(saveData.creativeDirection) {
            document.getElementById("creative-direction-top").value = saveData.creativeDirection;
        }
        
        generateForm();
        populateFormFields();
        
        // After form is generated, update the title display
        setTimeout(() => {
            const builderTitle = document.getElementById('builder-template-title');
            const projectInfoDisplay = document.getElementById('project-info-display');
            const projectNameDisplay = document.getElementById('project-name-display');
            
            if (builderTitle && projectInfoDisplay && projectNameDisplay) {
                // Set main title to project name
                builderTitle.textContent = saveData.projectName;
                
                // Show template name below
                const templateName = templates[saveData.template]?.name || 'Unknown Template';
                projectNameDisplay.textContent = templateName;
                projectInfoDisplay.style.display = 'flex';
            }
        }, 50);
        
        updatePreview();
        
        alert("Project loaded: " + saveData.projectName);
        
        // Mark as clean and start auto-save
        if (typeof markFormAsClean === 'function') markFormAsClean();
        if (typeof startAutoSave === 'function') startAutoSave();
    } catch(err) {
        if (err.name !== 'AbortError') {
            alert("Error loading project file: " + err.message);
        }
    }
}


// Legacy function for fallback - kept for compatibility
function loadProject(e) {
    const file = e.target.files[0];
    if(!file) return;
    
    // Clear file handle since this is old-style load
    window.currentFileHandle = null;
    window.currentLocalStorageKey = null;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const saveData = JSON.parse(evt.target.result);
            
            window.currentProjectName = saveData.projectName;
            
            // Load the template first
            document.getElementById("template-selector").value = saveData.template;
            currentTemplate = templates[saveData.template];
            formData = saveData.formData;
            uploadedImages = saveData.uploadedImages;
            
            document.getElementById("action-buttons").classList.add("active");
            document.getElementById("creative-direction-section").classList.add("active");
            
            // Restore creative direction dropdown if saved
            if(saveData.creativeDirection) {
                document.getElementById("creative-direction-top").value = saveData.creativeDirection;
            }
            
            generateForm();
            populateFormFields();
            
            // After form is generated, update the title display
            setTimeout(() => {
                const builderTitle = document.getElementById('builder-template-title');
                const projectInfoDisplay = document.getElementById('project-info-display');
                const projectNameDisplay = document.getElementById('project-name-display');
                
                if (builderTitle && projectInfoDisplay && projectNameDisplay) {
                    // Set main title to project name
                    builderTitle.textContent = saveData.projectName;
                    
                    // Show template name below
                    const templateName = templates[saveData.template]?.name || 'Unknown Template';
                    projectNameDisplay.textContent = templateName;
                    projectInfoDisplay.style.display = 'flex';
                }
            }, 50);
            
            updatePreview();
            
            alert("Project loaded: " + saveData.projectName);
        } catch(err) {
            alert("Error loading project file: " + err.message);
        }
    };
    reader.readAsText(file);
    
    e.target.value = "";
}


// Main save function - now with Save & Close
async function handleSave() {
    console.log("handleSave called, fileHandle:", window.currentFileHandle, "localStorageKey:", window.currentLocalStorageKey);
    
    // Priority: Check if we have a file handle (computer file)
    if (window.currentFileHandle) {
        await saveToExistingFileAndClose();
    }
    // Check if we have a localStorage key (My Designs)
    else if (window.currentLocalStorageKey) {
        await saveToExistingMyDesignAndClose();
    }
    // No existing save location, show modal
    else {
        openSaveModal();
    }
}


async function saveToExistingFileAndClose() {
    try {
        const templateKey = Object.keys(templates).find(key => templates[key] === currentTemplate);
        const creativeDirectionValue = document.getElementById("creative-direction-top").value;
        
        const saveData = {
            projectName: window.currentProjectName,
            template: templateKey,
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
    } catch(err) {
        alert("Error saving project: " + err.message);
    }
}


async function saveToExistingMyDesignAndClose() {
    const templateKey = Object.keys(templates).find(key => templates[key] === currentTemplate);
    const creativeDirectionValue = document.getElementById("creative-direction-top").value;
    
    // Save text data to localStorage (small)
    const saveData = {
        projectName: window.currentProjectName,
        templateId: templateKey,
        formData: formData,
        creativeDirection: creativeDirectionValue,
        savedDate: new Date().toISOString(),
        hasImages: Object.keys(uploadedImages).length > 0
    };
    
    localStorage.setItem(window.currentLocalStorageKey, JSON.stringify(saveData));
    
    // Save images to IndexedDB (large binary data)
    if (Object.keys(uploadedImages).length > 0) {
        await saveProjectImagesToIndexedDB(window.currentLocalStorageKey, uploadedImages);
    }
    
    alert('Project saved!');
    
    // Mark form as clean after save
    if (typeof markFormAsClean === 'function') markFormAsClean();
    
    // Close and return to originating folder
    goBackFromBuilder();
}


// Save As function - opens custom modal and populates folder hierarchy
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
    
    const templateKey = Object.keys(templates).find(key => templates[key] === currentTemplate);
    const creativeDirectionValue = document.getElementById("creative-direction-top").value;
    
    // Create new storage key
    const storageKey = 'email-project-' + Date.now();
    
    try {
        // Save text data to localStorage
        const saveData = {
            projectName: newProjectName,
            templateId: templateKey,
            formData: formData,
            creativeDirection: creativeDirectionValue,
            savedDate: new Date().toISOString(),
            hasImages: Object.keys(uploadedImages).length > 0
        };
        
        localStorage.setItem(storageKey, JSON.stringify(saveData));
        
        // Save images to IndexedDB
        if (Object.keys(uploadedImages).length > 0) {
            await saveProjectImagesToIndexedDB(storageKey, uploadedImages);
        }
        
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
    } catch(err) {
        alert("Error saving project: " + err.message);
    }
}

// ============================================
// EXPORT FUNCTIONS - SAVE TO MY DESIGNS
// ============================================


async function exportAsExcel() {
    if (!currentTemplate) {
        alert("Please select a template first");
        closeExportModal();
        return;
    }

    // Prompt for filename
    const defaultName = window.currentProjectName || "email-brief";
    const projectName = prompt("Enter export filename:", defaultName);
    
    // If user cancels or enters empty name, abort
    if (!projectName || projectName.trim() === "") {
        closeExportModal();
        return;
    }
    
    const finalProjectName = projectName.trim();
    
    // Close modal immediately
    closeExportModal();

    try {
        // Show alert with progress
        alert("Generating export package...\n\nThis may take a moment.");

        const zip = new JSZip();
        
        // 1. Generate Excel file (HTML table format)
        let htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: top; }
        th { background-color: #351F65; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Email Content Brief - ${finalProjectName}</h1>
    <table>
        <tr>
            <th>Field</th>
            <th>Content</th>
            <th>Character Count</th>
            <th>Max Characters</th>
        </tr>`;

        const imagesFolder = zip.folder("images");

        // Export creative direction
        const creativeDirectionValue = document.getElementById("creative-direction-top").value;
        if (creativeDirectionValue && creativeDirectionValue !== "[Choose one]") {
            htmlContent += `
        <tr>
            <td><strong>I need the creative team to...</strong></td>
            <td>${creativeDirectionValue}</td>
            <td>N/A</td>
            <td>N/A</td>
        </tr>`;
        }

        currentTemplate.fields.forEach(field => {
            const value = formData[field.id] || "";
            const elem = document.getElementById(field.id);
            const charCount = elem && elem.contentEditable === "true" ?
                elem.textContent.length :
                value.length;
            const maxChars = field.maxChars || "N/A";

            htmlContent += `<tr><td><strong>${field.label}</strong></td>`;

            if (field.type === "image") {
                if (uploadedImages[field.id]) {
                    const imageData = uploadedImages[field.id];
                    const imageExtension = imageData.substring(imageData.indexOf("/") + 1, imageData.indexOf(";"));
                    const imageName = `${field.label.replace(/[^a-z0-9]/gi, "_")}.${imageExtension}`;
                    const base64Data = imageData.split(",")[1];
                    imagesFolder.file(imageName, base64Data, { base64: true });
                    htmlContent += `<td>See: images/${imageName}</td>`;
                } else {
                    htmlContent += `<td>[No image uploaded]</td>`;
                }
                htmlContent += `<td>N/A</td><td>N/A</td>`;
            } else {
                const displayValue = value;
                htmlContent += `<td>${displayValue}</td><td>${charCount}</td><td>${maxChars}</td>`;
            }

            htmlContent += `</tr>`;
        });

        htmlContent += `
    </table>
</body>
</html>`;

        zip.file(finalProjectName + ".xls", htmlContent);

        // 2. Generate PDF of email preview
        const previewContent = document.getElementById('preview-content');
        if (previewContent) {
            const clonedPreview = previewContent.cloneNode(true);
            
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.width = '600px';
            tempContainer.appendChild(clonedPreview);
            document.body.appendChild(tempContainer);

            try {
                // Use html2canvas with allowTaint to handle images
                const canvas = await html2canvas(clonedPreview, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                // Create PDF using jsPDF
                const { jsPDF } = window.jspdf;
                const imgWidth = 210; // A4 width in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const imgData = canvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                
                const pdfBlob = pdf.output('blob');
                zip.file(finalProjectName + "-preview.pdf", pdfBlob);

            } finally {
                document.body.removeChild(tempContainer);
            }
        }

        // 3. Save to My Designs
        const zipBlob = await zip.generateAsync({ type: "blob" });
        
        // Convert blob to base64 for storage
        const reader = new FileReader();
        reader.onloadend = async function() {
            const base64data = reader.result;
            
            // Create export entry in My Designs with .zip extension
            const exportKey = 'email-export-' + Date.now();
            const exportData = {
                projectName: finalProjectName + ".zip",
                exportType: "zip",
                fileData: base64data,
                fileName: finalProjectName + ".zip",
                sourceProject: window.currentLocalStorageKey || window.currentProjectName,
                exportDate: new Date().toISOString(),
                isExport: true
            };
            
            localStorage.setItem(exportKey, JSON.stringify(exportData));
            
            // Add to selected export folder (or current folder as fallback)
            if (selectedExportFolder && typeof addItemToFolder === 'function') {
                addItemToFolder(selectedExportFolder, exportKey);
            } else if (typeof navigationHistory !== 'undefined' && typeof getCurrentFolderId === 'function') {
                // Fallback: Add to current folder if no folder selected
                const currentFolderId = getCurrentFolderId();
                if (currentFolderId && typeof addItemToFolder === 'function') {
                    addItemToFolder(currentFolderId, exportKey);
                }
            }
            
            alert("Export package saved to My Designs!\n\nIncludes:\n• Excel brief\n• Email preview PDF\n• Images folder");
            
            // Return to folder view
            goBackFromBuilder();
        };
        reader.readAsDataURL(zipBlob);

    } catch (err) {
        console.error("Export error:", err);
        alert("Error creating export package: " + err.message);
    }
}



async function exportAsHTML() {
    if(!currentTemplate) {
        alert("Please select a template first");
        closeExportModal();
        return;
    }
    
    // Use current project name exactly as it is
    const projectName = window.currentProjectName || "email-brief";
    
    // Generate HTML preview content
    const previewContainer = document.getElementById('email-preview-content');
    if (!previewContainer) {
        alert("Preview not available");
        closeExportModal();
        return;
    }
    
    const htmlContent = previewContainer.innerHTML;
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
    
    const htmlBlob = new Blob([fullHTML], { type: 'text/html' });
    
    // Convert blob to base64 for storage
    const reader = new FileReader();
    reader.onloadend = async function() {
        const base64data = reader.result;
        
        // Create export entry in My Designs
        const exportKey = 'email-export-' + Date.now();
        const exportData = {
            projectName: projectName + "-email.html",
            exportType: "html",
            fileData: base64data,
            fileName: projectName + "-email.html",
            sourceProject: window.currentLocalStorageKey || window.currentProjectName,
            exportDate: new Date().toISOString(),
            isExport: true
        };
        
        localStorage.setItem(exportKey, JSON.stringify(exportData));
        
        // Add to selected export folder (or current folder as fallback)
        if (selectedExportFolder && typeof addItemToFolder === 'function') {
            addItemToFolder(selectedExportFolder, exportKey);
        } else if (typeof navigationHistory !== 'undefined' && typeof getCurrentFolderId === 'function') {
            // Fallback: Add to current folder if no folder selected
            const currentFolderId = getCurrentFolderId();
            if (currentFolderId && typeof addItemToFolder === 'function') {
                addItemToFolder(currentFolderId, exportKey);
            }
        }
        
        alert("HTML export saved to current folder!");
        closeExportModal();
        
        // Return to folder view
        goBackFromBuilder();
    };
    reader.readAsDataURL(htmlBlob);
}

// ============================================
// DOWNLOAD EXPORT FROM MY DESIGNS
// ============================================

function downloadExportFile(exportKey) {
    try {
        const exportData = JSON.parse(localStorage.getItem(exportKey));
        if (!exportData || !exportData.isExport) {
            alert("Invalid export file");
            return;
        }
        
        // Convert base64 back to blob
        const byteString = atob(exportData.fileData.split(',')[1]);
        const mimeString = exportData.fileData.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        
        // Trigger download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = exportData.fileName;
        link.click();
        
    } catch(err) {
        console.error("Error downloading export:", err);
        alert("Error downloading file: " + err.message);
    }
}

// ============================================
// INITIALIZE APP ON LOAD
// ============================================
document.addEventListener('DOMContentLoaded', init);

// ============================================
// SAVE TO MY DESIGNS FUNCTION (WITH INDEXEDDB)
// ============================================


async function saveToMyDesigns() {
    console.log("=== saveToMyDesigns called ===");
    
    const projectName = document.getElementById('project-name-input').value.trim();
    console.log("Project name:", projectName);
    
    if(!projectName) {
        alert('Please enter a project name');
        return;
    }
    
    console.log("currentTemplate:", currentTemplate);
    console.log("templates object:", templates);
    
    const templateKey = Object.keys(templates).find(key => templates[key] === currentTemplate);
    console.log("templateKey:", templateKey);
    
    // Capture creative direction dropdown value
    const creativeDirectionValue = document.getElementById("creative-direction-top").value;
    console.log("creativeDirectionValue:", creativeDirectionValue);
    
    // Create new storage key or use existing one
    const storageKey = window.currentLocalStorageKey || ('email-project-' + Date.now());
    console.log("storageKey:", storageKey);
    
    try {
        // Save text data to localStorage (small)
        const saveData = {
            projectName: projectName,
            templateId: templateKey,
            formData: formData,
            creativeDirection: creativeDirectionValue,
            savedDate: new Date().toISOString(),
            hasImages: Object.keys(uploadedImages).length > 0
        };
        
        localStorage.setItem(storageKey, JSON.stringify(saveData));
        console.log("Saved to localStorage successfully");
        
        // Save images to IndexedDB (large binary data)
        if (Object.keys(uploadedImages).length > 0) {
            await saveProjectImagesToIndexedDB(storageKey, uploadedImages);
            console.log("Saved images to IndexedDB successfully");
        }
        
        // Add to current folder if this is a NEW save (not updating existing)
        if (!window.currentLocalStorageKey && typeof navigationHistory !== 'undefined' && typeof getCurrentFolderId === 'function') {
            const currentFolderId = getCurrentFolderId();
            if (currentFolderId && typeof addItemToFolder === 'function') {
                addItemToFolder(currentFolderId, storageKey);
                console.log("Added new design to current folder:", currentFolderId);
            }
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
    } catch(err) {
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
        
        // Check if this is an export file
        const itemData = JSON.parse(localStorage.getItem(storageKey));
        if (itemData && itemData.isExport) {
            // This is an export file - download it instead of opening
            downloadExportFile(storageKey);
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
        
        // Load text data from localStorage
        const saveData = itemData;
        console.log("saveData:", saveData);
        
        // Store tracking variables
        window.currentLocalStorageKey = storageKey;
        window.currentProjectName = saveData.projectName;
        window.currentFileHandle = null; // Clear file handle
        
        // Load template
        currentTemplate = templates[saveData.templateId];
        console.log("currentTemplate:", currentTemplate);
        formData = saveData.formData;
        console.log("formData:", formData);
        
        // Load images from IndexedDB if they exist
        if (saveData.hasImages) {
            uploadedImages = await loadProjectImagesFromIndexedDB(storageKey);
            console.log("Loaded images from IndexedDB:", uploadedImages);
            console.log("Number of images loaded:", Object.keys(uploadedImages).length);
        } else {
            uploadedImages = {};
            console.log("No images to load");
        }
        
        document.getElementById("action-buttons").classList.add("active");
        document.getElementById("creative-direction-section").classList.add("active");
        
        // Restore creative direction dropdown if saved
        if(saveData.creativeDirection) {
            document.getElementById("creative-direction-top").value = saveData.creativeDirection;
        }
        
        console.log("About to generate form...");
        generateForm();
        
        // Wait for form to be fully generated before populating
        console.log("Waiting for form generation to complete...");
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log("About to populate form fields...");
        populateFormFields();
        console.log("Form fields populated");
        
        // Update title display
        setTimeout(() => {
            const builderTitle = document.getElementById('builder-template-title');
            const projectInfoDisplay = document.getElementById('project-info-display');
            const projectNameDisplay = document.getElementById('project-name-display');
            
            if (builderTitle && projectInfoDisplay && projectNameDisplay) {
                builderTitle.textContent = saveData.projectName;
                const templateName = templates[saveData.templateId]?.name || 'Unknown Template';
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
    } catch(err) {
        console.error("Error loading design:", err);
        alert("Error loading project: " + err.message);
    }
}

// ============================================
// FOLDER HIERARCHY FOR SAVE MODAL
// ============================================

let selectedSaveFolder = null; // Track which folder is selected for saving
let selectedSaveAsFolder = null; // Track which folder is selected for "Save As"

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

function populateFolderHierarchy() {
    const hierarchyDiv = document.getElementById('folder-hierarchy');
    if (!hierarchyDiv) return;
    
    hierarchyDiv.innerHTML = '';
    selectedSaveFolder = null; // Reset selection
    
    // Add root level option
    const rootItem = document.createElement('div');
    rootItem.className = 'folder-hierarchy-item selected'; // Default to root selected
    rootItem.innerHTML = '<span>📁 My Designs (Root)</span>';
    rootItem.onclick = () => selectSaveFolder(null, rootItem);
    hierarchyDiv.appendChild(rootItem);
    
    // Get all folders - EXPLICITLY exclude 'templates' folders
    const folders = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('email-folder-') && !key.includes('trashed')) {
            try {
                const folder = JSON.parse(localStorage.getItem(key));
                // Only include folders that are NOT template folders
                if (folder.pageType !== 'templates') {
                    folders.push({ key, folder });
                }
            } catch (e) {
                console.error('Error loading folder:', e);
            }
        }
    }
    
    // Sort folders by name
    folders.sort((a, b) => a.folder.name.localeCompare(b.folder.name));
    
    // Add root level folders only (collapsed by default)
    const rootFolders = folders.filter(f => 
        !f.folder.parentPath || f.folder.parentPath.length === 0
    );
    
    rootFolders.forEach(({ key, folder }) => {
        const folderItem = createFolderHierarchyItem(key, folder, 0, folders);
        hierarchyDiv.appendChild(folderItem);
    });
}

// Populate folder hierarchy for Save As modal
function populateFolderHierarchySaveAs() {
    const hierarchyDiv = document.getElementById('folder-hierarchy-saveas');
    if (!hierarchyDiv) return;
    
    hierarchyDiv.innerHTML = '';
    selectedSaveAsFolder = null; // Reset selection
    
    // Add root level option
    const rootItem = document.createElement('div');
    rootItem.className = 'folder-hierarchy-item selected'; // Default to root selected
    rootItem.innerHTML = '<span>📁 My Designs (Root)</span>';
    rootItem.onclick = () => selectSaveAsFolder(null, rootItem);
    hierarchyDiv.appendChild(rootItem);
    
    // Get all folders - EXPLICITLY exclude 'templates' folders
    const folders = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('email-folder-') && !key.includes('trashed')) {
            try {
                const folder = JSON.parse(localStorage.getItem(key));
                // Only include folders that are NOT template folders
                if (folder.pageType !== 'templates') {
                    folders.push({ key, folder });
                }
            } catch (e) {
                console.error('Error loading folder:', e);
            }
        }
    }
    
    // Sort folders by name
    folders.sort((a, b) => a.folder.name.localeCompare(b.folder.name));
    
    // Add root level folders only (collapsed by default)
    const rootFolders = folders.filter(f => 
        !f.folder.parentPath || f.folder.parentPath.length === 0
    );
    
    rootFolders.forEach(({ key, folder }) => {
        const folderItem = createFolderHierarchyItemSaveAs(key, folder, 0, folders);
        hierarchyDiv.appendChild(folderItem);
    });
}

function createFolderHierarchyItem(folderId, folder, level, allFolders) {
    const item = document.createElement('div');
    item.className = 'folder-hierarchy-item';
    item.dataset.folderId = folderId;
    item.dataset.level = level;
    
    if (level === 1) item.className += ' nested';
    if (level === 2) item.className += ' double-nested';
    
    const folderColor = folder.color || 'purple';
    
    // Check if this folder has subfolders
    const hasSubfolders = checkForSubfolders(folderId, allFolders);
    
    // Add carat if there are subfolders
    const carat = hasSubfolders ? 
        '<span class="folder-carat" onclick="event.stopPropagation(); toggleFolderExpansion(event, \'' + folderId + '\');">▶</span>' : 
        '<span class="folder-carat-placeholder"></span>';
    
    item.innerHTML = `
        ${carat}
        <img src="assets/images/folder-${folderColor}.png" class="folder-hierarchy-icon" alt="Folder">
        <span>${folder.name}</span>
    `;
    
    item.onclick = (e) => {
        if (!e.target.classList.contains('folder-carat')) {
            selectSaveFolder(folderId, item);
        }
    };
    
    return item;
}

function createFolderHierarchyItemSaveAs(folderId, folder, level, allFolders) {
    const item = document.createElement('div');
    item.className = 'folder-hierarchy-item';
    item.dataset.folderId = folderId;
    item.dataset.level = level;
    
    if (level === 1) item.className += ' nested';
    if (level === 2) item.className += ' double-nested';
    
    const folderColor = folder.color || 'purple';
    
    // Check if this folder has subfolders
    const hasSubfolders = checkForSubfolders(folderId, allFolders);
    
    // Add carat if there are subfolders
    const carat = hasSubfolders ? 
        '<span class="folder-carat" onclick="event.stopPropagation(); toggleFolderExpansionSaveAs(event, \'' + folderId + '\');">▶</span>' : 
        '<span class="folder-carat-placeholder"></span>';
    
    item.innerHTML = `
        ${carat}
        <img src="assets/images/folder-${folderColor}.png" class="folder-hierarchy-icon" alt="Folder">
        <span>${folder.name}</span>
    `;
    
    item.onclick = (e) => {
        if (!e.target.classList.contains('folder-carat')) {
            selectSaveAsFolder(folderId, item);
        }
    };
    
    return item;
}

function selectSaveFolder(folderId, element) {
    // Remove previous selection
    document.querySelectorAll('#folder-hierarchy .folder-hierarchy-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked item
    element.classList.add('selected');
    selectedSaveFolder = folderId;
}

function selectSaveAsFolder(folderId, element) {
    // Remove previous selection
    document.querySelectorAll('#folder-hierarchy-saveas .folder-hierarchy-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked item
    element.classList.add('selected');
    selectedSaveAsFolder = folderId;
}

function checkForSubfolders(parentId, allFolders) {
    return allFolders.some(f => {
        const parentPath = f.folder.parentPath || [];
        return parentPath.some(p => p.id === parentId);
    });
}

function toggleFolderExpansion(event, folderId) {
    event.stopPropagation();
    const carat = event.target;
    const parentItem = carat.closest('.folder-hierarchy-item');
    
    // Check if already expanded
    const isExpanded = carat.classList.contains('expanded');
    
    if (isExpanded) {
        // Collapse: Remove all subfolders
        carat.classList.remove('expanded');
        carat.textContent = '▶';
        removeSubfolders(folderId, 'folder-hierarchy');
    } else {
        // Expand: Add subfolders
        carat.classList.add('expanded');
        carat.textContent = '▼';
        addSubfolders(folderId, parentItem, 'folder-hierarchy');
    }
}

function toggleFolderExpansionSaveAs(event, folderId) {
    event.stopPropagation();
    const carat = event.target;
    const parentItem = carat.closest('.folder-hierarchy-item');
    
    // Check if already expanded
    const isExpanded = carat.classList.contains('expanded');
    
    if (isExpanded) {
        // Collapse: Remove all subfolders
        carat.classList.remove('expanded');
        carat.textContent = '▶';
        removeSubfolders(folderId, 'folder-hierarchy-saveas');
    } else {
        // Expand: Add subfolders
        carat.classList.add('expanded');
        carat.textContent = '▼';
        addSubfolders(folderId, parentItem, 'folder-hierarchy-saveas');
    }
}

function removeSubfolders(parentId, hierarchyDivId) {
    const hierarchyDiv = document.getElementById(hierarchyDivId);
    const items = Array.from(hierarchyDiv.querySelectorAll('.folder-hierarchy-item'));
    
    // Find all items that should be removed (children of parentId)
    items.forEach(item => {
        if (item.dataset.parentFolderId === parentId) {
            // Also remove its children recursively
            removeSubfolders(item.dataset.folderId, hierarchyDivId);
            item.remove();
        }
    });
}

function addSubfolders(parentId, parentElement, hierarchyDivId) {
    const hierarchyDiv = document.getElementById(hierarchyDivId);
    
    // Get all folders
    const folders = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('email-folder-') && !key.includes('trashed')) {
            try {
                const folder = JSON.parse(localStorage.getItem(key));
                if (folder.pageType !== 'templates') {
                    folders.push({ key, folder });
                }
            } catch (e) {
                console.error('Error loading folder:', e);
            }
        }
    }
    
    // Find subfolders
    const subfolders = folders.filter(f => {
        const parentPath = f.folder.parentPath || [];
        return parentPath.some(p => p.id === parentId);
    });
    
    // Sort by name
    subfolders.sort((a, b) => a.folder.name.localeCompare(b.folder.name));
    
    // Get parent level
    const parentLevel = parseInt(parentElement.dataset.level);
    const newLevel = parentLevel + 1;
    
    // Insert subfolders after parent
    const parentIndex = Array.from(hierarchyDiv.children).indexOf(parentElement);
    
    // Determine which creation function to use
    let creationFunction;
    if (hierarchyDivId === 'folder-hierarchy') {
        creationFunction = createFolderHierarchyItem;
    } else if (hierarchyDivId === 'folder-hierarchy-saveas') {
        creationFunction = createFolderHierarchyItemSaveAs;
    } else if (hierarchyDivId === 'folder-hierarchy-export') {
        creationFunction = createFolderHierarchyItemExport;
    }
    
    subfolders.forEach(({ key, folder }, index) => {
        const folderItem = creationFunction(key, folder, newLevel, folders);
        folderItem.dataset.parentFolderId = parentId;
        
        // Insert at the correct position
        const insertIndex = parentIndex + 1 + index;
        if (insertIndex < hierarchyDiv.children.length) {
            hierarchyDiv.insertBefore(folderItem, hierarchyDiv.children[insertIndex]);
        } else {
            hierarchyDiv.appendChild(folderItem);
        }
    });
}

// Update the saveToMyDesigns function to use selectedSaveFolder
async function saveToMyDesignsWithFolder() {
    console.log("=== saveToMyDesigns called ===");
    
    const projectName = document.getElementById('project-name-input').value.trim();
    console.log("Project name:", projectName);
    console.log("Selected folder:", selectedSaveFolder);
    
    if(!projectName) {
        alert('Please enter a project name');
        return;
    }
    
    console.log("currentTemplate:", currentTemplate);
    console.log("templates object:", templates);
    
    const templateKey = Object.keys(templates).find(key => templates[key] === currentTemplate);
    console.log("templateKey:", templateKey);
    
    // Capture creative direction dropdown value
    const creativeDirectionValue = document.getElementById("creative-direction-top").value;
    console.log("creativeDirectionValue:", creativeDirectionValue);
    
    // Create new storage key or use existing one
    const storageKey = window.currentLocalStorageKey || ('email-project-' + Date.now());
    console.log("storageKey:", storageKey);
    
    try {
        // Save text data to localStorage (small)
        const saveData = {
            projectName: projectName,
            templateId: templateKey,
            formData: formData,
            creativeDirection: creativeDirectionValue,
            savedDate: new Date().toISOString(),
            hasImages: Object.keys(uploadedImages).length > 0
        };
        
        localStorage.setItem(storageKey, JSON.stringify(saveData));
        console.log("Saved to localStorage successfully");
        
        // Save images to IndexedDB (large binary data)
        if (Object.keys(uploadedImages).length > 0) {
            await saveProjectImagesToIndexedDB(storageKey, uploadedImages);
            console.log("Saved images to IndexedDB successfully");
        }
        
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
    } catch(err) {
        console.error("Error in saveToMyDesigns:", err);
        alert("Error saving project: " + err.message);
    }
}

// Replace the original saveToMyDesigns function call with the new one
window.saveToMyDesigns = saveToMyDesignsWithFolder;
