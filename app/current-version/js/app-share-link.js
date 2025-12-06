/**
 * Email Briefing Tool - Shareable Link Module
 * Enables URL-based sharing of email designs
 * Version: 3.0 - Short Share IDs (Sprint B)
 * 
 * SPRINT B: Short Share Links with Firestore
 * - New scheme: #share=<shortId> stored in Firestore "shares" collection
 * - Backwards compatible with legacy #design=<base64> links
 * - Uses Load Pipeline v2 for unified loading
 * 
 * SPRINT I: Link Copied Modal
 * - Shows center modal overlay when link is copied
 * - Auto-dismisses after 2.5 seconds
 * - Manual close via Close button or Escape key
 */

// ============================================
// HELPER: SAFE BASE64 ENCODING (for legacy support)
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
// SPRINT I: LINK COPIED MODAL OVERLAY
// ============================================

function showLinkCopiedOverlay(autoDismissMs = 2500) {
    const overlay = document.getElementById('link-copied-overlay');
    if (!overlay) return;

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');

    // Optional auto-dismiss
    if (autoDismissMs && autoDismissMs > 0) {
        window.clearTimeout(window.__linkOverlayTimer);
        window.__linkOverlayTimer = window.setTimeout(() => {
            hideLinkCopiedOverlay();
        }, autoDismissMs);
    }
}

function hideLinkCopiedOverlay() {
    const overlay = document.getElementById('link-copied-overlay');
    if (!overlay) return;

    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    window.clearTimeout(window.__linkOverlayTimer);
}

function attachLinkCopiedOverlayEvents() {
    const closeBtn = document.getElementById('link-overlay-close');
    if (!closeBtn) return;

    closeBtn.addEventListener('click', () => {
        hideLinkCopiedOverlay();
    });

    // Optional: escape key closes it
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const overlay = document.getElementById('link-copied-overlay');
            if (overlay && overlay.classList.contains('active')) {
                hideLinkCopiedOverlay();
            }
        }
    });
}

// ============================================
// COPY LINK TO CLIPBOARD - SHORT SHARE IDs
// ============================================

async function copyShareableLink() {
    try {
        // Validate that we have a template selected
        if (!currentTemplate) {
            showToast('Please select a template first', 'error');
            return;
        }

        // Get the template key
        const templateKey = currentTemplateKey || Object.keys(templates).find(key => templates[key] === currentTemplate);
        
        if (!templateKey) {
            showToast('Error: Could not identify current template', 'error');
            return;
        }

        // Get creative direction
        const creativeDirectionValue = document.getElementById("creative-direction-top")?.value || '';

        // Build the share payload
        const payload = {
            templateKey: templateKey,
            formData: window.formData || {},
            uploadedImages: window.uploadedImages || {},
            creativeDirection: creativeDirectionValue,
            projectName: window.currentProjectName || 'Untitled Email'
        };

        console.log('=== Creating Share Link (Sprint B) ===');
        console.log('Template:', templateKey);
        console.log('Form fields:', Object.keys(payload.formData).length);
        console.log('Images:', Object.keys(payload.uploadedImages).length);

        // Get the current design key (may be null for unsaved designs)
        const designKey = window.currentLocalStorageKey || null;

        // Save to Firestore and get short ID
        let shareId;
        try {
            shareId = await EmailBriefingDB.saveShareSnapshot(designKey, payload);
        } catch (saveError) {
            console.error('Failed to save share snapshot:', saveError);
            showToast('Error creating link: ' + saveError.message, 'error');
            return;
        }

        // Build the shareable URL with short ID
        const baseUrl = window.location.href.split('#')[0].split('?')[0];
        const shareableUrl = `${baseUrl}#share=${shareId}`;

        console.log('✓ Share ID:', shareId);
        console.log('✓ URL length:', shareableUrl.length, 'characters');

        // Copy to clipboard
        await navigator.clipboard.writeText(shareableUrl);

        // SPRINT I: Show center modal overlay instead of toast
        showLinkCopiedOverlay();

        console.log('=== Share Link Created Successfully ===');
        
    } catch (err) {
        console.error('Error creating shareable link:', err);
        showToast('Error creating link: ' + err.message, 'error');
    }
}

// ============================================
// LOAD FROM URL HASH - SUPPORTS BOTH SCHEMES
// ============================================

