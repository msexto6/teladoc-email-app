// Track currently selected image drop zone for paste functionality
let selectedImageZone = null;

function createImageUpload(field) {
    const div = document.createElement("div");
    const zone = document.createElement("div");
    zone.className = "image-drop-zone";
    zone.id = field.id + "-zone";
    zone.tabIndex = 0; // Make focusable for paste events
    zone.innerHTML = `
        <svg class="drop-zone-icon" viewBox="0 0 24 24" fill="none">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
        </svg>
        <div class="drop-zone-text">Drop image, paste or double-click</div>
    `;
    
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    input.id = field.id + "-input";
    
    function displayImage(dataUrl) {
        zone.innerHTML = `
            <div class="image-preview-container">
                <img src="${dataUrl}" class="image-preview">
                <button type="button" class="image-remove-btn" onclick="removeImage('${field.id}')">&times;</button>
            </div>
        `;
        // Mark as changed
        if (typeof markFormAsDirty === 'function') {
            markFormAsDirty();
        }
    }
    
    // Single click - Select the zone for paste
    zone.addEventListener("click", (e) => {
        if(!e.target.classList.contains('image-remove-btn')) {
            // Select this zone for paste
            selectedImageZone = field.id;
            zone.focus();
            zone.classList.add('selected');
            
            // Remove selected class from other zones
            document.querySelectorAll('.image-drop-zone').forEach(z => {
                if (z.id !== zone.id) {
                    z.classList.remove('selected');
                }
            });
        }
    });
    
    // Double click - Open file dialog
    zone.addEventListener("dblclick", (e) => {
        if(!e.target.classList.contains('image-remove-btn')) {
            input.click();
        }
    });
    
    // Paste event handler
    zone.addEventListener("paste", (e) => {
        e.preventDefault();
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = function(evt) {
                    uploadedImages[field.id] = evt.target.result;
                    displayImage(evt.target.result);
                    updatePreview();
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    });
    
    // Focus/blur styling
    zone.addEventListener("focus", () => {
        zone.classList.add('focused');
    });
    
    zone.addEventListener("blur", () => {
        zone.classList.remove('focused', 'selected');
    });
    
    zone.addEventListener("dragover", e => {
        e.preventDefault();
        zone.classList.add("drag-active");
    });
    
    zone.addEventListener("dragleave", e => {
        e.preventDefault();
        zone.classList.remove("drag-active");
    });
    
    zone.addEventListener("drop", e => {
        e.preventDefault();
        zone.classList.remove("drag-active");
        
        const file = e.dataTransfer.files[0];
        if(file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                uploadedImages[field.id] = evt.target.result;
                displayImage(evt.target.result);
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });
    
    input.addEventListener("change", e => {
        const file = e.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                uploadedImages[field.id] = evt.target.result;
                displayImage(evt.target.result);
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });
    
    div.appendChild(zone);
    div.appendChild(input);
    return div;
}


function removeImage(fieldId) {
    delete uploadedImages[fieldId];
    const zone = document.getElementById(fieldId + "-zone");
    const input = document.getElementById(fieldId + "-input");
    if(input) input.value = "";
    zone.innerHTML = `
        <svg class="drop-zone-icon" viewBox="0 0 24 24" fill="none">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
        </svg>
        <div class="drop-zone-text">Drop image, paste or double-click</div>
    `;
    updatePreview();
    
    // Mark as changed
    if (typeof markFormAsDirty === 'function') {
        markFormAsDirty();
    }
}

// ============================================
// FORM INPUT HANDLING
// ============================================
