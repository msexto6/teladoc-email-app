// SPRINT F: Added isDesignLoading guards to prevent image operations during design loads
// Track currently selected image drop zone for paste functionality
let selectedImageZone = null;

// Maximum allowed image file size: 500 KB
const MAX_IMAGE_FILE_SIZE_BYTES = 500 * 1024;

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
    
    function displayImage(imageUrl) {
        zone.innerHTML = `
            <div class="image-preview-container">
                <img src="${imageUrl}" class="image-preview">
                <div class="image-hover-hint">Double-click to replace</div>
                <button type="button" class="image-remove-btn" onclick="removeImage('${field.id}')">&times;</button>
            </div>
        `;
        zone.classList.add('has-image');
        // Mark as changed
        if (typeof markFormAsDirty === 'function') {
            markFormAsDirty();
        }
    }
    
    // Helper function to process image file and upload to Firebase Storage
    async function processImageFile(file) {
        // SPRINT F: Guard during design load
        if (typeof window.isDesignLoading === 'function' && window.isDesignLoading()) {
            console.log('⏳ Ignoring image upload during design load');
            return;
        }
        
        // LOAD PIPELINE V2: Guard during project load
        if (window.isLoadingProject) {
            console.log('⏳ Ignoring image upload during project load');
            return;
        }
        
        // Client-side file size guard
        if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
            const maxKb = Math.round(MAX_IMAGE_FILE_SIZE_BYTES / 1024);
            const actualKb = Math.round(file.size / 1024);

            console.warn(
                `Image too large: ${actualKb} KB (limit is ${maxKb} KB). Upload blocked.`
            );

            // Friendly UI message in the drop zone
            zone.innerHTML = `
                <div class="image-uploading">
                    <div class="upload-text" style="color:#e74c3c;">
                        Image too large (${actualKb} KB). Max allowed is ${maxKb} KB.
                        Please upload a smaller, optimized image.
                    </div>
                </div>
            `;

            // Reset back to normal UI after a short delay
            setTimeout(() => {
                zone.innerHTML = `
                    <svg class="drop-zone-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <div class="drop-zone-text">Drop image, paste or double-click</div>
                `;
                zone.classList.remove('has-image');
            }, 3000);

            return; // Do not upload
        }
        
        try {
            // Show loading state
            zone.innerHTML = `
                <div class="image-uploading">
                    <div class="upload-spinner"></div>
                    <div class="upload-text">Uploading...</div>
                </div>
            `;
            
            // Upload to Firebase Storage and get URL
            const downloadUrl = await EmailBriefingDB.uploadImage(file);
            
            // Store URL instead of Base64
            uploadedImages[field.id] = downloadUrl;
            displayImage(downloadUrl);
            updatePreview();
            
        } catch (error) {
            console.error('Failed to upload image:', error);
            // Reset zone on error
            zone.innerHTML = `
                <svg class="drop-zone-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                </svg>
                <div class="drop-zone-text" style="color: #e74c3c;">Upload failed. Please try again.</div>
            `;
            zone.classList.remove('has-image');
            setTimeout(() => {
                zone.querySelector('.drop-zone-text').innerHTML = 'Drop image, paste or double-click';
                zone.querySelector('.drop-zone-text').style.color = '';
            }, 3000);
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
    zone.addEventListener("paste", async (e) => {
        // SPRINT F: Guard during design load
        if (typeof window.isDesignLoading === 'function' && window.isDesignLoading()) {
            console.log('⏳ Ignoring paste during design load');
            return;
        }
        
        // LOAD PIPELINE V2: Guard during project load
        if (window.isLoadingProject) {
            console.log('⏳ Ignoring paste during project load');
            return;
        }
        
        e.preventDefault();
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                // Upload to Firebase Storage instead of converting to Base64
                await processImageFile(blob);
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
    
    zone.addEventListener("drop", async (e) => {
        // SPRINT F: Guard during design load
        if (typeof window.isDesignLoading === 'function' && window.isDesignLoading()) {
            console.log('⏳ Ignoring drop during design load');
            e.preventDefault();
            return;
        }
        
        // LOAD PIPELINE V2: Guard during project load
        if (window.isLoadingProject) {
            console.log('⏳ Ignoring drop during project load');
            e.preventDefault();
            return;
        }
        
        e.preventDefault();
        zone.classList.remove("drag-active");
        
        const file = e.dataTransfer.files[0];
        if(file && file.type.startsWith('image/')) {
            // Upload to Firebase Storage instead of converting to Base64
            await processImageFile(file);
        }
    });
    
    input.addEventListener("change", async (e) => {
        // SPRINT F: Guard during design load
        if (typeof window.isDesignLoading === 'function' && window.isDesignLoading()) {
            console.log('⏳ Ignoring file input change during design load');
            return;
        }
        
        // LOAD PIPELINE V2: Guard during project load
        if (window.isLoadingProject) {
            console.log('⏳ Ignoring file input change during project load');
            return;
        }
        
        const file = e.target.files[0];
        if(file) {
            // Upload to Firebase Storage instead of converting to Base64
            await processImageFile(file);
        }
    });
    
    div.appendChild(zone);
    div.appendChild(input);
    return div;
}


function removeImage(fieldId) {
    // SPRINT F: Guard during design load
    if (typeof window.isDesignLoading === 'function' && window.isDesignLoading()) {
        console.log('⏳ Ignoring image removal during design load');
        return;
    }
    
    // LOAD PIPELINE V2: Guard during project load
    if (window.isLoadingProject) {
        console.log('⏳ Ignoring image removal during project load');
        return;
    }
    
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
    zone.classList.remove('has-image');
    updatePreview();
    
    // Mark as changed
    if (typeof markFormAsDirty === 'function') {
        markFormAsDirty();
    }
}

// ============================================
// BACKWARD COMPATIBILITY FOR BASE64 IMAGES
// ============================================

// Helper function to check if a string is a Base64 data URL
function isBase64Image(str) {
    return str && typeof str === 'string' && str.startsWith('data:image');
}

// Function to restore images when loading a design
function restoreUploadedImages(images) {
    if (!images) return;
    
    console.log('🖼️ restoreUploadedImages called with', Object.keys(images).length, 'images');
    
    Object.keys(images).forEach(fieldId => {
        const imageData = images[fieldId];
        if (imageData) {
            // Store the image data (URL or Base64)
            uploadedImages[fieldId] = imageData;
            
            // Display the image
            const zone = document.getElementById(fieldId + "-zone");
            if (zone) {
                zone.innerHTML = `
                    <div class="image-preview-container">
                        <img src="${imageData}" class="image-preview">
                        <div class="image-hover-hint">Double-click to replace</div>
                        <button type="button" class="image-remove-btn" onclick="removeImage('${fieldId}')">&times;</button>
                    </div>
                `;
                zone.classList.add('has-image');
                console.log(`   ✅ Restored image in dropzone: ${fieldId}-zone`);
            } else {
                console.warn(`   ⚠️ Dropzone not found: ${fieldId}-zone`);
            }
        }
    });
}

// ============================================
// SYNC IMAGE DROPZONES FROM STATE
// ============================================

/**
 * Syncs all image dropzone UI elements with the current window.uploadedImages state.
 * This function is called after form generation to ensure dropzones display correctly
 * when loading a saved design.
 * 
 * @param {Object} [imagesState] - Optional images object. Defaults to window.uploadedImages.
 */
function syncImageDropzonesFromState(imagesState) {
    const images = imagesState || window.uploadedImages;
    
    if (!images || typeof images !== 'object') {
        console.log('🖼️ syncImageDropzonesFromState: No images to sync');
        return;
    }
    
    const imageCount = Object.keys(images).length;
    if (imageCount === 0) {
        console.log('🖼️ syncImageDropzonesFromState: uploadedImages is empty');
        return;
    }
    
    console.log(`🖼️ syncImageDropzonesFromState: Syncing ${imageCount} image(s) to dropzones`);
    
    let successCount = 0;
    let failCount = 0;
    
    Object.entries(images).forEach(([fieldId, imageUrl]) => {
        if (!imageUrl) {
            console.warn(`   ⚠️ Empty URL for fieldId: ${fieldId}`);
            return;
        }
        
        // Find the dropzone by ID pattern: fieldId + "-zone"
        const zone = document.getElementById(fieldId + "-zone");
        
        if (!zone) {
            console.warn(`   ⚠️ Dropzone not found: ${fieldId}-zone (template may have changed)`);
            failCount++;
            return;
        }
        
        // Update the dropzone UI to show the image
        zone.innerHTML = `
            <div class="image-preview-container">
                <img src="${imageUrl}" class="image-preview">
                <div class="image-hover-hint">Double-click to replace</div>
                <button type="button" class="image-remove-btn" onclick="removeImage('${fieldId}')">&times;</button>
            </div>
        `;
        zone.classList.add('has-image');
        
        console.log(`   ✅ Synced dropzone: ${fieldId}-zone`);
        successCount++;
    });
    
    console.log(`🖼️ syncImageDropzonesFromState complete: ${successCount} synced, ${failCount} failed`);
}

// ============================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================

window.restoreUploadedImages = restoreUploadedImages;
window.syncImageDropzonesFromState = syncImageDropzonesFromState;
window.removeImage = removeImage;
window.isBase64Image = isBase64Image;

// ============================================
// FORM INPUT HANDLING
// ============================================
