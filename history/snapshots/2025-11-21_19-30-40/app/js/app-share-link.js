/**
 * Email Briefing Tool - Shareable Link Module
 * Enables URL-based sharing of email designs
 * Version: 1.3 - Improved error handling and link validation
 */

// ============================================
// HELPER: SAFE BASE64 ENCODING
// ============================================

function safeBase64Encode(str) {
    try {
        // Convert string to UTF-8 bytes, then to base64
        const utf8Bytes = new TextEncoder().encode(str);
        const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
        return btoa(binaryString);
    } catch (e) {
        console.error('Encoding error:', e);
        throw new Error('Failed to encode data');
    }
}

function safeBase64Decode(base64) {
    // Try new encoding first
    try {
        const binaryString = atob(base64);
        const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
        const decoded = new TextDecoder().decode(bytes);
        
        // Validate it's valid JSON before returning
        JSON.parse(decoded);
        return decoded;
    } catch (e) {
        console.log('New decoding failed, trying legacy method...', e.message);
        
        // Fall back to old encoding method for backward compatibility
        try {
            const decoded = decodeURIComponent(escape(atob(base64)));
            // Validate it's valid JSON before returning
            JSON.parse(decoded);
            return decoded;
        } catch (e2) {
            console.error('Legacy decoding also failed:', e2.message);
            throw new Error('Unable to decode link data');
        }
    }
}

// ============================================
// COPY LINK TO CLIPBOARD
// ============================================

async function copyShareableLink() {
    try {
        // Validate that we have a template selected
        if (!currentTemplate) {
            showToast('Please select a template first', 'error');
            return;
        }

        // Get the template key
        const templateKey = Object.keys(templates).find(key => templates[key] === currentTemplate);
        
        if (!templateKey) {
            showToast('Error: Could not identify current template', 'error');
            return;
        }

        // Get creative direction
        const creativeDirectionValue = document.getElementById("creative-direction-top")?.value || '';

        // Create the share data object
        const shareData = {
            version: '1.3', // Add version for future compatibility
            template: templateKey,
            formData: formData || {},
            uploadedImages: uploadedImages || {},
            creativeDirection: creativeDirectionValue,
            projectName: window.currentProjectName || 'Untitled Email',
            timestamp: new Date().toISOString()
        };

        // Encode to base64 using safe encoding
        const jsonString = JSON.stringify(shareData);
        console.log('JSON data size:', jsonString.length, 'bytes');
        
        const base64Data = safeBase64Encode(jsonString);
        console.log('Base64 data size:', base64Data.length, 'bytes');

        // Build the shareable URL
        const baseUrl = window.location.href.split('#')[0].split('?')[0];
        const shareableUrl = `${baseUrl}#design=${base64Data}`;

        // Check URL length (some browsers have limits ~2000 chars)
        if (shareableUrl.length > 8000) {
            console.warn('Warning: URL is very long:', shareableUrl.length, 'characters');
            showToast('Link created, but may be too long for some systems', 'info');
        }

        // Copy to clipboard
        await navigator.clipboard.writeText(shareableUrl);

        // Show success message
        showToast('Link copied to clipboard!', 'success');

        console.log('Shareable link created successfully');
        console.log('Total length:', shareableUrl.length, 'characters');
        console.log('Preview:', shareableUrl.substring(0, 100) + '...');
        
    } catch (err) {
        console.error('Error creating shareable link:', err);
        showToast('Error creating link: ' + err.message, 'error');
    }
}

// ============================================
// LOAD FROM URL HASH
// ============================================

