function updatePreview() {
    const content = document.getElementById("preview-content");
    if(!currentTemplate) {
        content.innerHTML = '<p style="text-align:center;padding:80px 20px;color:#9B8FC7;">Select a template to see preview</p>';
        return;
    }
    
    const templateKey = Object.keys(templates).find(key => templates[key] === currentTemplate);
    
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
// MODAL HANDLING
// ============================================