async function loadFromUrlHash() {
    try {
        const hash = window.location.hash;
        
        if (!hash || hash.length < 2) {
            console.log('No hash found in URL');
            return false;
        }

        console.log('=== Checking URL Hash ===');
        console.log('Hash:', hash.substring(0, 50) + (hash.length > 50 ? '...' : ''));

        // Detect scheme type
        if (hash.includes('#share=')) {
            // NEW SCHEME: Short share ID
            return await loadFromShortShareId(hash);
        } else if (hash.includes('#design=')) {
            // LEGACY SCHEME: Base64 encoded data
            return await loadFromLegacyBase64(hash);
        } else {
            console.log('Unknown hash format, ignoring');
            return false;
        }
        
    } catch (err) {
        console.error('=== CRITICAL ERROR in loadFromUrlHash ===');
        console.error('Error type:', err.name);
        console.error('Error message:', err.message);
        console.error('Stack trace:', err.stack);
        showToast("We couldn't load that shared design. The link may be invalid or the design may have been removed.", 'error');
        navigateToSafeScreen();
        return false;
    }
}

// ============================================
// NEW SCHEME: SHORT SHARE ID (#share=ID)
// ============================================

async function loadFromShortShareId(hash) {
    try {
        // Extract the share ID
        const shareId = hash.split('#share=')[1];
        
        if (!shareId || shareId.length < 5) {
            console.error('✗ Invalid or empty share ID');
            showToast("We couldn't load that shared design. The link may be invalid.", 'error');
            navigateToSafeScreen();
            return false;
        }

        console.log('=== Loading from Short Share ID ===');
        console.log('Share ID:', shareId);

        // Load from Firestore
        const shareData = await EmailBriefingDB.loadShareSnapshot(shareId);
        
        if (!shareData) {
            console.error('✗ Share snapshot not found in Firestore');
            showToast("We couldn't load that shared design. The link may be invalid or the design may have been removed.", 'error');
            navigateToSafeScreen();
            return false;
        }

        console.log('✓ Share data loaded from Firestore');
        console.log('  Template:', shareData.templateKey);
        console.log('  Project:', shareData.projectName);
        console.log('  Created:', new Date(shareData.createdAt).toLocaleString());

        // Validate template exists
        if (!shareData.templateKey || !templates[shareData.templateKey]) {
            console.error('✗ Unknown template:', shareData.templateKey);
            console.log('Available templates:', Object.keys(templates));
            showToast('This link references an unknown template: ' + shareData.templateKey, 'error');
            navigateToSafeScreen();
            return false;
        }

        // Apply the loaded design using unified pipeline
        await applyShareLinkData({
            templateKey: shareData.templateKey,
            formData: shareData.formData,
            uploadedImages: shareData.uploadedImages,
            projectName: shareData.projectName,
            creativeDirection: shareData.creativeDirection,
            designKey: shareData.designKey
        });

        console.log('=== Short Share ID Load Complete ===');
        return true;
        
    } catch (err) {
        console.error('Error loading from short share ID:', err);
        showToast("We couldn't load that shared design. Please try again.", 'error');
        navigateToSafeScreen();
        return false;
    }
}

// ============================================
// LEGACY SCHEME: BASE64 ENCODED (#design=base64)
// ============================================