function loadFromUrlHash() {
    try {
        const hash = window.location.hash;
        
        // Check if there's a design hash parameter
        if (!hash || !hash.includes('#design=')) {
            console.log('No design hash found in URL');
            return false;
        }

        // Extract the base64 data
        const base64Data = hash.split('#design=')[1];
        if (!base64Data || base64Data.length < 10) {
            console.error('Invalid or empty base64 data in hash');
            showToast('Invalid link format', 'error');
            return false;
        }

        console.log('=== Loading Design from URL ===');
        console.log('Base64 data length:', base64Data.length, 'characters');
        console.log('First 50 chars:', base64Data.substring(0, 50) + '...');

        // Decode from base64 with error handling
        let jsonString;
        try {
            jsonString = safeBase64Decode(base64Data);
            console.log('✓ Decoding successful');
            console.log('JSON length:', jsonString.length, 'characters');
        } catch (decodeError) {
            console.error('✗ Decoding failed:', decodeError.message);
            showToast('Link format is corrupted. Please request a new link.', 'error');
            return false;
        }

        // Parse JSON
        let shareData;
        try {
            shareData = JSON.parse(jsonString);
            console.log('✓ JSON parsing successful');
            console.log('Data version:', shareData.version || 'legacy');
            console.log('Template:', shareData.template);
        } catch (parseError) {
            console.error('✗ JSON parsing failed:', parseError.message);
            console.error('JSON preview:', jsonString.substring(0, 100));
            showToast('Link data is malformed. Please generate a new link.', 'error');
            return false;
        }

        // Validate required fields
        if (!shareData.template) {
            console.error('✗ Missing template field');
            showToast('Link is missing template information', 'error');
            return false;
        }

        if (!templates[shareData.template]) {
            console.error('✗ Unknown template:', shareData.template);
            console.log('Available templates:', Object.keys(templates));
            showToast('This link references an unknown template: ' + shareData.template, 'error');
            return false;
        }

        console.log('✓ Validation passed');

        // Set loading flag
        isLoadingSavedDesign = true;

        // Load the template
        currentTemplate = templates[shareData.template];
        formData = shareData.formData || {};
        uploadedImages = shareData.uploadedImages || {};

        // Set project name
        window.currentProjectName = shareData.projectName || 'Shared Email';
        window.currentLocalStorageKey = null;
        window.currentFileHandle = null;

        console.log('✓ Data loaded into memory');

        // Show the builder screen
        showScreen('builder');

        // Show action buttons and creative direction
        document.getElementById("action-buttons").classList.add("active");
        document.getElementById("creative-direction-section").classList.add("active");

        // Restore creative direction dropdown if saved
        if (shareData.creativeDirection) {
            const creativeDropdown = document.getElementById("creative-direction-top");
            if (creativeDropdown) {
                creativeDropdown.value = shareData.creativeDirection;
            }
        }

        // Generate form with loaded data
        generateForm();

        console.log('✓ Form generated');

        // Wait a bit for form to be generated, then populate
        setTimeout(() => {
            try {
                populateFormFields();
                console.log('✓ Form fields populated');
                
                // Update title display
                const builderTitle = document.getElementById('builder-template-title');
                const projectInfoDisplay = document.getElementById('project-info-display');
                const projectNameDisplay = document.getElementById('project-name-display');

                if (builderTitle && projectInfoDisplay && projectNameDisplay) {
                    builderTitle.textContent = shareData.projectName || 'Shared Email';
                    const templateName = currentTemplate.name || 'Unknown Template';
                    projectNameDisplay.textContent = templateName;
                    projectInfoDisplay.style.display = 'flex';
                    console.log('✓ Title updated');
                }

                updatePreview();
                console.log('✓ Preview updated');

                // Show success message
                showToast('Email loaded from shared link!', 'success');
                console.log('=== Load Complete ===');

            } catch (populateError) {
                console.error('Error during population:', populateError);
                showToast('Link loaded but some fields may not display correctly', 'error');
            }
        }, 150);

        return true;
        
    } catch (err) {
        console.error('=== CRITICAL ERROR ===');
        console.error('Error type:', err.name);
        console.error('Error message:', err.message);
        console.error('Stack trace:', err.stack);
        showToast('Unable to load this link. Please generate a new one.', 'error');
        return false;
    }
}

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message, type = 'info') {
    // Check if toast container exists, if not create it
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Add icon based on type
    const icon = type === 'success' ? '✓' : 
                 type === 'error' ? '✕' : 
                 'ℹ';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 4 seconds (longer for error messages)
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// ============================================
// INITIALIZATION
// ============================================

// Try to load from URL hash on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Share Link Module: Ready');
    
    // Small delay to ensure other modules are loaded
    setTimeout(() => {
        const loaded = loadFromUrlHash();
        if (loaded) {
            console.log('Design loaded from URL hash');
        }
    }, 200);
});

// Export functions for global access
window.copyShareableLink = copyShareableLink;
window.showToast = showToast;
