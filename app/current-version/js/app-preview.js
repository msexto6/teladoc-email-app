// PHASE 2 TASK C2: Updated to use synced lexical globals with fallbacks
// PHASE 4 TASK K1: Added getPreviewHtml() for export reuse
// SPRINT E: Added Standard Template preview routing
function updatePreview() {
    const content = document.getElementById("preview-content");
    if (!content) return;

    // Prefer lexical globals, but fall back to window in case something external sets them
    const activeTemplate = currentTemplate || window.currentTemplate || null;
    const activeTemplateKey = currentTemplateKey || window.currentTemplateKey || null;

    // Define placeholder HTML
    const PREVIEW_PLACEHOLDER_HTML = '<p style="text-align:center;padding:80px 20px;color:#9B8FC7;">Select a template to see preview</p>';

    if (!activeTemplate) {
        content.innerHTML = PREVIEW_PLACEHOLDER_HTML;
        return;
    }
    
    // Resolve template key - prefer activeTemplateKey, fallback to lookup
    let templateKey = activeTemplateKey;
    if (!templateKey && activeTemplate) {
        templateKey = Object.keys(templates).find(key => templates[key] === activeTemplate);
    }
    
    let html = "";
    html += '<div class="preview-logo"><img src="assets/images/teladoc-logo.png" alt="Teladoc Health"></div>';
    
    // Route to the appropriate template renderer
    if(templateKey === 'webinar-reg-confirmation') {
        html += renderWebinarRegConfirmation(formData, uploadedImages);
    } else if(templateKey === 'webinar-invite') {
        html += renderWebinarInvite(formData, uploadedImages);
    } else if(templateKey === 'webinar-reminder') {
        html += renderWebinarReminderPreview(formData, uploadedImages);
    } else if(templateKey === 'webinar-post-attendee') {
        html += renderWebinarPostAttendeePreview(formData, uploadedImages);
    } else if(templateKey === 'webinar-post-noshow') {
        html += renderWebinarPostNoshowPreview(formData, uploadedImages);
    } else if(templateKey === 'education-drip-employer') {
        html += renderEducationDripEmployerPreview(formData);
    } else if(templateKey === 'education-drip-hp') {
        html += renderEducationDripHpPreview(formData, uploadedImages);
    } else if(templateKey === 'standard-template') {
        html += renderStandardTemplatePreview(formData, uploadedImages);
    } else if(templateKey === 'partner-essentials-nl') {
        html += renderPartnerEssentialsNlPreview(formData, uploadedImages);
    } else if(templateKey === 'consultant-connect-nl') {
        html += renderConsultantConnectNlPreview(formData, uploadedImages);
    } else if(templateKey === 'client-connections-nl') {
        html += renderClientConnectionsNlPreview(formData, uploadedImages);
    } else {
        html += renderDefaultTemplate();
    }
    
    content.innerHTML = html;
    
    // CRITICAL: Ensure ALL links in preview open in new tab (fixes old saved designs)
    ensureAllLinksOpenInNewTab(content);
}

// Post-processing function to add target="_blank" to all links in preview
function ensureAllLinksOpenInNewTab(container) {
    const links = container.querySelectorAll('a');
    links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
}

function renderDefaultTemplate() {
    let html = '<div class="preview-content-body">';
    html += '<p style="text-align:center;padding:40px 20px;color:#9B8FC7;">Preview for this template coming soon</p>';
    html += '</div>';
    return html;
}

// ============================================
// PHASE 4 TASK K1: EXPORT SUPPORT
// ============================================

/**
 * Get the current preview HTML for export purposes.
 * Returns the outerHTML of the preview-content element, which includes:
 * - Teladoc logo
 * - Template header/banner (if present)
 * - All email content
 * 
 * This ensures exports match the Live Preview exactly.
 * 
 * @returns {string|null} The preview HTML, or null if preview element not found
 */
function getPreviewHtml() {
    const previewRoot = document.getElementById('preview-content');
    if (!previewRoot) {
        console.error('Export failed: preview-content element not found');
        return null;
    }
    
    console.log('📄 getPreviewHtml: Extracting preview HTML for export');
    return previewRoot.outerHTML;
}

// Expose function globally for export module
window.getPreviewHtml = getPreviewHtml;

// ============================================
// MODAL HANDLING
// ============================================