async function loadFromLegacyBase64(hash) {
    try {
        // Extract the base64 data
        const base64Data = hash.split('#design=')[1];
        
        if (!base64Data || base64Data.length < 10) {
            console.error('✗ Invalid or empty base64 data in hash');
            showToast('Invalid link format', 'error');
            navigateToSafeScreen();
            return false;
        }

        console.log('=== Loading from Legacy Base64 Link ===');
        console.log('Base64 data length:', base64Data.length, 'characters');

        // Decode from base64
        let jsonString;
        try {
            jsonString = safeBase64Decode(base64Data);
            console.log('✓ Decoding successful');
        } catch (decodeError) {
            console.error('✗ Decoding failed:', decodeError.message);
            showToast('Link format is corrupted. Please request a new link.', 'error');
            navigateToSafeScreen();
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
            showToast('Link data is malformed. Please generate a new link.', 'error');
            navigateToSafeScreen();
            return false;
        }

        // Validate required fields
        if (!shareData.template) {
            console.error('✗ Missing template field');
            showToast('Link is missing template information', 'error');
            navigateToSafeScreen();
            return false;
        }

        if (!templates[shareData.template]) {
            console.error('✗ Unknown template:', shareData.template);
            console.log('Available templates:', Object.keys(templates));
            showToast('This link references an unknown template: ' + shareData.template, 'error');
            navigateToSafeScreen();
            return false;
        }

        console.log('✓ Legacy link validation passed');

        // Convert legacy format to unified format and apply
        await applyShareLinkData({
            templateKey: shareData.template,
            formData: shareData.formData || {},
            uploadedImages: shareData.uploadedImages || {},
            projectName: shareData.projectName || 'Shared Email',
            creativeDirection: shareData.creativeDirection || '',
            designKey: null // Legacy links don't have design keys
        });

        console.log('=== Legacy Base64 Load Complete ===');
        return true;
        
    } catch (err) {
        console.error('Error loading from legacy base64:', err);
        showToast("We couldn't load that shared design. Please try again.", 'error');
        navigateToSafeScreen();
        return false;
    }
}

// ============================================
// UNIFIED APPLY FUNCTION (both schemes converge here)
// ============================================

async function applyShareLinkData({ templateKey, formData, uploadedImages, projectName, creativeDirection, designKey }) {
    try {
        const templateDefinition = templates[templateKey];

        // Set tracking variables
        window.currentProjectName = projectName || 'Shared Email';
        window.currentLocalStorageKey = null; // Share links don't have a storage key
        window.currentFileHandle = null;

        // Show the builder screen
        showScreen('builder');

        // Show action buttons and creative direction
        document.getElementById("action-buttons").classList.add("active");
        document.getElementById("creative-direction-section").classList.add("active");

        // Restore creative direction dropdown if saved
        if (creativeDirection) {
            const creativeDropdown = document.getElementById("creative-direction-top");
            if (creativeDropdown) {
                creativeDropdown.value = creativeDirection;
            }
        }

        // LOAD PIPELINE V2: Use centralized applyLoadedProject
        if (typeof window.beginProjectLoad === 'function') {
            window.beginProjectLoad("share-link");
        }

        await applyLoadedProject({
            source: "share-link",
            templateKey,
            templateDefinition,
            formData: formData || {},
            uploadedImages: uploadedImages || {},
            projectName: projectName || "Shared Design"
        });

        // Update title display after load completes
        setTimeout(() => {
            const builderTitle = document.getElementById('builder-template-title');
            const projectInfoDisplay = document.getElementById('project-info-display');
            const projectNameDisplay = document.getElementById('project-name-display');

            if (builderTitle && projectInfoDisplay && projectNameDisplay) {
                builderTitle.textContent = projectName || 'Shared Email';
                const templateName = templateDefinition.name || 'Unknown Template';
                projectNameDisplay.textContent = templateName;
                projectInfoDisplay.style.display = 'flex';
                console.log('✓ Title updated');
            }

            if (typeof updatePreview === 'function') {
                updatePreview();
                console.log('✓ Preview updated');
            }

            // Show success message
            showToast('Email loaded from shared link!', 'success');
        }, 200);
        
    } catch (err) {
        console.error('Error applying share link data:', err);
        throw err;
    }
}

// ============================================
// HELPER: NAVIGATE TO SAFE SCREEN
// ============================================

function navigateToSafeScreen() {
    // Clear the hash to prevent re-triggering on refresh
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
    }
    
    // Navigate to home or templates screen
    if (typeof showScreen === 'function') {
        showScreen('home');
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
    console.log('Share Link Module: Ready (v3.1 - Link Copied Modal)');
    
    // SPRINT I: Attach link copied overlay events
    attachLinkCopiedOverlayEvents();
    
    // Small delay to ensure other modules are loaded (especially Firebase)
    setTimeout(async () => {
        const loaded = await loadFromUrlHash();
        if (loaded) {
            console.log('Design loaded from URL hash');
        }
    }, 500);
});

// Export functions for global access
window.copyShareableLink = copyShareableLink;
window.showToast = showToast;
window.loadFromUrlHash = loadFromUrlHash;
window.showLinkCopiedOverlay = showLinkCopiedOverlay;
window.hideLinkCopiedOverlay = hideLinkCopiedOverlay;
